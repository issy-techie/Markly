use tauri::Emitter;
use tauri::WindowEvent;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            // Menu bar removed; hamburger menu is implemented on the React side
            Ok(())
        })
        // Window close event handling
        .on_window_event(|_window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close(); // Prevent default close behavior
                let _ = _window.emit("close-requested", ()); // Notify React
            }
        })
        // SECURITY: fs, dialog, and opener plugins use broad scopes ("**") in
        // capabilities/default.json because Markly opens arbitrary user-chosen
        // project directories. All file operations are gated by explicit user
        // actions. CSP in tauri.conf.json restricts scripts and network access.
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
