#!/bin/bash

# Script to fix port 4000 conflict
# Usage: ./scripts/fix-port.sh [PORT]

PORT=${1:-4000}

echo "🔍 Checking for processes using port $PORT..."

# Find process using the port
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  echo "✅ Port $PORT is free!"
  exit 0
fi

echo "⚠️  Found process $PID using port $PORT"
echo "📋 Process details:"
lsof -i:$PORT

echo ""
read -p "Kill process $PID? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  kill -9 $PID 2>/dev/null
  sleep 1
  
  # Verify it's killed
  if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "❌ Failed to kill process. Try manually: kill -9 $PID"
    exit 1
  else
    echo "✅ Process killed. Port $PORT is now free!"
    exit 0
  fi
else
  echo "❌ Process not killed. Port $PORT is still in use."
  echo "💡 To kill manually: kill -9 $PID"
  echo "💡 Or use a different port: PORT=4001 npm run dev"
  exit 1
fi
