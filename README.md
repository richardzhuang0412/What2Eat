# What2Eat

A personal eating manager with an animated chef character. Built with Tauri + React, powered by Claude.

## Development

```bash
npm install
cargo tauri dev
```

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Desktop**: Tauri 2 (Rust)
- **AI**: Claude CLI subprocess
- **Data**: YAML files in `data/`
