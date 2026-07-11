# Releasing phraser

How to create and publish a new release of phraser.

## Prerequisites

### Required: Tauri Updater Signing Key

The auto-updater needs a signing key so the app can verify updates are authentic.

Generate one (do this once):

```bash
bun tauri signer generate -w ~/.tauri/phraser.key
```

This creates two files:

- `~/.tauri/phraser.key` — the private key (add to GitHub Secrets)
- `~/.tauri/phraser.key.pub` — the public key (embedded in the app)

Then add these secrets to your GitHub repo (**Settings → Secrets and variables → Actions → New repository secret**):

| Secret                               | Value                                |
| ------------------------------------ | ------------------------------------ |
| `TAURI_SIGNING_PRIVATE_KEY`          | Contents of `~/.tauri/phraser.key`   |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Password you chose during generation |

> **Important:** Add secrets in the **repository** settings (not your GitHub account settings). Navigate to your repo → Settings → Secrets and variables → Actions.

### Apple Code Signing (Currently Disabled)

Apple code signing is **disabled** in the release workflow (`sign-binaries: false` in `release.yml`). Without an Apple Developer certificate ($99/year), macOS users will see a Gatekeeper warning on first launch. They can bypass it by right-clicking the app and selecting "Open."

The build workflow in `.github/workflows/build.yml` conditionally skips all Apple signing steps when `sign-binaries` is `false`, so no Apple secrets are needed.

If you want to enable code signing later:

1. Enroll at [developer.apple.com](https://developer.apple.com/account) ($99/year)
2. Create a **Developer ID Application** certificate
3. Export it as `.p12` from Keychain Access
4. Base64 encode it: `base64 -i certificate.p12 | pbcopy`
5. Add these secrets to GitHub:

| Secret                       | Value                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| `APPLE_CERTIFICATE`          | Base64-encoded `.p12` file                                         |
| `APPLE_CERTIFICATE_PASSWORD` | Password set during `.p12` export                                  |
| `KEYCHAIN_PASSWORD`          | Any random string (used internally by CI)                          |
| `APPLE_ID`                   | Your Apple Developer account email                                 |
| `APPLE_ID_PASSWORD`          | App-specific password (generate at appleid.apple.com)              |
| `APPLE_TEAM_ID`              | 10-character team ID from developer.apple.com → Membership details |

6. Change `sign-binaries: false` to `sign-binaries: true` in `.github/workflows/release.yml`

## Creating a Release

### 1. Bump the Version

Update the version in `src-tauri/tauri.conf.json`:

```json
"version": "0.8.0"
```

Commit and push:

```bash
git add src-tauri/tauri.conf.json
git commit -m "chore: bump version to 0.8.0"
git push origin main
```

> **Tip:** Run `bun run format` before committing to avoid pre-commit hook failures from Prettier.

### 2. Trigger the Release Workflow

1. Go to your repo on GitHub
2. Navigate to **Actions → Release**
3. Click **Run workflow** (select the `main` branch)

The workflow will:

- Read the version from `tauri.conf.json`
- Create a **draft** GitHub Release tagged `v0.8.0`
- Build macOS binaries (Apple Silicon + Intel)
- Build Linux binaries (x86_64 + ARM64: .deb, .rpm, .AppImage)
- Upload all artifacts to the draft release

### 3. Review and Publish

1. Go to **Releases** on GitHub
2. Open the draft release
3. Review the auto-generated release notes
4. Edit if needed, then click **Publish release**

### If a Release Fails

1. Go to **Releases** on GitHub
2. Delete the failed **draft** release
3. Fix the issue, push the fix
4. Re-trigger the workflow from **Actions → Release → Run workflow**

## What Gets Built

| Platform      | Targets                       | Artifacts                   |
| ------------- | ----------------------------- | --------------------------- |
| macOS         | `aarch64-apple-darwin` (ARM)  | `.dmg`                      |
| macOS         | `x86_64-apple-darwin` (Intel) | `.dmg`                      |
| Linux (22.04) | `x86_64-unknown-linux-gnu`    | `.deb`                      |
| Linux (24.04) | `x86_64-unknown-linux-gnu`    | `.AppImage`, `.rpm`         |
| Linux (24.04) | `aarch64-unknown-linux-gnu`   | `.AppImage`, `.deb`, `.rpm` |

> **Note:** Windows is not currently in the release matrix. To add it, update `.github/workflows/release.yml`.

## Current Signing Configuration

| Setting         | Value   | Notes                                                            |
| --------------- | ------- | ---------------------------------------------------------------- |
| `sign-binaries` | `false` | Apple code signing disabled — no Apple Developer Program secrets |
| Tauri updater   | ✅ Set  | `TAURI_SIGNING_PRIVATE_KEY` + password added to GitHub Secrets   |
| Gatekeeper      | Manual  | Users right-click → Open to bypass on first launch               |

## Landing Page

The project website is served via GitHub Pages from the `docs/` folder on the `main` branch. Any changes pushed to `docs/` will automatically deploy to `artificemachine.github.io/phraser`.

To set up GitHub Pages:

1. Go to repo **Settings → Pages**
2. Under "Source", select **Deploy from a branch**
3. Set branch to `main` and folder to `/docs`
4. Save

## Troubleshooting

**Build fails on macOS with signing errors (`SecKeychainItemImport`):**
This happens when `sign-binaries: true` but Apple signing secrets are not configured. Fix: set `sign-binaries: false` in `.github/workflows/release.yml`. The build steps in `build.yml` are conditional on `inputs.sign-binaries`, so setting it to `false` skips all Apple signing.

**Pre-commit hook fails:**
Run `bun run format` before committing to fix Prettier formatting issues.

**Duplicate test files with spaces in filename:**
If you see errors like `invalid character ' ' in crate name`, check for duplicated files in `src-tauri/tests/` (e.g. `branding_consistency 2.rs`). Delete the duplicates.

**Version mismatch:**
The version is read from `src-tauri/tauri.conf.json` — make sure it's updated there, not in `package.json` (which may have a different version).

**GitHub Secrets not found:**
Add secrets in the **repository** settings (Settings → Secrets and variables → Actions), not in your GitHub account settings.
