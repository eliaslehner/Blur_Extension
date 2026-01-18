document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("selectorInput");
  const addBtn = document.getElementById("addBtn");
  const list = document.getElementById("list");
  const intensitySlider = document.getElementById("intensitySlider");
  const intensityValue = document.getElementById("intensityValue");

  // Load and display saved settings
  loadSettings();

  // Slider events
  intensitySlider.addEventListener("input", (e) => {
    const val = e.target.value;
    intensityValue.textContent = val + "px";
    // Send preview message to active tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "PREVIEW_INTENSITY", value: val });
      }
    });
  });
  
  intensitySlider.addEventListener("change", () => {
    // Save when user releases slider
    updateStorage(); 
  });

  // Add new selector on Click or Enter key
  addBtn.addEventListener("click", handleAdd);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleAdd();
  });

  function handleAdd() {
    const selectorText = input.value.trim();
    if (!selectorText) return;

    // Use storage.local instead of sync for better reliability during testing
    chrome.storage.local.get(["selectors"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error reading storage:", chrome.runtime.lastError);
        return;
      }
      
      let selectors = result.selectors || [];
      
      // Prevent duplicates
      if (!selectors.some(s => s.name === selectorText)) {
        // Add new selector as active by default
        selectors.push({ name: selectorText, active: true });
        updateStorage(selectors);
        input.value = "";
      }
    });
  }

  function loadSettings() {
    list.innerHTML = ""; // Clear current list
    chrome.storage.local.get(["selectors", "blurIntensity"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error reading storage:", chrome.runtime.lastError);
        list.innerHTML = "<li style='color:red;'>Error loading data.</li>";
        return;
      }

      // Load Slider
      const intensity = result.blurIntensity !== undefined ? result.blurIntensity : 15;
      intensitySlider.value = intensity;
      intensityValue.textContent = intensity + "px";

      // Load List
      const selectors = result.selectors || [];
      if(selectors.length === 0) {
        list.innerHTML = "<li style='justify-content:center; color:#999;'>No selectors added yet.</li>";
        return;
      }
      selectors.forEach((item, index) => renderItem(item, index, selectors));
    });
  }

  function renderItem(item, index, allSelectors) {
    const li = document.createElement("li");

    // Left side: Text
    const textSpan = document.createElement("span");
    textSpan.className = "selector-text";
    textSpan.textContent = item.name;
    // Visually grey out text if inactive
    if (!item.active) textSpan.style.color = "#ccc";

    // Right side: Controls (Toggle + Delete)
    const controlsDiv = document.createElement("div");
    controlsDiv.className = "controls";

    // 1. Toggle Switch
    const label = document.createElement("label");
    label.className = "switch";
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.active;
    checkbox.onchange = () => toggleSelector(index, allSelectors);

    const slider = document.createElement("span");
    slider.className = "slider";

    label.appendChild(checkbox);
    label.appendChild(slider);

    // 2. Delete Button
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    // Use an SVG icon instead of text to avoid encoding/font issues
    delBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    delBtn.title = "Delete permanently";
    delBtn.onclick = () => deleteSelector(index, allSelectors);

    controlsDiv.appendChild(label);
    controlsDiv.appendChild(delBtn);

    li.appendChild(textSpan);
    li.appendChild(controlsDiv);
    list.appendChild(li);
  }

  function toggleSelector(index, selectors) {
    // Flip the active state
    selectors[index].active = !selectors[index].active;
    updateStorage(selectors);
  }

  function deleteSelector(index, selectors) {
    // Remove item from array
    selectors.splice(index, 1);
    updateStorage(selectors);
  }

  // If selectors is passed, save it. 
  // If not, fetch current selectors from storage so we don't overwrite them with empty.
  // Always save current slider value.
  function updateStorage(currentSelectors = null) {
    const intensity = parseInt(intensitySlider.value, 10);
    
    if (currentSelectors) {
      save(currentSelectors, intensity);
    } else {
      chrome.storage.local.get(["selectors"], (result) => {
        save(result.selectors || [], intensity);
      });
    }
  }

  function save(selectors, intensity) {
    chrome.storage.local.set({ selectors, blurIntensity: intensity }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving storage:", chrome.runtime.lastError);
        return;
      }
      
      loadSettings(); // Re-render UI
      // No reload needed; content.js listens for storage changes
    });
  }
});