#!/bin/bash
MESSAGE=${1:-"작업이 완료되었습니다!"}
osascript -e "display notification \"$MESSAGE\" with title \"Antigravity 알림\" sound name \"Glass\""
