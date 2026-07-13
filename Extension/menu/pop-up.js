document.addEventListener('DOMContentLoaded', () => {
  const switches = document.querySelectorAll('input[type=checkbox]');

  const toggleBtn = document.getElementById('toggle-all-btn');

  function updateToggleAllButtonState() {
    if (!toggleBtn) return;
    const allChecked = Array.from(switches).every(sw => sw.checked);
    toggleBtn.textContent = allChecked ? "Desactivar todos" : "Activar todos";
  }

  // 1. Setear switches con lo que haya en sync
  chrome.storage.sync.get("dpActivos", (result) => {
    const activos = result.dpActivos || {};
    switches.forEach((checkbox) => {
      checkbox.checked = !!activos[checkbox.id];
    });
    updateToggleAllButtonState();
  });

  // 2. Manejar cambios de switches
  switches.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const nuevosEstados = {};
      switches.forEach((item) => {
        nuevosEstados[item.id] = item.checked;
      });
      chrome.storage.sync.set({ dpActivos: nuevosEstados });

      chrome.runtime.sendMessage({
        tipo: "DARK_PATTERNS_SELECTED",
      });
      updateToggleAllButtonState();
    });
  });

  // 2b. Manejar clic en botón Activar/Desactivar todos
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const allChecked = Array.from(switches).every(sw => sw.checked);
      const newState = !allChecked;

      const nuevosEstados = {};
      switches.forEach((checkbox) => {
        checkbox.checked = newState;
        nuevosEstados[checkbox.id] = newState;
      });

      chrome.storage.sync.set({ dpActivos: nuevosEstados }, () => {
        chrome.runtime.sendMessage({
          tipo: "DARK_PATTERNS_SELECTED",
        });
        updateToggleAllButtonState();
      });
    });
  }

  // 3. Pintar contadores iniciales desde storage.local
  async function paintCounts() {
    const cts = await chrome.storage.local.get({ 
      SHAMING: 0, 
      URGENCY: 0,
      SCARCITY: 0,
      HIDDENCOST: 0, 
      MISDIRECTION: 0, 
      PRESELECTION: 0 
    });
    
    let total = 0;

    for (const [k, c] of Object.entries(cts)){
      const el = document.getElementById(`ct_${k}`);
      if (el) {
        el.textContent = c;
        if (c === 0) {
          el.classList.add('zero');
        } else {
          el.classList.remove('zero');
        }
      }
      total += c;
    }

    const elTotal = document.getElementById("ct_total");
    if (elTotal) {
      elTotal.textContent = total;
      if (total === 0) {
        elTotal.classList.add('zero');
      } else {
        elTotal.classList.remove('zero');
      }
    }
  }

  paintCounts();

  // 4. Escuchar mensajes de actualización
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.action === "dpCountsUpdated") {
      const counts = msg.counts;
      let total = 0;
      for (const [k, c] of Object.entries(counts)) {
        const el = document.getElementById(`ct_${k}`);
        if (el) {
          el.textContent = c;
          if (c === 0) {
            el.classList.add('zero');
          } else {
            el.classList.remove('zero');
          }
        }
        total += c;
      }
      const elTotal = document.getElementById("ct_total");
      if (elTotal) {
        elTotal.textContent = total;
        if (total === 0) {
          elTotal.classList.add('zero');
        } else {
          elTotal.classList.remove('zero');
        }
      }
    }
  });

  // 5. Manejo del modo seleccionado para aviso
  chrome.storage.sync.get("modoSeleccionado", (result) => {
      const selectedMode = result.modoSeleccionado || "TODO";
      const radio = document.getElementById(selectedMode);
      if (radio) {
        radio.checked = true;
      }
  });

  // 6. Pintar los radio buttons del modo de aviso
  document.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        chrome.storage.sync.set({modoSeleccionado: radio.value})
        chrome.runtime.sendMessage({
          tipo: "MODO_AVISO",
        }, (response) => console.log("Rta del worker ", response))
      }
    });
  });

  // 6b. Manejo de Modo Desarrollador (Dev Mode)
  const devModeChk = document.getElementById('dev-mode-chk');
  if (devModeChk) {
    chrome.storage.sync.get("modoDev", (result) => {
      devModeChk.checked = !!result.modoDev;
    });

    devModeChk.addEventListener('change', () => {
      chrome.storage.sync.set({ modoDev: devModeChk.checked }, () => {
        chrome.runtime.sendMessage({
          tipo: "DARK_PATTERNS_SELECTED",
        });
      });
    });
  }

  // 7. Monitorear estado del backend y actualizar UI
  function updateStatusUI(online) {
    const badge = document.getElementById('status-badge');
    const text = badge.querySelector('.status-text');
    const container = document.querySelector('.app-container');

    if (online) {
      badge.className = 'status-badge online';
      text.textContent = 'Conectado';
      container.classList.remove('offline-mode');
      
      // Habilitar controles
      switches.forEach(sw => sw.removeAttribute('disabled'));
      document.querySelectorAll('input[type=radio]').forEach(r => r.removeAttribute('disabled'));
      if (toggleBtn) toggleBtn.removeAttribute('disabled');
      if (devModeChk) devModeChk.removeAttribute('disabled');
    } else {
      badge.className = 'status-badge offline';
      text.textContent = 'Desconectado';
      container.classList.add('offline-mode');
      
      // Deshabilitar controles
      switches.forEach(sw => sw.setAttribute('disabled', 'true'));
      document.querySelectorAll('input[type=radio]').forEach(r => r.setAttribute('disabled', 'true'));
      if (toggleBtn) toggleBtn.setAttribute('disabled', 'true');
      if (devModeChk) devModeChk.setAttribute('disabled', 'true');
    }
  }

  // Cargar estado inicial del backend
  chrome.storage.local.get("backendOnline", (result) => {
    updateStatusUI(!!result.backendOnline);
  });

  // Escuchar cambios de estado en storage
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.backendOnline) {
      updateStatusUI(!!changes.backendOnline.newValue);
    }
  });
});