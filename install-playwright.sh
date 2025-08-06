#!/bin/bash

echo "Installing Playwright for E2E testing..."
echo ""
echo "This script will help you install Playwright and its dependencies."
echo ""

# Check if running on Arch-based system
if command -v pacman &> /dev/null; then
    echo "Detected Arch-based system (CachyOS)"
    echo "Installing system dependencies..."
    echo ""
    echo "Please run the following command:"
    echo "sudo pacman -S gtk3 libx11 libxcomposite libxdamage libxfixes libxrandr libxcursor libxi libxtst libxss nss atk at-spi2-atk cups libdrm libxkbcommon at-spi2-core libwayland-client libwayland-cursor libwayland-egl mesa"
    echo ""
    echo "After installing system dependencies, run:"
    echo "npx playwright install"
else
    echo "For non-Arch systems, run:"
    echo "sudo npx playwright install-deps"
    echo "npx playwright install"
fi

echo ""
echo "Once complete, you can run E2E tests with:"
echo "npm run test:e2e:ui"