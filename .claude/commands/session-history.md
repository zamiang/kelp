---
allowed-tools: [Bash, Read, Write]
description: Save and manage Claude Code conversation transcripts for analysis
---

# session-history

Save Claude Code conversation transcripts for historical analysis (optional feature).

**IMPORTANT**: If adding dates to any files, always use `date "+%Y-%m-%d"` to get the current date. Never guess or assume dates.

> **Repository note**: This repo saves its development sessions as examples. See `session-history/` for real usage.

## Usage

<bash>
npm run session:save --silent
</bash>

## What It Does

Manages raw session history separate from checkpoints:
- **save**: Capture full conversation transcript
- **delta**: Save only changes since last save
- **list**: Show recent session files

## Output

Session files are saved in `session-history/YYYY-MM-DD/` with format:
- `session-NNN-HHMM.txt` for full saves
- `session-NNN-HHMM-delta.txt` for delta saves

## When to Use

Consider saving sessions:
- Before context compaction
- After solving complex problems
- When discovering interesting patterns
- Before ending productive sessions

Or don't - this feature is entirely optional.

## Options

```bash
# Save with description
npm run session:save -- "feature-complete"

# Save delta only
npm run session:delta

# List recent sessions
npm run session:list

```

## Important Notes

- This preserves raw conversation text, not formatted markdown
- Different from checkpoints (which save work state)
- Manual copy-paste required (Claude API limitation)
- Delta saves minimize storage by only saving new content

## Best Practices

1. Save before any context reset
2. Use descriptive names for important sessions
3. Review saved sessions for patterns