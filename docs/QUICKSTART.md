# phraser — Quick Start

Get from zero to a running voice terminal.

---

## Prerequisites

Install these before anything else:

```bash
# Rust (latest stable)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Bun
curl -fsSL https://bun.sh/install | bash

# Homebrew (macOS)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Claude Code (required for the claude pane in the dev layout)
# See: https://claude.ai/code for the latest install instructions
npm install -g @anthropic-ai/claude-code
```

---

## 1. Clone & install dependencies

```bash
git clone https://github.com/artificemachine/phraser.git
cd phraser
bun install
```

---

## 2. Download the VAD model (required)

```bash
mkdir -p src-tauri/resources/models
curl -o src-tauri/resources/models/silero_vad_v4.onnx \
  https://blob.handy.computer/silero_vad_v4.onnx
```

---

## 3. Run or build

**Dev mode** (faster, hot reload):

```bash
bun run tauri dev

# If cmake error on macOS:
CMAKE_POLICY_VERSION_MINIMUM=3.5 bun run tauri dev
```

**Build .app bundle** (production):

```bash
bun run app:create
# Output: src-tauri/target/release/bundle/macos/phraser.app
open src-tauri/target/release/bundle/macos/phraser.app
```

---

## 4. First launch checklist

When phraser opens for the first time:

- [ ] Grant **microphone** permission when prompted
- [ ] Grant **accessibility** permission (System Settings → Privacy → Accessibility)
- [ ] Go to **Settings → Models** → download a model (Parakeet V3 recommended)
- [ ] Set your **shortcut** in Settings → Bindings (default: `Option+Space`)
- [ ] Test: focus any text field, hold `Option+Space`, speak, release

---

## 5. Voice terminal stack (optional)

Set up the full offline voice-controlled terminal:

**5a. Install tools:**

```bash
brew install zellij yazi zoxide lazygit ollama
```

**5b. Start Ollama and pull the local LLM:**

```bash
# Start Ollama server (run once, keep it running)
ollama serve &>/dev/null &
sleep 2
ollama pull qwen2.5:0.5b
```

**5c. Configure your shell (`~/.zshrc`):**

```bash
echo 'eval "$(zoxide init zsh)"' >> ~/.zshrc
echo 'alias dev="zellij --layout dev"' >> ~/.zshrc

# cd-follow wrapper for Yazi
cat >> ~/.zshrc << 'EOF'
function y() {
    local tmp="$(mktemp -t "yazi-cwd")"
    yazi "$@" --cwd-file="$tmp"
    if cwd="$(cat -- "$tmp")" && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
        builtin cd -- "$cwd"
    fi
    rm -f -- "$tmp"
}
EOF

source ~/.zshrc
```

Then launch your full workspace:

```bash
dev
```

> See [VOICE_TERMINAL_STACK.md](./VOICE_TERMINAL_STACK.md) for full architecture.
> See [VOICE_TERMINAL_BEGINNER_GUIDE.md](./VOICE_TERMINAL_BEGINNER_GUIDE.md) for day-to-day usage.

---

## 6. Verify everything works

```bash
bun run lint          # frontend lint
bun run format:check  # formatting
(cd src-tauri && cargo test)  # rust tests (125 tests)
```

---

## Shortcuts reference

| Shortcut             | Action                      |
| -------------------- | --------------------------- |
| `Option+Space`       | Record / transcribe         |
| `Option+Shift+Space` | Record + post-process       |
| `Escape`             | Cancel recording            |
| `Cmd+Shift+D`        | Debug mode                  |
| `Ctrl+1`             | Voice navigate (zoxide)     |
| `Ctrl+2`             | Voice open Yazi             |
| `Ctrl+3`             | Voice bash command (Ollama) |

---

## Troubleshooting

| Problem               | Fix                                                      |
| --------------------- | -------------------------------------------------------- |
| App won't paste       | Check Accessibility permission in System Settings        |
| No transcription      | Check microphone permission, confirm model is downloaded |
| cmake error on dev    | Prefix with `CMAKE_POLICY_VERSION_MINIMUM=3.5`           |
| Ollama not running    | Run `ollama serve` in a background terminal              |
| `dev` alias not found | Run `source ~/.zshrc` first                              |

---

_Last updated: 2026-03-05_
_Related: [VOICE_TERMINAL_STACK.md](./VOICE_TERMINAL_STACK.md) · [VOICE_TERMINAL_BEGINNER_GUIDE.md](./VOICE_TERMINAL_BEGINNER_GUIDE.md)_
