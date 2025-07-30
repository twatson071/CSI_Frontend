#!/bin/bash
source "$(dirname "$0")/dev-utils.sh"
print_info "Starting CSI API Backend..."
cd CSI_API && bun run dev