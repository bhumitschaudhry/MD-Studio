use std::sync::Mutex;

struct OpenFiles(Mutex<Vec<String>>);

#[tauri::command]
fn take_open_files(state: tauri::State<OpenFiles>) -> Vec<String> {
  let mut guard = state.0.lock().expect("state lock poisoned");
  let files = guard.clone();
  guard.clear();
  files
}

#[tauri::command]
fn read_markdown_file(path: String) -> Result<String, String> {
  let normalized = path.trim_matches('"');
  std::fs::read_to_string(normalized).map_err(|err| err.to_string())
}

#[tauri::command]
fn write_markdown_file(path: String, contents: String) -> Result<(), String> {
  let normalized = path.trim_matches('"');
  std::fs::write(normalized, contents).map_err(|err| err.to_string())
}

fn main() {
  let args: Vec<String> = std::env::args()
    .skip(1)
    .filter(|arg| {
      let lower = arg.to_lowercase();
      lower.ends_with(".md") || lower.ends_with(".markdown")
    })
    .collect();

  tauri::Builder::default()
    .manage(OpenFiles(Mutex::new(args)))
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      take_open_files,
      read_markdown_file,
      write_markdown_file
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
