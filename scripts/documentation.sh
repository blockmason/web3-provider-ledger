#!/usr/bin/env bash

SCRIPTS_DIR=$(cd "$(dirname "$0")"; pwd)
BASE_DIR=$(dirname "${SCRIPTS_DIR}")
SOURCE_DIR=${BASE_DIR}/src

JSDOC=${BASE_DIR}/node_modules/.bin/jsdoc

rm -vfR "${BASE_DIR}/docs" || exit 1

(
  cd "${SOURCE_DIR}"
  "${JSDOC}" \
    --destination "${BASE_DIR}/docs" \
    --package "${BASE_DIR}/package.json" \
    --pedantic \
    --readme "${BASE_DIR}/README.md" \
    --recurse \
    .
) || exit 1
