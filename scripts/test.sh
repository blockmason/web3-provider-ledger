#!/usr/bin/env bash

SCRIPTS_DIR=$(cd "$(dirname "$0")"; pwd)
BASE_DIR=$(dirname "${SCRIPTS_DIR}")
SOURCE_DIR=${BASE_DIR}/src
NODE_MODULES_DIR=${BASE_DIR}/node_modules

MOCHA=${NODE_MODULES_DIR}/.bin/mocha
ESLINT=${NODE_MODULES_DIR}/.bin/eslint

lint_tests() {
  (
    cd "${SOURCE_DIR}"
    "${ESLINT}" spec.setup.js $(list_test_files)
  ) || exit 1
}

list_test_files() {
  (
    cd "${SOURCE_DIR}"
    find . -type f -name spec.js
  ) | xargs
}

run_mocha() {
  (
    cd "${SOURCE_DIR}"
    NODE_ENV=test \
    "${MOCHA}" \
      $* \
      --require @babel/register \
      --require @babel/polyfill \
      spec.setup.js \
      $(list_test_files)
  ) || exit 1
}

run_tests() {
  run_mocha $* || exit 1
}

lint_tests && run_tests $*
