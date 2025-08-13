#!/bin/sh

# Initialize demo data if not exists
if [ ! -f /app/data/demo.db ]; then
  /app/init-demo.sh
fi

# Start supervisor
exec /usr/bin/supervisord -n -c /etc/supervisord.conf