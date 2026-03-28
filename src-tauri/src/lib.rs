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
        .invoke_handler(tauri::generate_handler![invoke_claude, check_claude, get_data_dir])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
