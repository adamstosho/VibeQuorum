#!/bin/bash
# Script to fix Git email for Vercel deployment

echo "🔧 Fixing Git Email Configuration"
echo ""

# Check current config
echo "Current Git Config:"
echo "  Email: $(git config user.email || echo 'Not set')"
echo "  Name: $(git config user.name || echo 'Not set')"
echo ""

# Instructions
echo "To fix the Vercel deployment error, you need to:"
echo ""
echo "1. Set your GitHub email address:"
echo "   git config user.email 'your-github-email@example.com'"
echo ""
echo "2. Set your GitHub username:"
echo "   git config user.name 'Your GitHub Username'"
echo ""
echo "3. Or use GitHub's no-reply email (recommended):"
echo "   git config user.email 'your-username@users.noreply.github.com'"
echo ""
echo "4. Make a new commit with the correct email:"
echo "   git add ."
echo "   git commit -m 'Fix git config'"
echo "   git push"
echo ""
echo "To find your GitHub no-reply email:"
echo "  - Go to: https://github.com/settings/emails"
echo "  - Check 'Keep my email addresses private'"
echo "  - Use the format shown: username@users.noreply.github.com"
echo ""
