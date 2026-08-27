//! Tests that verify the "phraser" branding is consistent across all config files.
//! These catch accidental regressions where someone re-introduces "Parler" in configs.

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

fn crate_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
}

fn project_root() -> PathBuf {
    crate_dir()
        .parent()
        .expect("src-tauri must be a subdirectory of the project root")
        .to_path_buf()
}

fn read_json(path: &Path) -> serde_json::Value {
    let content =
        fs::read_to_string(path).unwrap_or_else(|e| panic!("Failed to read {:?}: {}", path, e));
    serde_json::from_str(&content).unwrap_or_else(|e| panic!("Failed to parse {:?}: {}", path, e))
}

fn tauri_conf() -> &'static serde_json::Value {
    static CONF: OnceLock<serde_json::Value> = OnceLock::new();
    CONF.get_or_init(|| read_json(&crate_dir().join("tauri.conf.json")))
}

fn tauri_dev_conf() -> &'static serde_json::Value {
    static CONF: OnceLock<serde_json::Value> = OnceLock::new();
    CONF.get_or_init(|| read_json(&crate_dir().join("tauri.dev.conf.json")))
}

fn cargo_toml_content() -> &'static String {
    static CONTENT: OnceLock<String> = OnceLock::new();
    CONTENT.get_or_init(|| {
        fs::read_to_string(crate_dir().join("Cargo.toml")).expect("Failed to read Cargo.toml")
    })
}

#[test]
fn tauri_conf_product_name_is_phraser() {
    assert_eq!(tauri_conf()["productName"].as_str().unwrap(), "phraser");
}

#[test]
fn tauri_conf_identifier_is_phraser() {
    assert_eq!(
        tauri_conf()["identifier"].as_str().unwrap(),
        "com.newblacc.phraser"
    );
}

#[test]
fn tauri_conf_window_title_is_phraser() {
    let title = tauri_conf()["app"]["windows"][0]["title"].as_str().unwrap();
    assert_eq!(title, "phraser");
}

#[test]
fn tauri_conf_updater_endpoint_uses_phraser() {
    let endpoint = tauri_conf()["plugins"]["updater"]["endpoints"][0]
        .as_str()
        .unwrap();
    // The owner matters, not just the repo name. The endpoint sat on the old
    // `newblacc` org for months after the move and returned 404, silently
    // breaking auto-update, because this assertion only checked "/phraser/".
    assert!(
        endpoint.contains("artificemachine/phraser"),
        "Updater endpoint should point at artificemachine/phraser, got: {}",
        endpoint
    );
}

#[test]
fn tauri_dev_conf_product_name_is_phraser_dev() {
    assert_eq!(
        tauri_dev_conf()["productName"].as_str().unwrap(),
        "phraserDev"
    );
}

#[test]
fn tauri_dev_conf_identifier_is_phraser_dev() {
    assert_eq!(
        tauri_dev_conf()["identifier"].as_str().unwrap(),
        "com.newblacc.phraser.dev"
    );
}

#[test]
fn cargo_toml_package_name_is_phraser() {
    assert!(
        cargo_toml_content().contains("name = \"phraser\""),
        "Cargo.toml [package] name should be 'phraser'"
    );
}

#[test]
fn cargo_toml_lib_name_is_phraser_app_lib() {
    assert!(
        cargo_toml_content().contains("name = \"phraser_app_lib\""),
        "Cargo.toml [lib] name should be 'phraser_app_lib'"
    );
}

#[test]
fn package_json_name_is_phraser() {
    let conf = read_json(&project_root().join("package.json"));
    assert_eq!(conf["name"].as_str().unwrap(), "phraser-app");
}

#[test]
fn index_html_title_is_phraser() {
    let content =
        fs::read_to_string(project_root().join("index.html")).expect("Failed to read index.html");
    assert!(
        content.contains("<title>phraser</title>"),
        "index.html title should be 'phraser'"
    );
}

#[test]
fn no_stale_parler_in_tauri_conf() {
    let content = fs::read_to_string(crate_dir().join("tauri.conf.json"))
        .expect("Failed to read tauri.conf.json");
    assert!(
        !content.contains("\"Parler\""),
        "tauri.conf.json should not contain the old name 'Parler'"
    );
    assert!(
        !content.contains("com.newblacc.parler"),
        "tauri.conf.json should not contain old bundle id 'com.newblacc.parler'"
    );
}

#[test]
fn no_stale_parler_in_tauri_dev_conf() {
    let content = fs::read_to_string(crate_dir().join("tauri.dev.conf.json"))
        .expect("Failed to read tauri.dev.conf.json");
    assert!(
        !content.contains("Parler"),
        "tauri.dev.conf.json should not contain 'Parler'"
    );
    assert!(
        !content.contains("com.newblacc.parler"),
        "tauri.dev.conf.json should not contain old bundle id"
    );
}

#[test]
fn log_file_name_is_phraser() {
    let content =
        fs::read_to_string(crate_dir().join("src/lib.rs")).expect("Failed to read lib.rs");
    assert!(
        content.contains("file_name: Some(\"phraser\""),
        "lib.rs log file name should be 'phraser'"
    );
}
