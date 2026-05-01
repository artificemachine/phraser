# Session Handoff — 2026-05-01

## What was done

Renamed the project from "Phraser" / "Handy" to lowercase "phraser" across the entire codebase and GitHub.

### Changes summary

| Task                              | Scope                                                                      | Status |
| --------------------------------- | -------------------------------------------------------------------------- | ------ |
| GitHub repo renamed               | `celstnblacc/Phraser` → `celstnblacc/phraser`                              | Done   |
| `Phraser` → `phraser` (lowercase) | 305 occurrences / 44 files                                                 | Done   |
| WAV recording filenames           | `handy-*.wav` → `phraser-*.wav` in `history.rs` + `tray.rs`                | Done   |
| GitHub URL in About settings      | `newblacc/Handy` → `celstnblacc/phraser`                                   | Done   |
| `HandyKeys` → `PhraserKeys`       | Full subsystem rename: structs, components, commands, file renames         | Done   |
| `HandyHand` → `PhraserHand`       | Icon component renamed                                                     | Done   |
| File renames                      | 3 files renamed (HandyHand.tsx, HandyKeysShortcutInput.tsx, handy_keys.rs) | Done   |
| Cargo crate alias                 | `phraser_keys = { package = "handy-keys", version = "0.2.1" }`             | Done   |
| `handy.png` → `phraser.png`       | Tray icon file + reference in `tray.rs`                                    | Done   |
| Doc cleanup                       | AGENTS.md, CHANGELOG.md, CONTRIBUTING.md, BUILD.md, flake.nix              | Done   |
| `PhraserTextLogo` casing          | React PascalCase restored (bulk sed broke it)                              | Done   |
| Code signing descriptor           | `-d Handy` → `-d phraser` in tauri.conf.json                               | Done   |

### Preserved (not changed)

- All `cjpais/Handy` upstream repo URLs (28 references) — these point to the original project
- README.md fork attribution line
- `speechlovy-icon.svg` — generic microphone icon, no Handy branding
- `.github/` issue template URLs — all point to upstream

### Tests

| Suite                        | Result                              |
| ---------------------------- | ----------------------------------- |
| `bun run test:unit` (Vitest) | 18 files / 178 tests — **all pass** |
| `cargo check` (Rust)         | 0 errors                            |
| `cargo test --lib` (Rust)    | 131 passed                          |

## Still to do

### Branding assets (images need visual redesign)

See **[BRANDING_ASSETS.md](BRANDING_ASSETS.md)** for full instructions.

Quick list:

- `src-tauri/icons/icon.png` + all platform derivatives (~60 files)
- 7 tray icons in `src-tauri/resources/tray_*.png`
- `src/components/icons/PhraserHand.tsx` — SVG hand mascot needs new phraser design

### Remaining "Handy" in docs

Some files still reference "Handy" as the app name in non-upstream contexts:

- `CONTRIBUTING_TRANSLATIONS.md` lines 123, 174 — brand name references
- `docs/index.html` line 390 — "based on Handy by cjpais" (upstream ref, probably fine)
- `.github/ISSUE_TEMPLATE/bug_report.md` line 3 — "help us improve Handy" (already fixed)
- `.github/ISSUE_TEMPLATE/config.yml` line 14 — already fixed

## Key files touched

- `src-tauri/src/shortcut/phraser_keys.rs` (was `handy_keys.rs`)
- `src-tauri/src/shortcut/mod.rs` — module declaration + all imports
- `src-tauri/src/settings.rs` — `KeyboardImplementation::PhraserKeys`
- `src-tauri/src/lib.rs` — command registrations
- `src-tauri/Cargo.toml` — crate alias
- `src-tauri/tauri.conf.json` — sign command
- `src-tauri/src/managers/history.rs` — WAV filenames
- `src-tauri/src/tray.rs` — tray icon reference
- `src/components/icons/PhraserHand.tsx` (was `HandyHand.tsx`)
- `src/components/icons/PhraserTextLogo.tsx`
- `src/components/Sidebar.tsx`
- `src/components/settings/PhraserKeysShortcutInput.tsx` (was `HandyKeysShortcutInput.tsx`)
- `src/components/settings/ShortcutInput.tsx`
- `src/components/settings/index.ts`
- `src/components/settings/about/AboutSettings.tsx`
- `src/bindings.ts` — Tauri command bindings
- `src/components/onboarding/Onboarding.tsx`
- `src/components/onboarding/AccessibilityOnboarding.tsx`
- `tests/app.spec.ts`
- 18 i18n translation JSON files
- All docs (README.md, AGENTS.md, BUILD.md, CONTRIBUTING.md, CONTRIBUTING_TRANSLATIONS.md, CHANGELOG.md, flake.nix)
