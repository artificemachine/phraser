# Voice Terminal — Beginner Guide

> How to use the full Ghostty + Zellij + Yazi + lazygit + phraser stack day-to-day.

---

## Step 1 — Open Ghostty and load your workspace

```bash
source ~/.zshrc   # first time only, to load new aliases
dev               # launches everything
```

You'll see 4 panes appear:

```
┌─────────────────┬──────────────────────┐
│                 │                      │
│   Yazi          │   Claude Code        │
│   (files)       │   (AI coding)        │
│                 │                      │
├─────────────────┼──────────────────────┤
│                 │                      │
│   lazygit       │   shell ← you type   │
│   (git)         │   here               │
│                 │                      │
└─────────────────┴──────────────────────┘
```

---

## Step 2 — Move between panes

Zellij default shortcuts:

| Action                          | Keys                    |
| ------------------------------- | ----------------------- |
| Move to pane left/right/up/down | `Ctrl+p` then arrow key |
| New tab                         | `Ctrl+t` then `n`       |
| Close pane                      | `Ctrl+p` then `x`       |
| Detach (keep running)           | `Ctrl+o` then `d`       |
| Re-attach later                 | `zellij attach`         |

---

## Step 3 — Navigate files with Yazi

Click the Yazi pane or move to it. Basic keys:

| Key                   | Action                           |
| --------------------- | -------------------------------- |
| `↑` `↓` or `j` `k`    | move up/down                     |
| `→` or `l` or `Enter` | open folder or file              |
| `←` or `h`            | go back (parent folder)          |
| `q`                   | quit (shell follows to last dir) |
| `Space`               | select file                      |
| `y`                   | copy selected (inside Yazi)      |
| `p`                   | paste                            |
| `d`                   | cut                              |
| `D`                   | delete                           |
| `/`                   | search by name                   |

> **Note:** `y` in the shell opens Yazi. Inside Yazi, `y` copies a file. They are different contexts — don't confuse them.

---

## Step 4 — Jump to directories with zoxide

In your **shell pane**, type:

```bash
z phraser        # jumps to phraser project
z src            # jumps to most visited "src" dir
z downloads      # jumps to Downloads
```

zoxide **learns over time** — the more you visit a folder, the smarter it gets at guessing which one you mean.

---

## Step 5 — Git with lazygit

Move to the lazygit pane. Basic keys:

| Key     | Action             |
| ------- | ------------------ |
| `↑` `↓` | navigate           |
| `Space` | stage/unstage file |
| `c`     | commit             |
| `p`     | push               |
| `P`     | pull               |
| `b`     | branches           |
| `z`     | undo last commit   |
| `q`     | quit               |

---

## Step 6 — Voice commands with phraser

Make sure your **shell pane is focused**, then:

| You want to        | Do this                                               |
| ------------------ | ----------------------------------------------------- |
| Jump to a dir      | Hold `Ctrl+1` → speak dir name → release              |
| Open Yazi          | Hold `Ctrl+2` → release                               |
| Run a bash command | Hold `Ctrl+3` → speak intent → release                |
| Just dictate text  | Hold `Option+Space` → speak → release (no number key) |

> ⚠️ **Action 3 executes immediately.** The LLM-generated bash command runs without confirmation. Only use Action 3 for safe, read-only operations until you're confident in the output. Say something destructive and it will execute.

**Example voice session:**

```
"go to phraser"   [action 1] → z phraser             → shell jumps there
"browse files"    [action 2] → yazi                  → file browser opens
"find rust files" [action 3] → find . -name "*.rs"   → executes
```

---

## Step 7 — Talk to Claude Code

Move to the Claude Code pane, just speak or type naturally:

```
"explain this file"
"fix the bug in clipboard.rs"
"write tests for the history manager"
```

---

## Daily workflow

```
Open Ghostty
    ↓
type: dev
    ↓
┌── Yazi: browse your project
├── lazygit: stage & commit changes
├── Claude Code: ask for help / write code
└── shell: run commands by voice or typing
```

---

## Cheat sheet

```
dev              → launch full workspace
z <name>         → jump to directory
y                → open file browser (cd follows on quit)
lazygit          → open git UI

Voice shortcuts (phraser):
  Ctrl+1 → navigate (zoxide)
  Ctrl+2 → browse files (yazi)
  Ctrl+3 → bash command (Ollama)
  Option+Space     → dictate text (raw)
```

---

_Last updated: 2026-03-05_
_Related: [VOICE_TERMINAL_STACK.md](./VOICE_TERMINAL_STACK.md)_
