#!/usr/bin/env bash

set -eu

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

echo "Connecting to websocket"
websocat -E -v ws://127.0.0.1:8787/client_logs/websocket &
sleep 1

echo "Fetching image /logo/0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9"
curl -s http://localhost:8787/logo/0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9 --output - >/dev/null

echo "Fetching image /logo/0xd49ff13661451313ca1553fd6954bd1d9b6e02b9"
curl -s http://localhost:8787/logo/0xd49ff13661451313ca1553fd6954bd1d9b6e02b9 --output - >/dev/null

sleep 10
