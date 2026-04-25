#!/bin/bash
# spanish-curriculum — Task File Validator
# PostToolUse hook: runs automatically after Write or Edit on any .md file.
# Checks structure and formatting rules without blocking file creation.

# Read JSON input from stdin (provided by Claude Code)
INPUT=$(cat)

# Extract file path — Write uses 'file_path', Edit uses 'path'
FILE_PATH=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    ti = d.get('tool_input', {})
    path = ti.get('file_path', '') or ti.get('path', '')
    print(path)
except:
    print('')
" 2>/dev/null)

# Only process .md files
[[ -z "$FILE_PATH" || "$FILE_PATH" != *.md ]] && exit 0

# Only process files that actually exist
[[ ! -f "$FILE_PATH" ]] && exit 0

# Only process curriculum task files (they always contain # --description--)
grep -q "^# --description--" "$FILE_PATH" 2>/dev/null || exit 0

FILENAME=$(basename "$FILE_PATH")
WARNINGS=0
ISSUES=()

# ── Rule 1: Audio comment ─────────────────────────────────────────────────────
if ! head -3 "$FILE_PATH" | grep -qiE "<!--.*audio.*-->"; then
    ISSUES+=("⚠️  No audio comment found at top")
    ISSUES+=("   Expected: <!-- (Audio) FILENAME — excerpt description -->")
    ((WARNINGS++))
fi

# ── Rule 2: Required sections ─────────────────────────────────────────────────
for section in "description" "instructions" "explanation"; do
    if ! grep -q "^# --${section}--" "$FILE_PATH"; then
        ISSUES+=("⚠️  Missing required section: # --${section}--")
        ((WARNINGS++))
    fi
done

# ── Rule 3: Task body (MC or FITB) ───────────────────────────────────────────
grep -q "^# --questions--" "$FILE_PATH" 2>/dev/null && HAS_MC=1 || HAS_MC=0
grep -q "^# --fillInTheBlank--" "$FILE_PATH" 2>/dev/null && HAS_FITB=1 || HAS_FITB=0

if [[ "$HAS_MC" -eq 0 && "$HAS_FITB" -eq 0 ]]; then
    ISSUES+=("⚠️  Missing task body: needs # --questions-- or # --fillInTheBlank--")
    ((WARNINGS++))
fi

# ── Rule 4: MC structure ─────────────────────────────────────────────────────
if [[ "$HAS_MC" -gt 0 ]]; then
    if ! grep -q "^## --text--" "$FILE_PATH"; then
        ISSUES+=("⚠️  MC task missing: ## --text--")
        ((WARNINGS++))
    fi
    if ! grep -q "^## --answers--" "$FILE_PATH"; then
        ISSUES+=("⚠️  MC task missing: ## --answers--")
        ((WARNINGS++))
    fi
    if ! grep -q "^## --video-solution--" "$FILE_PATH"; then
        ISSUES+=("⚠️  MC task missing: ## --video-solution-- (correct answer index)")
        ((WARNINGS++))
    fi
fi

# ── Rule 5: FITB structure ───────────────────────────────────────────────────
if [[ "$HAS_FITB" -gt 0 ]]; then
    if ! grep -q "^## --sentence--" "$FILE_PATH"; then
        ISSUES+=("⚠️  FITB task missing: ## --sentence--")
        ((WARNINGS++))
    fi
    if ! grep -q "^## --blanks--" "$FILE_PATH"; then
        ISSUES+=("⚠️  FITB task missing: ## --blanks--")
        ((WARNINGS++))
    fi
fi

# ── Rule 6: Backtick misuse detection ────────────────────────────────────────
# Flag double-backtick (likely escaped backtick or formatting error)
if grep -qE '``[^`]' "$FILE_PATH" 2>/dev/null; then
    ISSUES+=("⚠️  Possible double-backtick detected — check for formatting errors")
    ((WARNINGS++))
fi

# Flag empty backtick pairs
if grep -qE '``' "$FILE_PATH" 2>/dev/null; then
    ISSUES+=("⚠️  Empty backtick pair `` found — likely a formatting mistake")
    ((WARNINGS++))
fi

# ── Output ───────────────────────────────────────────────────────────────────
echo ""
echo "┌─ 📋 Task Validator: $FILENAME"

if [[ ${#ISSUES[@]} -eq 0 ]]; then
    echo "│  ✅ All structure checks passed."
else
    for issue in "${ISSUES[@]}"; do
        echo "│  $issue"
    done
    echo "│"
    echo "│  $WARNINGS warning(s) — review before committing to GitHub."
fi

echo "└──────────────────────────────────────────────"
echo ""

exit 0
