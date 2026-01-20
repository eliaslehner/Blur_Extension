# Blur Extension

A lightweight and high-performance browser extension that allows you to automatically blur specific HTML elements on any website using CSS selectors. It is optimized for performance, ensuring that even heavy blocking does not slow down page interactivity.

## Features

- **Custom Selectors**: Add any valid CSS selector (e.g., `.ad-banner`, `#sidebar`, `img.spoiler`) to blur elements matching that pattern.
- **Smart Exclusions**: Define specific "safe zones" (child elements) within blurred areas that should remain visible. Perfect for situations like blurring a video player but keeping the control bar visible.
- **Performance Modes**: Choose between two rendering strategies based on your device capabilities:
    - **GPU Blur**: Uses hardware-accelerated CSS filters for a smooth visual blur.
    - **Placeholder (Fast)**: Replaces content with a lightweight solid color block. Ideal for older devices or heavy pages to eliminate rendering lag entirely.
- **Adjustable Intensity**: Use a real-time slider to control how strong the blur effect is.
- **Optimized Execution**: Runs non-blockingly (`document_idle`) and forces GPU layering to ensure the website remains responsive and interactive.
- **Instant Preview**: Changes to intensity and selectors are applied instantly.
- **Privacy Focused**: Runs entirely locally. No data is sent to the cloud.

## Installation

Since this extension is in local development, you need to load it as an "Unpacked extension".

1.  Clone or download this repository to a folder on your computer.
2.  Open your browser (Chrome, Edge, Brave, etc.) and navigate to `chrome://extensions`.
3.  Enable **Developer mode** (toggle switch usually in the top-right corner).
4.  Click the **Load unpacked** button.
5.  Select the folder where you saved these files (the folder containing `manifest.json`).
6.  The extension should now appear in your toolbar.

## Usage

1.  **Open the Extension**: Click the Blur Extension icon in your browser toolbar.
2.  **Add a Selector**:
    *   Find the CSS selector of the element you want to hide (Right-click element > Inspect > Copy Selector).
    *   Type the selector into the "Blur Manager" input and click **Add**.
3.  **Add an Exclusion (Optional)**:
    *   If you want a sub-element inside a blurred area to be visible (e.g., a button inside a blurred div), add its selector to the "Exclusions" list.
4.  **Select Performance Mode**:
    *   **GPU Blur**: Standard visual blur.
    *   **Placeholder**: Best for performance; replaces content with a grey box.
5.  **Adjust Intensity**: Drag the slider to change the blur strength (applies to GPU mode).

## Structure

*   `manifest.json`: Extension configuration. Updated to run scripts at `document_idle`.
*   `popup.html`: The user interface including the new Performance Mode toggle.
*   `popup.js`: Logic for managing storage and sending real-time updates.
*   `content.js`: The engine that injects styles. Handles the logic for complex exclusions (`:not(:has(...))`) and performance optimizations (`transform: translate3d`).

## Permissions

*   `storage`: To save your settings locally.
*   `activeTab` / `scripting`: To communicate with the current tab for real-time updates.
*   `matches: <all_urls>`: To inject the blocking styles on any website.

## Future
- **Individual Profile**: Lets the user choose on which websites a selector should be active