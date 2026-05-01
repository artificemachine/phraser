//! Tests that verify "Parler" has been fully replaced with "phraser" in all i18n files.
//! The only allowed exception is the French word "parler" (lowercase, meaning "to speak").

use std::fs;
use std::path::PathBuf;

fn locales_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("src-tauri must be a subdirectory of the project root")
        .join("src/i18n/locales")
}

fn translation_files() -> Vec<PathBuf> {
    let base = locales_dir();
    let mut files = Vec::new();
    for entry in fs::read_dir(&base).expect("Failed to read i18n locales directory") {
        let entry = entry.unwrap();
        let path = entry.path().join("translation.json");
        if path.exists() {
            files.push(path);
        }
    }
    files.sort();
    files
}

#[test]
fn all_translation_files_exist() {
    let files = translation_files();
    assert!(
        files.len() >= 17,
        "Expected at least 17 translation files, found {}",
        files.len()
    );
}

#[test]
fn no_capitalized_parler_in_translations() {
    for path in translation_files() {
        let content = fs::read_to_string(&path)
            .unwrap_or_else(|e| panic!("Failed to read {:?}: {}", path, e));
        assert!(
            !content.contains("\"Parler"),
            "{:?} still contains the old app name 'Parler'",
            path
        );
    }
}

#[test]
fn phraser_present_in_english_translation() {
    let content = fs::read_to_string(locales_dir().join("en/translation.json"))
        .expect("Failed to read English translation");
    assert!(
        content.contains("phraser"),
        "English translation should contain 'phraser'"
    );
}

#[test]
fn french_parler_lowercase_is_allowed() {
    let path = locales_dir().join("fr/translation.json");
    let content = fs::read_to_string(&path)
        .expect("French translation file must exist at fr/translation.json");
    assert!(
        !content.contains("\"Parler"),
        "French translation should not contain the old app name 'Parler' (capitalized)"
    );
}
