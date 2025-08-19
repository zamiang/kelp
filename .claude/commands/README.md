---
description: Command organization and usage guide for all 18 Claude commands
last-updated: 2025-08-19
---

# Claude Commands Structure

## Organization

Commands are organized by frequency of use and purpose:

### All Commands (18 total)

- `commit` - Atomic commits with quality checks (1-3 files)
- `deploy` - Production deployment workflow
- `dev-setup` - Development environment setup
- `docs` - Documentation maintenance
- `docs-explain` - Educational documentation walkthrough
- `extension-dev` - Chrome extension development workflow
- `hygiene` - Code quality checks
- `learn` - Capture insights and learnings
- `maintainability` - Code quality analysis
- `monitor` - GitHub repository monitoring
- `next` - Get workflow guidance
- `push` - Git push with validations
- `reflect` - Periodic reflection
- `retrospective` - Session analysis
- `session-history` - Session preservation
- `tdd` - Test-driven development
- `test-suite` - Comprehensive testing with coverage analysis
- `todo` - Task management

## Usage

All commands work the same way:

```bash
/commit
/maintainability
/session-history
# etc.
```

## Finding Commands

```bash
# List all available commands
ls -1 .claude/commands/*.md | sed 's|.*/||' | sed 's|\.md||' | grep -v README
```

## Command Philosophy

- **Simple flat structure**: All commands in one directory for easy discovery
- **Minimal by default**: Token-efficient implementations
- **Focused purpose**: Each command does one thing well
