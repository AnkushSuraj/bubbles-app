#!/bin/bash
set -e
export PATH="/root/.nvm/versions/node/v20.11.0/bin:$PATH"
cd /var/www/identity


npm install
pm2 delete 0 || true
pm2 start npm --name "Authentication" -- start

service nginx restart
