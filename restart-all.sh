#!/bin/bash

echo "🔄 Restarting Time Tracker Application..."
echo ""

# Restart all pm2 processes
pm2 restart all

echo ""
echo "✅ All processes restarted!"
echo ""
echo "📊 Process Status:"
pm2 list
echo ""
