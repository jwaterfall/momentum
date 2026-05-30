#!/usr/bin/env bash
# Non-blocking reminder: when Claude is about to run `git commit`, nudge it to
# run the audit in docs/audit-checklist.md against the staged diff first.
# Reads the PreToolUse payload on stdin; only reacts to git commit commands.
input=$(cat)
case "$input" in
*"git commit"*)
  printf '%s' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"Reminder: before committing, run the audit in docs/audit-checklist.md against the staged diff (git diff --cached) and report findings. This is a non-blocking nudge."}}'
  ;;
esac
exit 0
