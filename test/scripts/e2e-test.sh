#!/bin/bash

BASE_DIR=`dirname $0`

echo ""
echo "Starting Testacular Server (http://vojtajina.github.com/testacular)"
echo "base dir is $BASE_DIR"
echo "-------------------------------------------------------------------"

testacular start $BASE_DIR/../config/testacular-e2e.conf.js $*