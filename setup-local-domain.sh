#!/bin/bash

# Script to set up local domain for Time Tracker

DOMAIN="${1:-timetracker.local}"

echo "🌐 Setting up local domain: $DOMAIN"
echo ""

# Check if domain already exists in /etc/hosts
if grep -q "$DOMAIN" /etc/hosts 2>/dev/null; then
    echo "⚠️  Domain $DOMAIN already exists in /etc/hosts"
    echo "Current entry:"
    grep "$DOMAIN" /etc/hosts
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi

    # Remove old entry
    sudo sed -i '' "/$DOMAIN/d" /etc/hosts
fi

# Add new entry
echo "Adding entry to /etc/hosts..."
echo "127.0.0.1    $DOMAIN" | sudo tee -a /etc/hosts > /dev/null

echo ""
echo "✅ Domain configured successfully!"
echo ""
echo "🌐 Access points:"
echo "  Backend:  http://$DOMAIN:4000"
echo "  Frontend: http://$DOMAIN:6969"
echo ""
echo "📝 Notes:"
echo "  - You can now use http://$DOMAIN:6969 instead of http://localhost:6969"
echo "  - The domain will persist across restarts"
echo "  - To remove it later, edit /etc/hosts and delete the line with $DOMAIN"
echo ""
echo "🔍 Current /etc/hosts entry:"
grep "$DOMAIN" /etc/hosts
echo ""
