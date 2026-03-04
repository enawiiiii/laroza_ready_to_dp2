#!/bin/bash
mkdir -p /home/runner/workspace/data/db

pkill mongod 2>/dev/null || true
sleep 1

mongod --dbpath /home/runner/workspace/data/db --bind_ip 127.0.0.1 &
MONGOD_PID=$!
echo "MongoDB starting (PID: $MONGOD_PID)"

sleep 3

cd /home/runner/workspace/backend
node server.js
