#!/bin/sh
set -e

npm run prisma:v2:migrate
exec "$@"
