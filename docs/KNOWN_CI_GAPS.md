# Known CI Gaps

Standing CI failures that are **not** caused by any single PR. They fail on every
pull request, which trains reviewers to ignore a red board. This file exists
because GitHub Issues is disabled on this repository.

Last verified: 2026-08-27, against run
[33076277512](https://github.com/artificemachine/phraser/actions/runs/33076277512)
(PR #19).

---

## L1 Dependency Risk — `bun audit` reports 42 vulnerabilities

**Job:** `security.yml` → `L1 Dependency Risk` → step `Bun audit`
**Blocking:** yes, the job has no `continue-on-error`
**Status:** 42 vulnerabilities — 20 high, 19 moderate, 3 low

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

**Suggested fix:**

1. `bun audit fix` — upgrades within existing ranges, low risk.
2. `bun audit fix --latest` for whatever remains; check whether this forces a
   Vite major bump.
3. Full test pass afterwards (`bun run test:unit`, `bun run test:playwright`,
   `bun run build`) — this moves build tooling, so a green unit suite alone is
   not sufficient evidence.

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

**Why it happens:** the step runs `cargo clippy --all-targets --all-features`.
`--all-features` enables the Vulkan backend of `whisper-rs`, whose build script
requires the Vulkan SDK. The runner installs GTK/webkit deps but no Vulkan
toolchain:

```yaml
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev \
librsvg2-dev libasound2-dev libssl-dev libgtk-layer-shell-dev
```

**Two candidate fixes:**

1. **Install the Vulkan toolchain** — add `libvulkan-dev`, `glslang-tools`, and
   `vulkan-headers` (or `vulkan-sdk`) to that step. Keeps `--all-features`
   coverage; costs build time on every run.
2. **Drop `--all-features`** — lint the feature set the app actually ships on
   Linux instead. Faster and more representative, but stops linting code behind
   other feature flags.

Option 2 is likely the better trade: the job's purpose is static analysis, not
proving that every backend compiles.

**Do not** consider this fixed just because the job is green-by-default; check
that the `Rust clippy` step itself succeeds, not only that the job passed via
`continue-on-error`.
