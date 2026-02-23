#!/bin/bash

echo "🛑 Stopping Time Tracker Application..."
echo ""

# Stop all pm2 processes
pm2 stop all

echo ""
echo "✅ All processes stopped!"
echo ""
echo "📊 Process Status:"
pm2 list
echo ""
