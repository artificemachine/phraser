# Known CI Gaps

Standing CI failures that are **not** caused by any single PR. They fail on every
pull request, which trains reviewers to ignore a red board. This file exists
because GitHub Issues is disabled on this repository.

Resolved sections are kept rather than deleted — the L3 entry below took three
PRs precisely because each layer was invisible until the one above it was fixed,
and that is the part worth remembering.

| Gap                                             | Status                              |
| ----------------------------------------------- | ----------------------------------- |
| L1 Dependency Risk (`bun audit`, 42 advisories) | open, fail-open                     |
| L3 SAST (`cargo clippy` on Linux)               | **resolved 2026-08-27**, now gating |

Last verified: 2026-08-27, against run
[33087094264](https://github.com/artificemachine/phraser/actions/runs/33087094264)
(PR #22).

---

## L1 Dependency Risk — `bun audit` reports 42 vulnerabilities

**Job:** `security.yml` → `L1 Dependency Risk` → step `Bun audit --production`
**Blocking:** no — the job sets `continue-on-error: true` (`security.yml:17`)
**Status:** 42 vulnerabilities — 20 high, 19 moderate, 3 low

> **Correction (2026-08-27):** an earlier revision claimed this job was blocking
> because it "has no `continue-on-error`". It does have one, and always has.
> Neither L1 nor L3 gates a merge — both security jobs are fail-open, so a red
> board here has never stopped anything from shipping.

> **Correction (2026-08-27):** the 42 figure comes from `bun audit --production`,
> which is what CI runs. A plain `bun audit` reports 64, the extra 22 being
> dev-only tooling (eslint chain, happy-dom, and one **critical** Vitest UI
> arbitrary-file-read advisory, GHSA-5xrq-8626-4rwp).

Representative advisories:

| Severity | Package                   | Advisory                                                                                                                           |
| -------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| high     | `vite` (>=6.0.0 <=6.4.1)  | Arbitrary file read via dev server WebSocket — [GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583)            |
| high     | `vite` (<=6.4.2)          | `server.fs.deny` bypass on Windows alternate paths — [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff)      |
| moderate | `vite` (<=6.4.1)          | Path traversal in optimized deps `.map` handling — [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9)        |
| moderate | `launch-editor` (<=6.4.2) | NTLMv2 hash disclosure via UNC path handling on Windows — [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) |
| moderate | `yaml` (>=1.0.0 <1.10.3)  | Stack overflow via deeply nested collections — [GHSA-48c2-rrv3-qjmp](https://github.com/advisories/GHSA-48c2-rrv3-qjmp)            |

`yaml@1.10.2` is reached through two paths:

```
vite > yaml
react-select > @emotion/react > @emotion/babel-plugin > babel-plugin-macros > cosmiconfig > yaml
```

**Assessment:** most of these are dev-server and build-chain surface rather than
shipped runtime surface — a Tauri release bundles built assets, not the Vite dev
server. That lowers the urgency but not the need to clear the board.

**Root cause: a stale lockfile, not outdated version ranges.** `bun.lock` was last
written 2026-04-26 and every advisory has a fix inside the ranges `package.json`
already declares.

Grouped by root package:

| Root        | Count | Reached via                                                |
| ----------- | ----- | ---------------------------------------------------------- |
| `next`      | 28    | `geist › next` — an auto-installed **peer dependency**     |
| `vite`      | 4     | direct devDep, `@tailwindcss/vite`, `@vitejs/plugin-react` |
| `postcss`   | 4     | `vite › postcss` and `geist › next › postcss`              |
| `picomatch` | 2     | `tinyglobby › fdir › picomatch`                            |
| `nanoid`    | 2     | `postcss › nanoid`                                         |
| `sharp`     | 1     | `geist › next › sharp`                                     |
| `yaml`      | 1     | `react-select › @emotion/react › … › cosmiconfig › yaml`   |

`geist@1.7.0` peer-declares `next: >=13.2.0`, so bun installs Next.js (155 MB) and
`sharp`. `geist` is used for exactly one `@font-face` in `src/App.css:5` loading a
28 KB woff2. Nothing imports it.

**Suggested fix:**

1. `rm bun.lock && bun install`, commit the lockfile only. Verified to take the
   audit from 42 → **0** with `package.json` byte-identical. No version bumps, no
   Vite major.
2. Two dev-tooling regressions ship with the refresh and must be handled in the
   same PR or other workflows go red:
   - `eslint-plugin-i18next` 6.1.5 flags two genuinely untranslated strings in
     `src/components/shared/ProgressBar.tsx` (lines 58, 84). Add the i18n keys
     across all 16 locales, or pin `~6.1.3`.
   - `prettier` 3.9.6 escapes bare `~` in Markdown, rewriting `~/.local/bin` →
     `~~/.local/bin` in `AGENTS.md:118` and `CLAUDE.md:193`. `AGENTS.md` is
     protected by the repo's immutability rule — pin `~3.8.1` or add both files
     to `.prettierignore` rather than letting prettier edit them.
3. Full gate afterwards — including `bun run test:playwright` and one
   `bun run tauri build`, neither of which has been exercised against the
   refreshed tree.

**Separately worth doing:** drop `geist` and vendor the woff2 into
`src/assets/fonts/` with its SIL OFL 1.1 notice. That deletes 155 MB and the
entire Next.js advisory surface; without it the next Next.js CVE re-reds this job
for a font file.

> **Correction (2026-08-27):** an earlier revision recommended `bun audit fix`.
> That is not a bun command — `bun audit` accepts only `--json`, `--audit-level`,
> and `--ignore`, and silently ignores the argument. Bun's own hint is
> `bun update`, which is worse here: it re-resolves only direct dependencies
> (42 → 50) and rewrites ~30 caret ranges in `package.json` as a side effect.

---

## L3 SAST — RESOLVED 2026-08-27

**Job:** `security.yml` → `L3 SAST` → step `Rust clippy`
**Blocking:** yes, as of PR #23 — `continue-on-error: true` has been removed now
that the step genuinely passes.

First green Linux run:
[33087094264](https://github.com/artificemachine/phraser/actions/runs/33087094264)
(PR #22, `Rust clippy` = success).

This gap had three layers, each hidden behind the one in front of it. Only
fixing one exposed the next, so it took three PRs to clear.

### Layer 1 — the build script panicked before clippy ran (PR #21)

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

### Layer 2 — 47 clippy lints nobody had ever compiled (PR #22)

With the panic gone, clippy ran for the first time and `-D warnings` promoted
47 violations to errors. None came from PR #21; the code had simply never been
linted on Linux. 41 reproduce on macOS, 6 were Linux-only.

Worth knowing for next time: `cargo clippy --fix` was silently rolling back the
**entire** batch because two of its own suggestions do not compile —
`map_entry` moves a key before a later borrow, and `manual_inspect` leaves an
unused binding. Excluding those two with `-A` let the other 32 apply.

### Layer 3 — 6 rustc warnings underneath the lints (PR #22)

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
