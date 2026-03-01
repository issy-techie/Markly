use regex::Regex;
use serde::Serialize;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

/// A single search match returned to the frontend.
#[derive(Serialize, Clone)]
pub struct SearchMatch {
    file_path: String,
    file_name: String,
    line_number: usize,
    line_content: String,
    match_start: usize,
    match_end: usize,
}

/// Maximum number of matches returned to prevent UI overload.
const MAX_RESULTS: usize = 1000;

/// Search all `.md` files under `root_path` for `query`.
///
/// Skips hidden files/directories, `.assets` directories, and `node_modules`.
/// Returns character-based offsets (not byte offsets) for JS compatibility.
#[tauri::command]
fn search_in_project(
    root_path: String,
    query: String,
    case_sensitive: bool,
    use_regex: bool,
) -> Result<Vec<SearchMatch>, String> {
    if query.is_empty() {
        return Ok(Vec::new());
    }

    let root = Path::new(&root_path);
    if !root.is_dir() {
        return Ok(Vec::new());
    }

    // Build the matching strategy
    let matcher: Box<dyn Fn(&str) -> Vec<(usize, usize)> + Send> = if use_regex {
        let pattern = if case_sensitive {
            Regex::new(&query)
        } else {
            Regex::new(&format!("(?i){}", &query))
        };
        let re = pattern.map_err(|e| e.to_string())?;
        Box::new(move |line: &str| {
            re.find_iter(line)
                .map(|m| {
                    // Convert byte offsets to char offsets
                    let start_chars = line[..m.start()].chars().count();
                    let match_chars = line[m.start()..m.end()].chars().count();
                    (start_chars, start_chars + match_chars)
                })
                .collect()
        })
    } else {
        let query_owned = if case_sensitive {
            query.clone()
        } else {
            query.to_lowercase()
        };
        let is_case_sensitive = case_sensitive;
        Box::new(move |line: &str| {
            let search_line = if is_case_sensitive {
                line.to_string()
            } else {
                line.to_lowercase()
            };
            let mut results = Vec::new();
            let mut search_start = 0;
            while let Some(byte_pos) = search_line[search_start..].find(&query_owned) {
                let abs_byte_pos = search_start + byte_pos;
                let start_chars = line[..abs_byte_pos].chars().count();
                let match_chars = line[abs_byte_pos..abs_byte_pos + query_owned.len()]
                    .chars()
                    .count();
                results.push((start_chars, start_chars + match_chars));
                search_start = abs_byte_pos + query_owned.len();
            }
            results
        })
    };

    let mut matches = Vec::new();

    let walker = WalkDir::new(root).into_iter().filter_entry(|entry| {
        let name = entry.file_name().to_string_lossy();
        // Skip hidden files/directories
        if name.starts_with('.') {
            return false;
        }
        // Skip .assets directories and node_modules
        if entry.file_type().is_dir() && (name.ends_with(".assets") || name == "node_modules") {
            return false;
        }
        true
    });

    for entry in walker.filter_map(|e| e.ok()) {
        if matches.len() >= MAX_RESULTS {
            break;
        }

        if !entry.file_type().is_file() {
            continue;
        }

        let path = entry.path();
        let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
        if ext != "md" {
            continue;
        }

        let file_path_str = path.to_string_lossy().to_string();
        let file_name = path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        let content = match fs::read_to_string(path) {
            Ok(c) => c,
            Err(_) => continue, // skip unreadable files
        };

        for (line_idx, line) in content.lines().enumerate() {
            if matches.len() >= MAX_RESULTS {
                break;
            }

            let line_matches = matcher(line);
            for (start, end) in line_matches {
                if matches.len() >= MAX_RESULTS {
                    break;
                }
                // Truncate long lines for display (keep up to 500 chars)
                let display_line: String = line.chars().take(500).collect();
                matches.push(SearchMatch {
                    file_path: file_path_str.clone(),
                    file_name: file_name.clone(),
                    line_number: line_idx + 1, // 1-based
                    line_content: display_line,
                    match_start: start,
                    match_end: end,
                });
            }
        }
    }

    Ok(matches)
}

/// Resolve a wiki link name to an absolute file path.
///
/// Resolution priority:
/// 1. If `link_name` contains a path separator, resolve relative to the current file's directory.
/// 2. Same directory as the current file.
/// 3. First matching `.md` file found anywhere in the project (WalkDir).
///
/// Appends `.md` extension if not already present.
#[tauri::command]
fn resolve_wiki_link(
    root_path: String,
    link_name: String,
    current_file_path: String,
) -> Option<String> {
    if link_name.trim().is_empty() {
        return None;
    }

    // Normalise the target: append .md if missing
    let target = if link_name.ends_with(".md") {
        link_name.clone()
    } else {
        format!("{}.md", link_name)
    };

    let current = Path::new(&current_file_path);
    let current_dir = current.parent()?;

    // Case 1: relative path (contains '/' or '\')
    if target.contains('/') || target.contains('\\') {
        let candidate = current_dir.join(&target);
        if candidate.is_file() {
            return Some(candidate.to_string_lossy().to_string());
        }
        return None;
    }

    // Case 2: same directory
    let same_dir_candidate = current_dir.join(&target);
    if same_dir_candidate.is_file() {
        return Some(same_dir_candidate.to_string_lossy().to_string());
    }

    // Case 3: search the project tree
    let root = Path::new(&root_path);
    if !root.is_dir() {
        return None;
    }

    let walker = WalkDir::new(root).into_iter().filter_entry(|entry| {
        let name = entry.file_name().to_string_lossy();
        if name.starts_with('.') {
            return false;
        }
        if entry.file_type().is_dir() && (name.ends_with(".assets") || name == "node_modules") {
            return false;
        }
        true
    });

    for entry in walker.filter_map(|e| e.ok()) {
        if !entry.file_type().is_file() {
            continue;
        }
        let path = entry.path();
        let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
        if ext != "md" {
            continue;
        }
        if let Some(file_name) = path.file_name() {
            if file_name.to_string_lossy() == target {
                return Some(path.to_string_lossy().to_string());
            }
        }
    }

    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            // Menu bar removed; hamburger menu is implemented on the React side
            Ok(())
        })
        // SECURITY: fs, dialog, and opener plugins use broad scopes ("**") in
        // capabilities/default.json because Markly opens arbitrary user-chosen
        // project directories. All file operations are gated by explicit user
        // actions. CSP in tauri.conf.json restricts scripts and network access.
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![search_in_project, resolve_wiki_link])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
