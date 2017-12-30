#!/usr/bin/env bash

SCRIPTS_DIR=$(cd "$(dirname "$0")"; pwd)
BASE_DIR=$(dirname "${SCRIPTS_DIR}")

PACKAGE_FILE=${BASE_DIR}/package.json
PACKAGE_NAME=$(awk '/^  "name": "/ { print $2; }' < "${PACKAGE_FILE}" | sed 's|[^A-Za-z0-9./-]||g')
PACKAGE_VERSION=$(awk '/^  "version": "/ { print $2; }' < "${PACKAGE_FILE}" | sed 's|[^0-9.]||g')

BABEL=${BASE_DIR}/node_modules/.bin/babel

(
  cd "${BASE_DIR}"
  rm -fR lib
  "${BABEL}" \
    --ignore 'spec.*.js,spec.js' \
    --out-dir lib \
    --compact true \
    --minified \
    --source-maps false \
    src
)
