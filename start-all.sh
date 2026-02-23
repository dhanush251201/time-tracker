#!/bin/bash

echo "🚀 Starting Time Tracker Application..."
echo ""

# Start all processes with pm2
pm2 start ecosystem.config.cjs

echo ""
echo "✅ Application started!"
echo ""
echo "📊 Process Status:"
pm2 list

echo ""
echo "🔍 Monitoring commands:"
echo "  pm2 list          - List all processes"
echo "  pm2 logs          - View all logs"
echo "  pm2 logs backend  - View backend logs"
echo "  pm2 logs frontend - View frontend logs"
echo "  pm2 monit         - Monitor processes in real-time"
echo "  pm2 stop all      - Stop all processes"
echo "  pm2 restart all   - Restart all processes"
echo "  pm2 delete all    - Delete all processes"
echo ""
echo "🌐 Access points:"
echo "  Backend:  http://time.local:4000 (or http://localhost:4000)"
echo "  Frontend: http://time.local:6969 (or http://localhost:6969)"
echo ""
echo "💡 Tip: Run ./setup-port-forwarding.sh to access at http://time.local (without port)"
echo ""
