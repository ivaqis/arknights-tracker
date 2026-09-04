#!/bin/sh
set -e

npm run prisma:v2:migrate
exec node dist/src/main.js
