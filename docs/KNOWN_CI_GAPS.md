# Known CI Gaps

Standing CI failures that are **not** caused by any single PR. They fail on every
pull request, which trains reviewers to ignore a red board. This file exists
because GitHub Issues is disabled on this repository.

Resolved sections are kept rather than deleted. The L3 entry below took three
PRs precisely because each layer was invisible until the one above it was fixed,
and that is the part worth remembering.

| Gap                                    | Status                              |
| -------------------------------------- | ----------------------------------- |
| L1 Dependency Risk, `bun audit` half   | resolved 2026-08-27, 42 → 0         |
| L1 Dependency Risk, `cargo audit` half | 14 → 5, blocked upstream, fail-open |
| L3 SAST (`cargo clippy` on Linux)      | **resolved 2026-08-27**, now gating |

Last verified: 2026-08-27, against run
[33087094264](https://github.com/artificemachine/phraser/actions/runs/33087094264)
(PR #22).

---

## L1 Dependency Risk: partly fixed, still fail-open

**Job:** `security.yml` → `L1 Dependency Risk`
**Blocking:** no. The job still sets `continue-on-error: true` (`security.yml:17`)

Two independent audits run in this job, and they are in different states.

| Step          | Was | Now                    |
| ------------- | --- | ---------------------- |
| `Bun audit`   | 42  | **0**                  |
| `Cargo audit` | 14  | **5**, all unreachable |

The job stays fail-open until `Cargo audit` reaches 0. Flipping it now would
turn 5 advisories nobody can fix into a merge block on every PR.

### `bun audit`: fixed by refreshing a stale lockfile

`bun.lock` was last written 2026-03-05 and every advisory had a fix inside the
ranges `package.json` already declared. `rm bun.lock && bun install` took it
from 42 to 0 with `package.json` byte-identical. No version bumps, no Vite
major.

Two dev-tooling regressions came with the refresh and are fixed in the same PR:

- `eslint-plugin-i18next` now flags two genuinely untranslated strings in
  `src/components/shared/ProgressBar.tsx`. These were real i18n bugs the old
  pinned version missed; they now go through `common.downloading` and
  `common.downloadingCount` in all 16 locales.
- Prettier 3.9+ escapes a bare tilde in Markdown by doubling it, so the
  home-relative paths in `AGENTS.md` and `CLAUDE.md` get mangled. Two of those
  on one line render as GFM strikethrough, so the "fix" corrupts the text. Both
  files are also protected from automated edits by repo policy, so they are in
  `.prettierignore` rather than rewritten.

> **Correction (2026-08-27):** an earlier revision recommended `bun audit fix`.
> That is not a bun command. `bun audit` accepts only `--json`,
> `--audit-level`, and `--ignore`, and silently ignores the argument. Bun's own
> hint is `bun update`, which is worse here: it re-resolves only direct
> dependencies (42 → 50) and rewrites ~30 caret ranges in `package.json` as a
> side effect.

### `cargo audit`: 14 to 5, the rest are blocked upstream

A targeted `cargo update -p h2 -p quick-xml@0.37.5 -p quick-xml@0.38.3 -p quinn-proto -p rkyv -p rustls-webpki -p tar`
cleared 9 of the 14 within semver.

**Do not run a bare `cargo update`.** It reaches 0 advisories but bumps `ort`
inside its range, and `transcribe-rs` does not compile against the newer API:
84 errors, mostly `field 'inputs' of struct 'Session' is private` and
`TensorArrayData` trait bounds. Verified 2026-08-27.

The remaining 5 need semver-major bumps of transitive dependencies, so they
cannot be fixed from this repo:

| Crate              | Advisory                             | Needs      | Reached via                                              |
| ------------------ | ------------------------------------ | ---------- | -------------------------------------------------------- |
| `quick-xml` 0.37.5 | RUSTSEC-2026-0194, RUSTSEC-2026-0195 | `>=0.41.0` | `wayland-scanner` → … → `tauri-plugin-clipboard-manager` |
| `quick-xml` 0.38.4 | RUSTSEC-2026-0194, RUSTSEC-2026-0195 | `>=0.41.0` | `plist` → `os_info` / `tauri`                            |
| `rkyv` 0.7.46      | RUSTSEC-2026-0235                    | `>=0.8.17` | `rust_decimal` 1.39.0                                    |

All three are parser/allocation denial-of-service issues in code paths that
handle local files (clipboard protocol descriptions, `Info.plist`), not remote
attacker input. They clear when Tauri and `rust_decimal` bump their own
dependencies.

### Still worth doing

Drop `geist` and vendor its woff2 into `src/assets/fonts/` with the SIL OFL 1.1
notice. `geist@1.7.0` peer-declares `next: >=13.2.0`, so bun installs Next.js
(155 MB) and `sharp` to serve exactly one `@font-face` in `src/App.css:5`
loading a 28 KB file. Nothing imports it. Removing it deletes the entire
Next.js advisory surface; without it, the next Next.js CVE re-reds this job for
a font.

---

## L3 SAST: RESOLVED 2026-08-27

**Job:** `security.yml` → `L3 SAST` → step `Rust clippy`
**Blocking:** yes, as of PR #23. `continue-on-error: true` has been removed now
that the step genuinely passes.

First green Linux run:
[33087094264](https://github.com/artificemachine/phraser/actions/runs/33087094264)
(PR #22, `Rust clippy` = success).

This gap had three layers, each hidden behind the one in front of it. Only
fixing one exposed the next, so it took three PRs to clear.

### Layer 1: the build script panicked before clippy ran (PR #21)

```
Could NOT find Vulkan
thread 'main' panicked at cmake-0.1.54/src/lib.rs:1119:5
```

`transcribe-rs` enables `whisper-rs`'s `vulkan` feature unconditionally on
Linux, via its own target-specific declaration in
`transcribe-rs-0.2.5/Cargo.toml`:

```toml
[target.'cfg(target_os = "linux")'.dependencies.whisper-rs]
version = "0.13.2"
features = ["vulkan"]
optional = true
```

`whisper-rs-sys/build.rs` gates its cmake config on that feature, which makes
`find_package(Vulkan)` mandatory. No clippy flag can turn it off. Fixed by
installing the LunarG Vulkan SDK on the runner, reusing the block already
proven in `build.yml`.

Uncovered 2026-07-11 while fixing an earlier `glib-2.0` failure in the same
job; unfixed until 2026-08-27.

### Layer 2: 47 clippy lints nobody had ever compiled (PR #22)

With the panic gone, clippy ran for the first time and `-D warnings` promoted
47 violations to errors. None came from PR #21; the code had simply never been
linted on Linux. 41 reproduce on macOS, 6 were Linux-only.

Worth knowing for next time: `cargo clippy --fix` was silently rolling back the
**entire** batch because two of its own suggestions do not compile:
`map_entry` moves a key before a later borrow, and `manual_inspect` leaves an
unused binding. Excluding those two with `-A` let the other 32 apply.

### Layer 3: 6 rustc warnings underneath the lints (PR #22)

Clearing the lints revealed a further 6 plain rustc warnings (`unused_imports`,
`unused_mut`, `unused_variables`, `dead_code`), each a symbol whose only use
sits inside a macOS-gated block. Fixed by narrowing each declaration to the
platform that already used it.

### Checking this job in future

`gh pr checks` now reports L3 honestly, since the job gates. Before PR #23 it
could report `pass` while the `Rust clippy` step inside it had failed. If that
flag is ever restored, check the step, not the job:

```
gh run view <run-id> --json jobs \
  -q '.jobs[] | select(.name|test("L3")) | .steps[] | "\(.conclusion)\t\(.name)"'
```
