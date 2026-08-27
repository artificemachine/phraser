# Known CI Gaps

Standing CI failures that are **not** caused by any single PR. They fail on every
pull request, which trains reviewers to ignore a red board. This file exists
because GitHub Issues is disabled on this repository.

Last verified: 2026-08-27, against run
[33076277512](https://github.com/artificemachine/phraser/actions/runs/33076277512)
(PR #19).

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

## L3 SAST — `cargo clippy` fails on the Linux runner (Vulkan not found)

**Job:** `security.yml` → `L3 SAST` → step `Rust clippy`
**Blocking:** no — the job sets `continue-on-error: true`, so it does not gate a
merge. It still reports as `fail` in `gh pr checks`, which is the misleading part.

The build of `whisper-rs-sys` panics while configuring `whisper.cpp`:

```
Could NOT find Vulkan
thread 'main' panicked at cmake-0.1.54/src/lib.rs:1119:5:
command did not execute successfully, got: exit status: 1
build script failed, must exit now
```

**History:** this gap was uncovered on 2026-07-11 while fixing an earlier
`glib-2.0` failure in the same job. Installing the GTK/webkit system deps got
clippy past `glib-2.0` and revealed this deeper one. It has been unfixed since.

**Why it happens:** `transcribe-rs` enables `whisper-rs`'s `vulkan` feature
unconditionally on Linux. From `transcribe-rs-0.2.5/Cargo.toml`:

```toml
[target.'cfg(target_os = "linux")'.dependencies.whisper-rs]
version = "0.13.2"
features = ["vulkan"]
optional = true
```

`whisper-rs-sys/build.rs` then gates its cmake config on that feature
(`if cfg!(feature = "vulkan") { config.define("GGML_VULKAN", "ON"); }`), which
makes `find_package(Vulkan)` mandatory. The runner installs GTK/webkit deps but
no Vulkan toolchain, so the build script panics before clippy ever runs.

> **Correction (2026-08-27):** an earlier revision of this file blamed
> `cargo clippy --all-features` and recommended dropping that flag. That was
> wrong. `src-tauri/Cargo.toml` has no `[features]` section at all, so
> `--all-features` is effectively a no-op for this crate — removing it would not
> have fixed anything. The Vulkan feature comes from the dependency's own
> target-specific declaration, which no clippy flag can turn off.

**Fix:** install the Vulkan SDK on the runner, reusing the block already proven to
work in `build.yml` ("Prepare Vulkan SDK for Ubuntu 24.04") rather than guessing
at individual apt packages:

```yaml
- name: Install Vulkan SDK
  run: |
    wget -qO- https://packages.lunarg.com/lunarg-signing-key-pub.asc | sudo tee /etc/apt/trusted.gpg.d/lunarg.asc
    sudo wget -qO /etc/apt/sources.list.d/lunarg-vulkan-1.3.290-noble.list https://packages.lunarg.com/vulkan/1.3.290/lunarg-vulkan-1.3.290-noble.list
    sudo apt update
    sudo apt install vulkan-sdk -y
```

The only alternative would be patching or forking `transcribe-rs` to make the
Linux Vulkan backend optional, which is far more invasive than paying the
install cost in CI.

**Do not** consider this fixed just because the job is green-by-default; check
that the `Rust clippy` step itself succeeds, not only that the job passed via
`continue-on-error`. Once the step is genuinely passing, that
`continue-on-error: true` should be removed so the job actually gates.
