#!/bin/bash
# What2Eat Install Script
# Sets up a personal What2Eat instance from the template.
# Usage: bash install.sh

set -e

TEMPLATE_REPO="https://github.com/richardzhuang0412/What2Eat.git"

echo ""
echo "Welcome to What2Eat!"
echo "I'll set up your personal eating manager in a few seconds."
echo ""

# Ask for name
read -p "What's your name? " USERNAME
if [ -z "$USERNAME" ]; then
    USERNAME="Friend"
fi

# Ask for install location
DEFAULT_DIR="$HOME/What2Eat"
read -p "Where should I set it up? [$DEFAULT_DIR] " INSTALL_DIR
INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_DIR}"

# Check if directory already exists
if [ -d "$INSTALL_DIR" ]; then
    echo ""
    echo "Looks like $INSTALL_DIR already exists."
    read -p "Remove it and start fresh? (y/n) " CONFIRM
    if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
        rm -rf "$INSTALL_DIR"
    else
        echo "Okay, try a different location next time. Bye!"
        exit 0
    fi
fi

echo ""
echo "Setting things up..."

# Clone template
git clone --depth 1 "$TEMPLATE_REPO" "$INSTALL_DIR" 2>/dev/null
cd "$INSTALL_DIR"

# Remove template git history and start fresh
rm -rf .git
git init -q
git branch -m main 2>/dev/null || true

# Transform template into app instance
# Rename CLAUDE.app.md -> CLAUDE.md
if [ -f "CLAUDE.app.md" ]; then
    mv CLAUDE.app.md CLAUDE.md
fi

# Create personal CLAUDE.local.md
cat > CLAUDE.local.md << LOCALEOF
# What2Eat — Personal Overrides

User: $USERNAME

## Custom Instructions
(Add any personal instructions or overrides here. This file is never overwritten by /sync.)
LOCALEOF

# Remove dev-only files
rm -f README.md
rm -rf tasks/

# Add template remote for future /sync
git remote add template "$TEMPLATE_REPO"

# Initial commit
git add -A
git commit -q -m "setup: initialized What2Eat for $USERNAME"

echo ""
echo "All done, $USERNAME!"
echo ""
echo "Your What2Eat is ready at: $INSTALL_DIR"
echo ""
echo "Next steps:"
echo "  1. Open that folder in Claude Code"
echo "  2. Type /setup to tell me about your food preferences and what's in your kitchen"
echo "  3. Or just start chatting — 'What should I eat tonight?'"
echo ""
echo "Have fun!"
