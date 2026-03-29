use std::process::Command as StdCommand;
use tauri::command;

/// Invoke Claude CLI with working directory set to data/ so it only
/// discovers chef context (data/CLAUDE.md), not dev context (root CLAUDE.md).
#[command]
async fn invoke_claude(args: Vec<String>) -> Result<String, String> {
    // Tauri's CWD is src-tauri/, so go up one level to project root
    let data_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get cwd: {}", e))?
        .parent()
        .map(|p| p.join("data"))
        .unwrap_or_else(|| std::path::PathBuf::from("data"));

    if !data_dir.exists() {
        return Err(format!("Data directory not found: {:?}", data_dir));
    }

    let output = StdCommand::new("claude")
        .args(&args)
        .current_dir(&data_dir)
        .output()
        .map_err(|e| format!("Failed to run claude: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if !output.status.success() {
        let code = output.status.code().unwrap_or(-1);
        return Err(format!(
            "Claude exited with code {}\nstderr: {}",
            code,
            stderr.chars().take(500).collect::<String>()
        ));
    }

    if stdout.trim().is_empty() && !stderr.is_empty() {
        // Some info goes to stderr but isn't an error
        return Ok(stdout);
    }

    Ok(stdout)
}

/// Read a file from the data directory
#[command]
async fn read_data_file(relative_path: String) -> Result<String, String> {
    let data_dir = get_data_dir_path()?;
    let file_path = data_dir.join(&relative_path);

    if !file_path.exists() {
        return Err(format!("File not found: {}", relative_path));
    }

    std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read {}: {}", relative_path, e))
}

/// Write a file to the data directory
#[command]
async fn write_data_file(relative_path: String, content: String) -> Result<(), String> {
    let data_dir = get_data_dir_path()?;
    let file_path = data_dir.join(&relative_path);

    // Ensure parent directory exists
    if let Some(parent) = file_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    std::fs::write(&file_path, &content)
        .map_err(|e| format!("Failed to write {}: {}", relative_path, e))
}

/// Check if a file exists in the data directory
#[command]
async fn data_file_exists(relative_path: String) -> Result<bool, String> {
    let data_dir = get_data_dir_path()?;
    Ok(data_dir.join(&relative_path).exists())
}

/// List files in a data directory
#[command]
async fn list_data_dir(relative_path: String) -> Result<Vec<String>, String> {
    let data_dir = get_data_dir_path()?;
    let dir_path = data_dir.join(&relative_path);

    if !dir_path.exists() {
        return Err(format!("Directory not found: {}", relative_path));
    }

    let entries = std::fs::read_dir(&dir_path)
        .map_err(|e| format!("Failed to read dir {}: {}", relative_path, e))?;

    let names: Vec<String> = entries
        .filter_map(|e| e.ok())
        .filter_map(|e| e.file_name().into_string().ok())
        .collect();

    Ok(names)
}

fn get_data_dir_path() -> Result<std::path::PathBuf, String> {
    let cwd = std::env::current_dir()
        .map_err(|e| format!("Failed to get cwd: {}", e))?;
    let data_dir = cwd.parent()
        .map(|p| p.join("data"))
        .unwrap_or_else(|| cwd.join("data"));

    if !data_dir.exists() {
        return Err(format!("Data directory not found: {:?}", data_dir));
    }
    Ok(data_dir)
}

/// Return the absolute path to the data directory
#[command]
async fn get_data_dir() -> Result<String, String> {
    let data_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get cwd: {}", e))?
        .parent()
        .map(|p| p.join("data"))
        .unwrap_or_else(|| std::path::PathBuf::from("data"));

    Ok(data_dir.to_string_lossy().to_string())
}

/// Export user data as a tar.gz file. Only includes user data, not framework files.
#[command]
async fn export_data(dest_path: String) -> Result<String, String> {
    let data_dir = get_data_dir_path()?;

    // Files/patterns to export (user data only)
    let user_files: Vec<String> = vec![
        "CLAUDE.local.md",
        "inventory/current.yaml",
        "recipes/history.yaml",
        "reminders/active.yaml",
        "preferences/profile.yaml",
    ].into_iter()
        .map(String::from)
        .filter(|f| data_dir.join(f).exists())
        .collect();

    // Also collect recipe collection files
    let collection_dir = data_dir.join("recipes/collection");
    let mut recipe_files: Vec<String> = Vec::new();
    if collection_dir.exists() {
        if let Ok(entries) = std::fs::read_dir(&collection_dir) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.ends_with(".md") && name != ".gitkeep" {
                    recipe_files.push(format!("recipes/collection/{}", name));
                }
            }
        }
    }

    let mut all_files = user_files;
    all_files.extend(recipe_files);

    if all_files.is_empty() {
        return Err("No user data to export".to_string());
    }

    // Create tar.gz using system tar
    let output = StdCommand::new("tar")
        .args(["czf", &dest_path])
        .args(&all_files)
        .current_dir(&data_dir)
        .output()
        .map_err(|e| format!("Failed to create archive: {}", e))?;

    if !output.status.success() {
        return Err(format!("tar failed: {}", String::from_utf8_lossy(&output.stderr)));
    }

    Ok(format!("Exported {} files to {}", all_files.len(), dest_path))
}

/// Import user data from a tar.gz file. Only restores user data, never overwrites framework files.
#[command]
async fn import_data(source_path: String) -> Result<String, String> {
    let data_dir = get_data_dir_path()?;

    // First, list contents of the archive
    let list_output = StdCommand::new("tar")
        .args(["tzf", &source_path])
        .output()
        .map_err(|e| format!("Failed to read archive: {}", e))?;

    if !list_output.status.success() {
        return Err(format!("Invalid archive: {}", String::from_utf8_lossy(&list_output.stderr)));
    }

    let files_in_archive = String::from_utf8_lossy(&list_output.stdout).to_string();
    let file_list: Vec<&str> = files_in_archive.lines().collect();

    // Filter to only allow user data files (block SKILL.md, CLAUDE.md)
    let allowed: Vec<&str> = file_list.iter()
        .filter(|f| {
            !f.ends_with("SKILL.md") &&
            !f.ends_with("CLAUDE.md") &&  // framework CLAUDE.md, not CLAUDE.local.md
            !f.contains(".gitkeep")
        })
        .copied()
        .collect();

    if allowed.is_empty() {
        return Err("No importable user data found in archive".to_string());
    }

    // Extract only allowed files
    let mut cmd = StdCommand::new("tar");
    cmd.args(["xzf", &source_path]);
    for file in &allowed {
        cmd.arg(file);
    }
    cmd.current_dir(&data_dir);

    let output = cmd.output()
        .map_err(|e| format!("Failed to extract: {}", e))?;

    if !output.status.success() {
        return Err(format!("Extract failed: {}", String::from_utf8_lossy(&output.stderr)));
    }

    Ok(format!("Imported {} files: {}", allowed.len(), allowed.join(", ")))
}

/// Validate and migrate imported data by running Claude against the SKILL.md schemas.
/// Returns Claude's response describing what was fixed (or "all good").
#[command]
async fn validate_imported_data(imported_files: Vec<String>) -> Result<String, String> {
    let data_dir = get_data_dir_path()?;

    // Build a prompt that asks Claude to validate each imported file against its schema
    let mut file_contents = String::new();
    for file in &imported_files {
        let path = data_dir.join(file);
        if path.exists() {
            if let Ok(content) = std::fs::read_to_string(&path) {
                file_contents.push_str(&format!("\n--- {} ---\n{}\n", file, content));
            }
        }
    }

    if file_contents.is_empty() {
        return Ok("No files to validate".to_string());
    }

    let prompt = format!(
        "I just imported data files into What2Eat. Check each file against the expected schema \
        defined in the corresponding SKILL.md and fix any issues:\n\
        - Missing required fields: add with sensible defaults\n\
        - Unknown fields: remove them\n\
        - Wrong types (e.g. string where number expected): convert\n\
        - Dates as Date objects: ensure they're strings like \"2026-03-28\"\n\
        \n\
        Read each SKILL.md first for the expected format, then read and fix each imported file. \
        If everything is valid, just say \"All data looks good, no fixes needed.\" \
        If you fix anything, briefly describe what you changed.\n\
        \n\
        Imported files:\n{}", file_contents
    );

    let output = StdCommand::new("claude")
        .args([
            "--print",
            "--output-format", "text",
            "--allowedTools", "Read,Write,Edit",
            "--model", "sonnet",
            "--dangerously-skip-permissions",
            "--no-session-persistence",
            "--disable-slash-commands",
            "-p", &prompt,
        ])
        .current_dir(&data_dir)
        .output()
        .map_err(|e| format!("Validation failed: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Validation error: {}", stderr.chars().take(300).collect::<String>()));
    }

    Ok(if stdout.is_empty() { "Validation complete".to_string() } else { stdout })
}

/// Reset all user data to empty defaults. Does not touch framework files.
#[command]
async fn reset_data() -> Result<String, String> {
    let data_dir = get_data_dir_path()?;

    let resets = vec![
        ("inventory/current.yaml", "last_updated: null\nitems: []\n"),
        ("recipes/history.yaml", "meals: []\n"),
        ("reminders/active.yaml", "reminders: []\n"),
        ("preferences/profile.yaml", "dietary:\n  restrictions: []\n  allergies: []\n  dislikes: []\n  favorites: []\n\ncooking:\n  skill_level: intermediate\n  equipment: []\n  max_prep_time: null\n  default_servings: 1\n\ncuisines:\n  favorites: []\n  want_to_try: []\n  avoid: []\n\nnotes: []\n"),
    ];

    for (file, content) in &resets {
        let path = data_dir.join(file);
        std::fs::write(&path, content)
            .map_err(|e| format!("Failed to reset {}: {}", file, e))?;
    }

    // Clear recipe collection (keep .gitkeep)
    let collection = data_dir.join("recipes/collection");
    if collection.exists() {
        for entry in std::fs::read_dir(&collection).map_err(|e| e.to_string())?.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name != ".gitkeep" {
                std::fs::remove_file(entry.path()).ok();
            }
        }
    }

    // Remove CLAUDE.local.md
    let local_md = data_dir.join("CLAUDE.local.md");
    if local_md.exists() {
        std::fs::remove_file(&local_md).ok();
    }

    Ok("All user data reset to defaults".to_string())
}

/// Save an uploaded image to data/.uploads/ and return the relative path.
/// Claude can then read the image via its Read tool.
#[command]
async fn save_upload(file_path: String) -> Result<String, String> {
    let data_dir = get_data_dir_path()?;
    let uploads_dir = data_dir.join(".uploads");
    std::fs::create_dir_all(&uploads_dir)
        .map_err(|e| format!("Failed to create uploads dir: {}", e))?;

    let source = std::path::Path::new(&file_path);
    if !source.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let ext = source.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg");
    let filename = format!("upload-{}.{}", chrono_timestamp(), ext);
    let dest = uploads_dir.join(&filename);

    std::fs::copy(source, &dest)
        .map_err(|e| format!("Failed to copy file: {}", e))?;

    Ok(format!(".uploads/{}", filename))
}

/// Clean up old uploads
#[command]
async fn clean_uploads() -> Result<String, String> {
    let data_dir = get_data_dir_path()?;
    let uploads_dir = data_dir.join(".uploads");
    if uploads_dir.exists() {
        std::fs::remove_dir_all(&uploads_dir)
            .map_err(|e| format!("Failed to clean uploads: {}", e))?;
    }
    Ok("Uploads cleaned".to_string())
}

fn chrono_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs();
    format!("{}", secs)
}

/// Check if claude CLI is available
#[command]
async fn check_claude() -> Result<String, String> {
    let output = StdCommand::new("claude")
        .args(["--version"])
        .output()
        .map_err(|e| format!("Claude not found: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            invoke_claude, check_claude, get_data_dir,
            read_data_file, write_data_file, data_file_exists, list_data_dir,
            export_data, import_data, validate_imported_data, reset_data,
            save_upload, clean_uploads
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // Initialize data files from defaults if they don't exist
            if let Ok(data_dir) = get_data_dir_path() {
                let defaults = vec![
                    ("inventory/current.yaml", "inventory/current.default.yaml"),
                    ("recipes/history.yaml", "recipes/history.default.yaml"),
                    ("reminders/active.yaml", "reminders/active.default.yaml"),
                    ("preferences/profile.yaml", "preferences/profile.default.yaml"),
                ];
                for (target, default) in defaults {
                    let target_path = data_dir.join(target);
                    let default_path = data_dir.join(default);
                    if !target_path.exists() && default_path.exists() {
                        if let Some(parent) = target_path.parent() {
                            std::fs::create_dir_all(parent).ok();
                        }
                        std::fs::copy(&default_path, &target_path).ok();
                    }
                }
                // Ensure recipes/collection/ exists
                std::fs::create_dir_all(data_dir.join("recipes/collection")).ok();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
