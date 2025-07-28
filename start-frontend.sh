#!/bin/bash
source "$(dirname "$0")/dev-utils.sh"
print_info "Starting CSI UI Frontend..."
cd CSI_UI && npm run dev