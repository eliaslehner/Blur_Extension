# Blur Extension

A lightweight Browser extension that allows you to automatically blur specific HTML elements on any website using CSS selectors. Perfect for hiding sensitive information, spoilers, or distracting content while browsing.

## Features

- **Custom Selectors**: Add any valid CSS selector (e.g., `.ad-banner`, `#sidebar`, `img.spoiler`) to blur elements matching that pattern.
- **Adjustable Intensity**: Use a real-time slider to control how strong the blur effect is (0px to 50px).
- **Instant Preview**: Changes to the blur intensity are applied instantly to the active tab without needing to reload.
- **Toggle & Manage**: easily toggle specific selectors on/off or delete them completely.
- **Fast & Efficient**: Uses CSS injection for high performance and zero lag, running before the page content paints.
- **Privacy Focused**: Runs entirely locally. No data is sent to the cloud.

## Installation

Since this extension is in development/local mode, you need to load it as an "Unpacked extension".

1.  Clone or download this repository to a folder on your computer.
2.  Open your browser (Chrome, Edge, Brave, etc.) and navigate to `chrome://extensions`.
3.  Enable **Developer mode** (toggle switch usually in the top-right corner).
4.  Click the **Load unpacked** button.
5.  Select the folder where you saved these files (the folder containing `manifest.json`).
6.  The extension should now appear in your toolbar.

## Usage

1.  **Open the Extension**: Click the Blur Extension icon in your browser toolbar.
2.  **Add a Selector**:
    *   Find the CSS selector of the element you want to hide (Right-click element > Inspect > Copy Selector or look for the class name).
    *   Type the selector (e.g., `.youtube-video-title`) into the input box and press **Add** or Enter.
    *   The element will immediately blur on the page.
3.  **Adjust Intensity**: Drag the slider to change the blur strength. The page updates in real-time.
4.  **Toggle/Remove**: Use the switch next to a selector to temporarily disable it, or click the "X" icon to remove it permanently.

## Structure

*   `manifest.json`: Extension configuration and permissions.
*   `popup.html`: The user interface for the popup window.
*   `popup.js`: Logic for saving settings and communicating with the page.
*   `content.js`: The script that injects the CSS styles into web pages.

## Permissions

*   `storage`: To save your list of selectors and blur settings.
*   `activeTab` / `scripting`: To communicate with the current tab for real-time updates.
*   `matches: <all_urls>`: To allow the extension to run on any website you visit.
