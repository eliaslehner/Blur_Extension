document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("selectorInput");
  const addBtn = document.getElementById("addBtn");
  const list = document.getElementById("list");
  
  const excInput = document.getElementById("exclusionInput");
  const addExcBtn = document.getElementById("addExcBtn");
  const excList = document.getElementById("excList");

  const modeRadios = document.getElementsByName("blurMode");
  const videoModeRadios = document.getElementsByName("videoMode");

  // Load and display saved settings
  loadSettings();

  // Mode Radio Change
  modeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      if(e.target.checked) {
        chrome.storage.local.set({ blurMode: e.target.value });
      }
    });
  });

  // Video Mode Radio Change
  videoModeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      if(e.target.checked) {
        chrome.storage.local.set({ videoMode: e.target.value });
      }
    });
  });

  // Add Selector
  addBtn.addEventListener("click", () => handleAdd(input, "selectors"));
  input.addEventListener("keypress", (e) => { if (e.key === "Enter") handleAdd(input, "selectors"); });

  // Add Exclusion
  addExcBtn.addEventListener("click", () => handleAdd(excInput, "exclusions"));
  excInput.addEventListener("keypress", (e) => { if (e.key === "Enter") handleAdd(excInput, "exclusions"); });

  function handleAdd(inputElement, storageKey) {
    const text = inputElement.value.trim();
    if (!text) return;

    chrome.storage.local.get([storageKey], (result) => {
      let items = result[storageKey] || [];
      // Prevent duplicates
      if (!items.some(s => s.name === text)) {
        // For selectors, add default intensity of 15; for exclusions, just active state
        if (storageKey === "selectors") {
          items.push({ name: text, active: true, intensity: 15 });
        } else {
          items.push({ name: text, active: true });
        }
        // Save just this key
        const data = {};
        data[storageKey] = items;
        
        chrome.storage.local.set(data, () => {
             loadSettings();
             // Reload/Notify is handled by storage listener in content.js
        });
        inputElement.value = "";
      }
    });
  }

  function loadSettings() {
    list.innerHTML = ""; 
    excList.innerHTML = "";

    chrome.storage.local.get(["selectors", "exclusions", "blurMode", "videoMode"], (result) => {
      if (chrome.runtime.lastError) return;

      // Blur Mode
      const mode = result.blurMode || "gpu";
      const radio = document.querySelector(`input[name="blurMode"][value="${mode}"]`);
      if (radio) radio.checked = true;

      // Video Mode
      const vMode = result.videoMode || "normal";
      const vRadio = document.querySelector(`input[name="videoMode"][value="${vMode}"]`);
      if (vRadio) vRadio.checked = true;

      // Selectors List
      const selectors = result.selectors || [];
      if(selectors.length === 0) list.innerHTML = "<li style='justify-content:center; color:#999;'>No selectors added.</li>";
      else selectors.forEach((item, index) => renderItem(item, index, selectors, list, "selectors"));

      // Exclusions List
      const exclusions = result.exclusions || [];
      if(exclusions.length === 0) excList.innerHTML = "<li style='justify-content:center; color:#999;'>No exclusions added.</li>";
      else exclusions.forEach((item, index) => renderItem(item, index, exclusions, excList, "exclusions"));
    });
  }

  function renderItem(item, index, array, parentList, storageKey) {
    const li = document.createElement("li");

    // For selectors, use a different layout with intensity slider
    if (storageKey === "selectors") {
      li.style.flexDirection = "column";
      li.style.alignItems = "stretch";
      
      // Top row: selector name and controls
      const topRow = document.createElement("div");
      topRow.className = "selector-row";
      
      const textSpan = document.createElement("span");
      textSpan.className = "selector-text";
      textSpan.textContent = item.name;
      if (!item.active) textSpan.style.color = "#ccc";

      const controlsDiv = document.createElement("div");
      controlsDiv.className = "controls";

      // Toggle
      const label = document.createElement("label");
      label.className = "switch";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.active;
      checkbox.onchange = () => {
        array[index].active = !array[index].active;
        saveArray(storageKey, array);
      };
      const slider = document.createElement("span");
      slider.className = "slider";
      label.appendChild(checkbox);
      label.appendChild(slider);

      // Delete
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      delBtn.onclick = () => {
        array.splice(index, 1);
        saveArray(storageKey, array);
      };

      controlsDiv.appendChild(label);
      controlsDiv.appendChild(delBtn);
      topRow.appendChild(textSpan);
      topRow.appendChild(controlsDiv);
      
      // Bottom row: intensity slider
      const intensityRow = document.createElement("div");
      intensityRow.className = "intensity-row";
      intensityRow.style.opacity = item.active ? "1" : "0.5";
      
      const intensitySlider = document.createElement("input");
      intensitySlider.type = "range";
      intensitySlider.min = "0";
      intensitySlider.max = "100";
      intensitySlider.value = item.intensity !== undefined ? item.intensity : 15;
      intensitySlider.style.accentColor = "#007bff";
      
      const intensityLabel = document.createElement("span");
      intensityLabel.className = "intensity-label";
      intensityLabel.textContent = intensitySlider.value + "px";
      
      intensitySlider.oninput = (e) => {
        intensityLabel.textContent = e.target.value + "px";
        // Live preview - update storage immediately for real-time effect
        const newIntensity = parseInt(e.target.value, 10);
        chrome.storage.local.get(["selectors"], (result) => {
          const selectors = result.selectors || [];
          if (selectors[index]) {
            selectors[index].intensity = newIntensity;
            chrome.storage.local.set({ selectors: selectors });
          }
        });
      };
      
      // Note: intensity is saved in oninput for real-time updates
      
      intensityRow.appendChild(intensitySlider);
      intensityRow.appendChild(intensityLabel);
      
      li.appendChild(topRow);
      li.appendChild(intensityRow);
    } else {
      // Exclusions - keep original layout
      const textSpan = document.createElement("span");
      textSpan.className = "selector-text";
      textSpan.textContent = item.name;
      if (!item.active) textSpan.style.color = "#ccc";

      const controlsDiv = document.createElement("div");
      controlsDiv.className = "controls";

      // Toggle
      const label = document.createElement("label");
      label.className = "switch";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.active;
      checkbox.onchange = () => {
        array[index].active = !array[index].active;
        saveArray(storageKey, array);
      };
      const slider = document.createElement("span");
      slider.className = "slider";
      label.appendChild(checkbox);
      label.appendChild(slider);

      // Delete
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      delBtn.onclick = () => {
        array.splice(index, 1);
        saveArray(storageKey, array);
      };

      controlsDiv.appendChild(label);
      controlsDiv.appendChild(delBtn);
      li.appendChild(textSpan);
      li.appendChild(controlsDiv);
    }
    
    parentList.appendChild(li);
  }

  function saveArray(key, array) {
    const data = {};
    data[key] = array;
    chrome.storage.local.set(data, () => loadSettings());
  }
});