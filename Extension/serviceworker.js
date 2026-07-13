// Service Worker, se ejecuta en segundo plano y no tiene acceso al DOM directamente.
const DP_TYPES = {
  SHAMING: 'SHAMING',
  URGENCY: 'URGENCY',
  MISDIRECTION: 'MISDIRECTION',
  HIDDENCOST: 'HIDDENCOST',
  SCARCITY: 'SCARCITY',
  PRESELECTION: 'PRESELECTION'
}

// Inicializo los DPs activos en true por defecto
chrome.runtime.onInstalled.addListener(() => {
  const valoresPorDefecto = {
    SHAMING: true,
    URGENCY: true,
    HIDDENCOST: true,
    PRESELECTION: true,
    MISDIRECTION: true,
    SCARCITY: true
  };
  const modoSeleccionado = "TODO";
  chrome.storage.sync.set({ dpActivos: valoresPorDefecto, modoSeleccionado: modoSeleccionado, modoDev: false }, () => {
    console.info("Valores por defecto de DP activos guardados.");
  });
});

// Listener para mensajes entrantes desde otras partes de la extensión
// Listener único para todos los mensajes entrantes de la extensión
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tipo === "CONSTANTES") {
    sendResponse();
    return false;
  }

  if (message.tipo === "DARK_PATTERNS_SELECTED") {
    sendMessageCurrentTab({ tipo: "ACTUALIZAR_DP" });
    sendResponse({ status: "Ok" });
    return false;
  }

  if (message.tipo === "MODO_AVISO") {
    sendMessageCurrentTab({ tipo: "MODO_AVISO" });
    sendResponse("Ok 2");
    return false;
  }

  // Peticiones al backend desde los scripts de detección (asíncronas)
  if (message.pattern === DP_TYPES.SHAMING) {
    sendRequest("http://localhost:5000/shaming", { Version: '1.0', tokens: message.data }, sendResponse);
    return true; // Mantiene el canal abierto para respuesta asíncrona
  } else if (message.pattern === DP_TYPES.URGENCY) {
    sendRequest("http://localhost:5000/urgency", { version: '1.0', texts: message.data }, sendResponse);
    return true;
  } else if (message.pattern === DP_TYPES.SCARCITY) {
    sendRequest("http://localhost:5000/scarcity", { version: '1.0', texts: message.data }, sendResponse);
    return true;
  }
});

// Envía un mensaje al contenido de la pestaña actual
function sendMessageCurrentTab(data) {
  getCurrentTab(function (tab) {
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, data, (response) => {
        // Silenciar error si el script de contenido no está listo en la pestaña (por ejemplo en chrome://extensions)
        if (chrome.runtime.lastError) {
          console.info("sendMessageCurrentTab: Pestaña no lista o no compatible con inyección.");
        }
      });
    }
  });
}


// Obtiene la pestaña actual activa y ejecuta el callback con la información de la pestaña
function getCurrentTab(callback) {
  try {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (chrome.runtime.lastError)
        console.error(chrome.runtime.lastError);
      // `tab` será una instancia de `tabs.Tab` o `undefined`.
      callback(tab);
    });
  } catch (err) {
    console.log("ServiceWorker>getCurrentTab: ",err);
  }
}

function sendRequest(url, data, callback) {
  // TODO: REVISAR SI LA CONVERSIÓN DESDE AXIOS A FETCH ES CORRECTA.
  console.log(data);
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    const responseData = await response.json();
    console.log(responseData);
    if (response.ok) {
      callback?.({ data: responseData });
    } else {
      callback?.({ error: responseData });
    }
  }).catch((error) => {
    error.code = "ERR_NETWORK";
    callback?.({ error });
  });
}




// Monitoreo de conexión al backend
let isBackendOnline = false;

async function checkBackendConnection() {
  try {
    const response = await fetch("http://localhost:5000/ping", { method: 'GET' });
    const currentStatus = response.ok;
    if (currentStatus !== isBackendOnline) {
      isBackendOnline = currentStatus;
      await chrome.storage.local.set({ backendOnline: isBackendOnline });
    }
  } catch (e) {
    if (isBackendOnline !== false) {
      isBackendOnline = false;
      await chrome.storage.local.set({ backendOnline: false });
    }
  }
}

// Ping cada 5 segundos
setInterval(checkBackendConnection, 5000);
checkBackendConnection();


