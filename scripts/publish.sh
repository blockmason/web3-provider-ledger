#!/usr/bin/env bash

COLOR_GREEN='\033[0;32m'
COLOR_NONE='\033[0m'

info() {
  ICON=$1
  shift
  echo -e "${ICON} ${COLOR_GREEN}info${COLOR_NONE} $*"
}

SCRIPTS_DIR=$(cd "$(dirname "$0")"; pwd)
BASE_DIR=$(dirname "${SCRIPTS_DIR}")

YARN=$(which yarn)

(
  set -e
  cd "${BASE_DIR}"

  info '🛠 ' 'Install dependencies…'
  "${YARN}" --silent install

  info '❄️ ' 'Freeze version…'
  "${YARN}" --silent version $*

  info '⚙️ ' 'Transpile source files…'
  NODE_ENV=production "${YARN}" --silent build

  info '🗑 ' 'Clean prior version…'
  rm -fR dist

  info '⚓️' 'Copy transpiled source files…'
  cp -fR lib dist

  info '⚓️' 'Copy package descriptors…'
  cp -fR package.json yarn.lock README.md dist/

  info '🚢' 'Publish package…'
  (cd dist; "${YARN}" --silent publish . --no-git-tag-version --new-version "$(awk '/"version": ".+"/ { print $2; }' < package.json | sed -E 's|^"(.+)".*$|\1|g')"
)
