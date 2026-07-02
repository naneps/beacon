#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::TcpListener;
use std::sync::Mutex;

use tauri::{Manager, RunEvent, State};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

/// The port the bundled backend sidecar was told to listen on. The frontend
/// reads this via the `backend_port` command so it never hardcodes 8000.
struct BackendPort(u16);

/// Handle to the spawned sidecar so we can kill it when the app exits.
struct BackendChild(Mutex<Option<CommandChild>>);

#[tauri::command]
fn backend_port(state: State<BackendPort>) -> u16 {
    state.0
}

/// Ask the OS for a free TCP port on loopback (bind to :0, read the assigned
/// port, drop the listener). Falls back to 8000 if that somehow fails.
fn pick_free_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .and_then(|l| l.local_addr())
        .map(|addr| addr.port())
        .unwrap_or(8000)
}

fn main() {
    let port = pick_free_port();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(BackendPort(port))
        .manage(BackendChild(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![backend_port])
        .setup(move |app| {
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();

            // Per-user writable data dir (%APPDATA%\Beacon, ~/Library/Application
            // Support/Beacon, ~/.config/Beacon) derived from the bundle identifier.
            let data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            std::fs::create_dir_all(&data_dir).ok();

            // Launch the bundled Python backend, injecting the chosen port and
            // the data dir. The sidecar name matches `externalBin` in tauri.conf.json.
            let sidecar = app
                .shell()
                .sidecar("binaries/backend")
                .expect("backend sidecar not configured")
                .env("BEACON_PORT", port.to_string())
                .env("BEACON_DATA_DIR", data_dir.to_string_lossy().to_string())
                .args(["--port", &port.to_string()]);

            let (mut _rx, child) = sidecar.spawn().expect("failed to spawn backend sidecar");
            app.state::<BackendChild>().0.lock().unwrap().replace(child);

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            // Kill the sidecar when the app is quitting so no orphan backend.exe
            // is left running.
            if let RunEvent::ExitRequested { .. } = event {
                if let Some(child) = app_handle.state::<BackendChild>().0.lock().unwrap().take() {
                    let _ = child.kill();
                }
            }
        });
}
