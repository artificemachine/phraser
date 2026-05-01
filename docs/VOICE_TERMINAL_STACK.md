# Voice-Controlled Terminal Stack

> Fully offline, private voice navigation for Ghostty terminal.
> No cloud. No data sent. Everything runs locally.

---

## Goal

Speak to your terminal. Navigate directories, browse files, run git commands,
and interact with Claude Code — all by voice, all offline.

---

## Stack Overview

```
┌─────────────────────────────────────────────┐
│                  Ghostty                     │  Terminal emulator
│  ┌─────────────────────────────────────────┐ │
│  │               Zellij                    │ │  Multiplexer / layout
│  │  ┌──────────┐  ┌──────────────────────┐ │ │
│  │  │   Yazi   │  │    Claude Code        │ │ │
│  │  │  files   │  │    AI coding          │ │ │
│  │  └──────────┘  └──────────────────────┘ │ │
│  │  ┌──────────┐  ┌──────────────────────┐ │ │
│  │  │ lazygit  │  │    zsh + zoxide       │ │ │
│  │  │   git    │  │    shell + smart cd   │ │ │
│  │  └──────────┘  └──────────────────────┘ │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
             ▲
             │ voice paste (system-level)
             │
        [ phraser ]  ← Whisper (offline STT)
             │
        [ Ollama  ]  ← Local LLM (complex queries only)
```

---

## Tools

| Tool                                                | Role                           | Replaces             |
| --------------------------------------------------- | ------------------------------ | -------------------- |
| [Ghostty](https://ghostty.org/)                     | Terminal emulator              | iTerm2, Alacritty    |
| [Zellij](https://zellij.dev/)                       | Multiplexer, splits, sessions  | tmux                 |
| [Yazi](https://yazi-rs.github.io/)                  | TUI file manager               | `ls` + `cd` + Finder |
| [lazygit](https://github.com/jesseduffield/lazygit) | Git TUI                        | raw `git` commands   |
| [Claude Code](https://claude.ai/code)               | AI coding agent                | —                    |
| [zoxide](https://github.com/ajeetdsouza/zoxide)     | Smart `cd` with memory         | `cd`                 |
| [phraser](https://github.com/celstnblacc/phraser)   | Voice → text (offline Whisper) | —                    |
| [Ollama](https://ollama.com/)                       | Local LLM for NL→bash          | cloud LLMs           |

---

## Voice Layer Architecture

phraser runs at the system level and pastes into whichever Ghostty pane is focused.
Three action keys handle the three main use cases:

```
Voice input
    │
    ├─ Action 1 → zoxide navigation     → z <spoken words>      → shell pane
    ├─ Action 2 → yazi open             → yazi                  → file pane
    ├─ Action 3 → bash command (Ollama) → full NL→bash          → shell pane
    └─ default  → raw transcription     → paste as-is           → any pane
```

### Voice command map

| You say                 | Action key | Output                | Executes           |
| ----------------------- | ---------- | --------------------- | ------------------ |
| _"go to phraser"_       | `1`        | `z phraser`           | jumps to dir       |
| _"go up"_               | `1`        | `z ..`                | goes up one level  |
| _"browse files"_        | `2`        | `yazi`                | opens file manager |
| _"find all rust files"_ | `3`        | `find . -name "*.rs"` | Ollama generated   |
| _"show disk usage"_     | `3`        | `du -sh .`            | Ollama generated   |
| _"git status"_          | default    | `git status`          | raw paste          |

---

## Implementation Plan

### Phase 1 — Core tools setup ✅

- [x] Install Ghostty → https://ghostty.org/download
- [x] Install Zellij → `brew install zellij`
- [x] Install Yazi → `brew install yazi`
- [x] Install lazygit → `brew install lazygit`
- [x] Install zoxide → `brew install zoxide`
- [x] Install Ollama → `brew install ollama`
- [x] Pull local model → `ollama pull qwen2.5:0.5b`
- [x] Init zoxide in zsh → added to `~/.zshrc`:
  ```zsh
  eval "$(zoxide init zsh)"
  ```

### Phase 2 — Zellij layout ✅

Create `~/.config/zellij/layouts/dev.kdl`:

```kdl
layout {
    pane size=1 borderless=true {
        plugin location="zellij:tab-bar"
    }
    pane split_direction="vertical" {
        pane split_direction="horizontal" size="30%" {
            pane name="files" command="yazi" size="65%"
            pane name="git" command="lazygit"
        }
        pane split_direction="horizontal" {
            pane name="claude" command="sh" args=["-c", "command -v claude >/dev/null 2>&1 && claude || echo 'Claude Code not installed. Run: npm i -g @anthropic-ai/claude-code'"]
            pane name="shell" focus=true
        }
    }
    pane size=2 borderless=true {
        plugin location="zellij:status-bar"
    }
}
```

Launch with:

```bash
zellij --layout dev
```

Or add alias to `~/.zshrc`:

```zsh
alias dev="zellij --layout dev"
```

### Phase 3 — phraser action keys ✅

Configure in phraser **Settings → Post-Processing → Actions**:

All three actions use the Custom provider (Ollama) at `http://localhost:11434/v1` with `qwen2.5:0.5b`.

**Action 1 — zoxide navigation**

```
Key: 1
Name: Navigate
Provider: Custom → http://localhost:11434/v1
Model: qwen2.5:0.5b
Prompt: Prepend 'z ' to the user input and output only that. Nothing else. No explanation.
        Example: input 'phraser source' → output 'z phraser source'
        Example: input 'go up' → output 'z ..'
Auto-submit: ON
```

**Action 2 — Open Yazi**

```
Key: 2
Name: Browse Files
Provider: Custom → http://localhost:11434/v1
Model: qwen2.5:0.5b
Prompt: Output only the word: yazi
Auto-submit: ON
```

**Action 3 — NL to bash (Ollama)**

> ⚠️ Auto-submit is ON. The LLM-generated command executes immediately. Do not use this
> for destructive operations without reviewing the output first. Disable auto-submit if
> you want a confirmation step before execution.

```
Key: 3
Name: Bash Command
Provider: Custom → http://localhost:11434/v1
Model: qwen2.5:0.5b
Prompt: Convert the spoken text to a single bash command for macOS zsh.
        Output ONLY the command. No explanation. No backticks. No markdown.
Auto-submit: ON
```

### Phase 4 — Yazi + Ghostty integration ✅

Yazi has native Ghostty image preview support.
Add to `~/.config/yazi/yazi.toml`:

```toml
[manager]
ratio          = [1, 2, 4]
sort_by        = "modified"
sort_reverse   = true
show_hidden    = false
show_symlink   = true

[preview]
image_protocol = "iterm2"
image_filter   = "lanczos3"
image_quality  = 90
tab_size       = 2
max_width      = 600
max_height     = 900
```

Add shell wrapper to `~/.zshrc` so `cd` follows when you quit Yazi:

```zsh
function y() {
    local tmp="$(mktemp -t "yazi-cwd")"
    yazi "$@" --cwd-file="$tmp"
    if cwd="$(cat -- "$tmp")" && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
        builtin cd -- "$cwd"
    fi
    rm -f -- "$tmp"
}
```

Now `y` opens Yazi and when you quit, your shell follows to the last dir you browsed.

---

## Workflow Example

```
1. Open Ghostty
2. Type: dev  →  Zellij loads full layout
   ├── top-left:  Yazi (file browser)
   ├── bot-left:  lazygit (git)
   ├── top-right: Claude Code (AI)
   └── bot-right: shell (focused)

3. Voice: "go to phraser src" + Action 1
   → z phraser src → shell jumps to dir

4. Voice: "browse files" + Action 2
   → yazi opens in file pane

5. Voice: "find all typescript files modified today" + Action 3
   → Ollama → find . -name "*.ts" -mtime -1 → executes

6. Voice: "implement the voice nav zsh plugin" (default, no action key)
   → pastes into Claude Code pane as natural language request
```

---

## Privacy & Offline Guarantee

| Component   | Data stays local?                         |
| ----------- | ----------------------------------------- |
| Ghostty     | Yes — local app                           |
| Zellij      | Yes — local app                           |
| Yazi        | Yes — local app                           |
| lazygit     | Yes — local app                           |
| zoxide      | Yes — local db in `~/.local/share/zoxide` |
| phraser     | Yes — Whisper runs on-device              |
| Ollama      | Yes — model runs on-device                |
| Claude Code | **No** — sends code to Anthropic API      |

> Claude Code is the only component that touches the network.
> All voice processing, navigation, and bash generation is 100% local.

---

## References

- Ghostty docs: https://ghostty.org/docs
- Zellij docs: https://zellij.dev/documentation/
- Yazi docs: https://yazi-rs.github.io/docs/
- lazygit repo: https://github.com/jesseduffield/lazygit
- zoxide repo: https://github.com/ajeetdsouza/zoxide
- Ollama: https://ollama.com/
- Ghostty + Yazi guide: https://yingqijing.medium.com/ghostty-and-yazi-the-best-terminal-tools-baf5b90c76bf

---

_Last updated: 2026-03-05_
