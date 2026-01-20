const STYLE_ID = "blur-extension-styles";

// Inject styles immediately - runs at document_start before any content renders
(function injectEarlyStyles() {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  
  const parent = document.head || document.documentElement;
  if (parent) {
    parent.insertBefore(style, parent.firstChild);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      (document.head || document.documentElement).insertBefore(style, null);
    }, { once: true });
  }
})();

function buildCSSRules(selectors, exclusions, blurMode = "gpu", videoMode = "normal") {
  const activeSelectors = selectors
    .filter(item => item.active === true);

  const activeExclusions = exclusions
    .filter(item => item.active === true)
    .map(item => item.name);

  if (activeSelectors.length === 0) {
    return "";
  }

  const isPlaceholder = blurMode === 'placeholder';
  const exclusionString = activeExclusions.join(", ");
  const selectorNames = activeSelectors.map(item => item.name);
  const selectorString = selectorNames.join(", ");

  let cssRules = "";

  // ============ VIDEO HANDLING ============
  // Special handling for videos within targeted selectors for better performance
  // We directly style the <video> element to avoid interfering with player controls
  // Also handles video thumbnail previews (timeline hover)
  if (videoMode !== "normal") {
    const videoSelectors = selectorNames.map(s => `${s} video, ${s}:is(video)`).join(", ");
    // Thumbnail selectors for timeline hover previews
    const thumbSelectors = selectorNames.map(s => 
      `${s} .mgp_thumbnails .mgp_image, ${s} .mgp_thumbnails img, ${s} .mgp_videoPoster img`
    ).join(", ");
    
    if (videoMode === "hide") {
      // Completely hide videos - makes them invisible
      cssRules += `
        ${videoSelectors} {
          opacity: 0 !important;
          filter: none !important;
        }
        ${thumbSelectors} {
          opacity: 0 !important;
        }
      `;
    } else if (videoMode === "overlay") {
      // Fast overlay effect - use brightness(0) to black out the video
      // This is very cheap to compute and fully hides content
      cssRules += `
        ${videoSelectors} {
          filter: brightness(0) !important;
        }
        ${thumbSelectors} {
          filter: brightness(0) !important;
        }
      `;
    }
  }

  // ============ MAIN BLUR RULES ============
  // Exclude videos from main blur if videoMode is not normal
  const videoExclude = videoMode !== "normal" ? ":not(video):not(:has(video))" : "";

  if (activeExclusions.length === 0) {
    if (isPlaceholder) {
      // Placeholder mode: Use ::after overlay (works better than ::before for replaced elements)
      cssRules += `
        ${selectorString} {
          position: relative !important;
        }
        ${selectorNames.map(s => `${s}${videoExclude}::after`).join(", ")} {
          content: "" !important;
          position: absolute !important;
          inset: 0 !important;
          background: rgba(128, 128, 128, 0.98) !important;
          z-index: 2147483646 !important;
          pointer-events: none !important;
        }
      `;
    } else {
      // GPU blur mode - apply individual intensity per selector
      if (videoMode !== "normal") {
        // Apply blur only to non-video elements, with individual intensities
        activeSelectors.forEach(item => {
          const intensity = item.intensity !== undefined ? item.intensity : 15;
          cssRules += `
          ${item.name}${videoExclude} {
            filter: blur(${intensity}px) !important;
            clip-path: inset(0) !important;
            will-change: filter !important;
            contain: paint !important;
          }
        `;
        });
      } else {
        // Normal video mode - apply individual intensities
        activeSelectors.forEach(item => {
          const intensity = item.intensity !== undefined ? item.intensity : 15;
          cssRules += `
          ${item.name} {
            filter: blur(${intensity}px) !important;
            clip-path: inset(0) !important;
            will-change: filter !important;
            contain: paint !important;
          }
        `;
        });
      }
    }
  } else {
    // Complex case: exclusions exist
    const notHasExclusion = `:not(:has(:is(${exclusionString})))`;
    const hasExclusion = `:has(:is(${exclusionString}))`;
    
    const safeSelectors = selectorNames.map(s => `${s}${notHasExclusion}${videoExclude}`).join(", ");
    
    if (isPlaceholder) {
      cssRules += `
        ${safeSelectors} {
          position: relative !important;
        }
        ${selectorNames.map(s => `${s}${notHasExclusion}${videoExclude}::after`).join(", ")} {
          content: "" !important;
          position: absolute !important;
          inset: 0 !important;
          background: rgba(128, 128, 128, 0.98) !important;
          z-index: 2147483646 !important;
          pointer-events: none !important;
        }
      `;
    } else {
      // Apply individual intensity per selector
      activeSelectors.forEach(item => {
        const intensity = item.intensity !== undefined ? item.intensity : 15;
        cssRules += `
        ${item.name}${notHasExclusion}${videoExclude} {
          filter: blur(${intensity}px) !important;
          clip-path: inset(0) !important;
          will-change: filter !important;
          contain: paint !important;
        }
      `;
      });
    }

    // Selectors with excluded children - use backdrop-filter overlay with individual intensities
    activeSelectors.forEach(item => {
      const intensity = item.intensity !== undefined ? item.intensity : 15;
      const overlayFilter = isPlaceholder 
        ? `background: rgba(128, 128, 128, 0.98) !important;`
        : `backdrop-filter: blur(${intensity}px) !important;`;
      
      cssRules += `
      ${item.name}${hasExclusion} {
        position: relative !important;
        isolation: isolate !important;
      }
      ${item.name}${hasExclusion}::after {
        content: "" !important;
        position: absolute !important;
        inset: 0 !important;
        ${overlayFilter}
        z-index: 2147483640 !important;
        pointer-events: none !important;
        border-radius: inherit !important;
      }
      
      ${item.name}${hasExclusion} :is(${exclusionString}) {
        position: relative !important;
        z-index: 2147483647 !important;
      }
    `;
    });
  }

  return cssRules;
}

function updateBlur(selectors, exclusions, blurMode = "gpu", videoMode = "normal") {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    const parent = document.head || document.documentElement;
    if (parent) {
      parent.insertBefore(style, parent.firstChild);
    }
  }
  
  style.textContent = buildCSSRules(selectors, exclusions, blurMode, videoMode);
}

// 1. Load settings ASAP and apply - this runs at document_start
chrome.storage.local.get(["selectors", "exclusions", "blurMode", "videoMode"], (result) => {
  updateBlur(
    result.selectors || [],
    result.exclusions || [],
    result.blurMode || "gpu",
    result.videoMode || "normal"
  );
});

// 2. Listen for Storage Changes (Saved from Popup)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    chrome.storage.local.get(["selectors", "exclusions", "blurMode", "videoMode"], (result) => {
      updateBlur(
        result.selectors || [],
        result.exclusions || [],
        result.blurMode || "gpu",
        result.videoMode || "normal"
      );
    });
  }
});

// 3. (Message listener removed - intensity changes are now saved directly to storage)