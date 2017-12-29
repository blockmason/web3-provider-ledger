#!/usr/bin/env bash

SCRIPTS_DIR=$(cd "$(dirname "$0")"; pwd)
BASE_DIR=$(dirname "${SCRIPTS_DIR}")
NODE_MODULES_DIR=${BASE_DIR}/node_modules
SOURCE_DIR=${BASE_DIR}/src

ESLINT="${NODE_MODULES_DIR}/.bin/eslint"

"${ESLINT}" "${SOURCE_DIR}" $*
