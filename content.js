const STYLE_ID = "blur-extension-styles";

function updateBlur(selectors, intensity) {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }

  const activeSelectors = selectors
    .filter(item => item.active === true)
    .map(item => item.name);

  if (activeSelectors.length === 0) {
    style.textContent = "";
    return;
  }

  const cssRules = activeSelectors.join(", ") + ` { 
    filter: blur(${intensity}px) !important; 
    transition: filter 0.3s ease; 
    clip-path: inset(0) !important; 
  }`;
  style.textContent = cssRules;
}

// 1. Initial Load
chrome.storage.local.get(["selectors", "blurIntensity"], (result) => {
  const selectors = result.selectors || [];
  const intensity = result.blurIntensity !== undefined ? result.blurIntensity : 15;
  updateBlur(selectors, intensity);
});

// 2. Listen for Storage Changes (Saved from Popup)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    chrome.storage.local.get(["selectors", "blurIntensity"], (result) => {
      const selectors = result.selectors || [];
      const intensity = result.blurIntensity !== undefined ? result.blurIntensity : 15;
      updateBlur(selectors, intensity);
    });
  }
});

// 3. Listen for Real-time Preview Messages (Slider Drag)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "PREVIEW_INTENSITY") {
    chrome.storage.local.get(["selectors"], (result) => {
      const selectors = result.selectors || [];
      updateBlur(selectors, request.value);
    });
  }
});