# Time Tracker - PM2 Process Management

This project uses PM2 for process management and monitoring of both frontend and backend services.

## Quick Start

### Start All Services
```bash
./start-all.sh
```

### Stop All Services
```bash
./stop-all.sh
```

### Restart All Services
```bash
./restart-all.sh
```

## PM2 Commands

### Process Management
```bash
# List all processes
pm2 list

# Start all services
pm2 start ecosystem.config.js

# Stop all services
pm2 stop all

# Restart all services
pm2 restart all

# Delete all processes from PM2
pm2 delete all

# Stop specific service
pm2 stop time-tracker-backend
pm2 stop time-tracker-frontend

# Restart specific service
pm2 restart time-tracker-backend
pm2 restart time-tracker-frontend
```

### Monitoring & Logs
```bash
# View real-time monitoring dashboard
pm2 monit

# View all logs
pm2 logs

# View backend logs
pm2 logs time-tracker-backend

# View frontend logs
pm2 logs time-tracker-frontend

# Flush all logs
pm2 flush

# View process details
pm2 show time-tracker-backend
pm2 show time-tracker-frontend
```

### Advanced Features
```bash
# Save process list for auto-restart on system reboot
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Monitor CPU and Memory usage
pm2 monit

# Generate startup script
pm2 startup
```

## Application Details

### Backend
- **Name:** time-tracker-backend
- **Port:** 4000
- **URL:** http://time.local:4000 (or http://localhost:4000)
- **Script:** backend/server.js
- **Logs:** logs/backend-*.log

### Frontend
- **Name:** time-tracker-frontend
- **Port:** 6969
- **URL:** http://time.local:6969 (or http://localhost:6969)
- **Script:** npm run dev
- **Logs:** logs/frontend-*.log

## Configuration

The PM2 configuration is defined in `ecosystem.config.js`:
- Auto-restart on crashes
- Memory limit: 500MB per process
- Log rotation and timestamping
- Environment variables management

## Troubleshooting

### Process not starting
```bash
# Check logs for errors
pm2 logs

# Check process status
pm2 list

# Restart with verbose output
pm2 restart all --update-env
```

### Port already in use
```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 6969 (frontend)
lsof -ti:6969 | xargs kill -9
```

### Clear everything and restart
```bash
pm2 delete all
pm2 kill
./start-all.sh
```

## Development Workflow

1. **Start development:**
   ```bash
   ./start-all.sh
   ```

2. **Make code changes** - PM2 will keep processes running

3. **View logs:**
   ```bash
   pm2 logs
   ```

4. **Restart after changes:**
   ```bash
   ./restart-all.sh
   ```

5. **Stop when done:**
   ```bash
   ./stop-all.sh
   ```

## Production Deployment

For production, consider:
1. Building the frontend: `cd time-tracker && npm run build`
2. Serving built files with a static server
3. Running backend in production mode
4. Setting up PM2 to start on system boot: `pm2 startup`
5. Saving process list: `pm2 save`

## Port Forwarding (Optional)

To access the frontend at http://time.local without specifying the port:

```bash
./setup-port-forwarding.sh
```

This sets up port forwarding from port 80 to 6969, allowing you to use:
- http://time.local instead of http://time.local:6969

Note: Port forwarding persists until system reboot and requires sudo privileges.

## Notes

- Logs are stored in the `logs/` directory
- PM2 keeps processes running even if they crash
- Use `pm2 monit` for real-time monitoring
- Backend runs on port 4000, frontend on port 6969
- Optional: Use port forwarding to access frontend at http://time.local
