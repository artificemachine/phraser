# Changelog

- 2026-07-21: docs: align CODE_OF_CONDUCT.md with concise 5-line CoC (replaces Contributor Covenant boilerplate with internal style)

## [0.3.0] - 2025-07-11

### Added

- **Translate to English** setting: Added automatic translation of speech to English
- Settings refactored into React hooks for better state management
- Audio device switching capability
- Hysteresis to VAD (Voice Activity Detection) for more stable recording

### Changed

- Major audio backend refactor for improved performance and reliability
- Moved audio toolkit into src-tauri directory for better permissions handling
- Model files no longer need to be downloaded separately for releases
- Updated settings components and transcription logic

### Fixed

- Audio toolkit permissions issues
- Various stability improvements

## [0.2.3] - 2025-07-03

### Fixed

- Keycode bug that was causing input issues
- Whisper model optimization: switched to unquantized Whisper Turbo, updated Whisper Medium quantization to 4_1

## [0.2.2] - 2025-07-02

### Fixed

- Removed 50ms delay feature flag for Windows (now applies to all platforms for consistency)

## [0.2.1] - 2025-07-01

### Added

- Ctrl+Space key binding for Windows platform

### Fixed

- Windows crash issue
- Model loading on startup when available
- Windows paste functionality bug

## [0.2.0] - 2025-06-30

### Added

- **Microphone activation on demand**: More efficient resource usage
- Less permissive VAD settings for better accuracy

### Changed

- Improved microphone management and activation system

## [0.1.6] - 2025-06-30

### Added

- **Multiple models support**: Users can now select from different transcription models
- Model selection onboarding flow
- Cleanup and refactoring of model management

### Changed

- Enhanced user experience with model selection interface
- Better language and UI tweaks

## [0.1.5] - 2025-06-27

### Added

- **Different start and stop recording sounds**: Enhanced audio feedback
- Recording sound samples for better user experience

## [0.1.4] - 2025-06-27

### Fixed

- Build issues
- Auto-update functionality improvements

## [0.1.3] - 2025-06-26

### Fixed

- Paste functionality using enigo library for better cross-platform compatibility

## [0.1.2] - 2025-06-26

### Added

- **Auto-update functionality**: Application can now automatically update itself
- Footer displaying current version
- Improved menu system

### Changed

- Better user interface for version management
- Enhanced update workflow

## [0.1.1] - 2025-06-25

### Added

- **Comprehensive build system**: Support for Windows, macOS, and Linux
- Windows code signing for trusted installation
- Ubuntu/Linux build support with Vulkan
- Model file download and packaging for releases
- GitHub Actions CI/CD workflow

### Changed

- Improved build process and release workflow
- Better cross-platform compatibility

### Fixed

- Various build-related issues across platforms

## [0.1.0] - 2025-05-16

### Added

- **Initial release** of phraser
- Basic speech-to-text transcription functionality
- Voice Activity Detection (VAD) for automatic recording
- Cross-platform support (macOS, Windows, Linux)
- **Tauri-based desktop application** with React frontend
- **Global keyboard shortcuts** for activation
- **Clipboard integration** for automatic text insertion
- **LLM integration** for enhanced transcription processing
- **Configurable settings** including:
  - Custom key bindings
  - Audio device selection
  - Microphone settings
  - Push-to-talk functionality
- **System tray integration** with recording indicators
- **Accessibility permissions** handling for macOS
- **Settings persistence** with unified settings store
- **Background operation** capability
- **Multiple audio format support** with on-the-fly resampling
- **Whisper model integration** for high-quality transcription
- **MIT License** for open-source distribution

### Technical Implementation

- Built with Tauri (Rust backend) and React (TypeScript frontend)
- Audio processing with cpal and whisper-rs
- Real-time transcription with performance optimizations
- Cross-platform keyboard event handling
- Modular architecture with managers for audio, models, and transcription
- 2026-05-01: feat: phraser rebrand — replace all Handy icons/logos with new waveform design, rename code references, update i18n, bump to v0.8.0
- 2026-05-01: feat: MP3 recording output format, AudioFormat setting with WAV/MP3 toggle (v0.9.0)
- 2026-05-01: fix: add audioFormat i18n translations to all 16 locales
- 2026-07-11: fix: correct Apple Intelligence SDK detection in build.rs to also check for the FoundationModelsMacros compiler plugin, not just the framework directory — Command Line Tools installs have the framework but not the macro plugin, which was silently picking the real Swift source and failing to compile
- 2026-07-11: fix: replace gitleaks-action@v2 (requires paid org license) with the open-source gitleaks CLI in CI; install missing glib-2.0/webkit2gtk system deps for the L3 SAST clippy job on Ubuntu
- 2026-07-11: fix: backfill 64 missing i18n keys (Gemini API, long audio model, processing models, post-processing actions) across ar/cs/de/es/fr/it/ja/ko/pl/pt/ru/tr/vi locales
- 2026-07-11: chore: bump version to 0.9.2

- 2026-06-25: chore: remove personal workspace path from tracked files
- 2026-07-11: fix: update stale celstnblacc GitHub references to artificemachine (docs, about page, releasing guide)
- 2026-07-11: chore: bump version to 0.9.1, sync package.json with Cargo.toml/tauri.conf.json (was stale at 0.7.12)
- 2026-08-27: feat: default long-audio model to Whisper Turbo for new installs, warn in settings when the configured model is not downloaded
- 2026-08-27: fix: backfill 64 missing i18n keys for uk, zh, zh-TW — all 16 locales now complete
- 2026-08-27: fix: mirror is_model_downloaded onto the CI mock TranscriptionManager
- 2026-08-27: docs: add docs/KNOWN_CI_GAPS.md tracking the L1 dependency-audit and L3 Vulkan CI failures
- 2026-08-27: fix: install Vulkan toolchain on the L3 SAST runner so cargo clippy can build whisper-rs-sys
- 2026-08-27: chore: clear all 41 clippy lints in src-tauri so the L3 SAST clippy step can pass
- 2026-08-27: chore: drop 6 dead returns in Linux-only shortcut guards (needless_return)
- 2026-08-27: chore: gate 6 Linux-only unused imports/vars/const behind cfg so clippy -D warnings passes on Linux
- 2026-08-27: chore: L3 SAST now gates (continue-on-error removed) after cargo clippy passed on Linux for the first time
- 2026-08-27: fix: add the missing src-tauri/tauri.unsigned.conf.json so bun run app:create works
- 2026-08-27: security: refresh bun.lock, taking bun audit from 42 vulnerabilities to 0 with package.json unchanged
- 2026-08-27: security: targeted cargo update (h2, quick-xml, quinn-proto, rustls-webpki, tar) taking cargo audit from 14 to 5
- 2026-08-27: fix: translate the two hardcoded ProgressBar strings across all 16 locales
- 2026-08-27: chore: exclude AGENTS.md and CLAUDE.md from prettier (3.9+ escapes bare ~ as ~~)
