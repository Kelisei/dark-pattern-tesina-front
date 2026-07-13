const DARK_PATTERNS = {
  MISDIRECTION: Misdirection,
  HIDDENCOST: HiddenCost,
  SHAMING: ConfirmShaming,
  URGENCY: FakeUrgency,
  SCARCITY: FakeScarcity,
  PRESELECTION: Preselection,
}

// Al cargar la página, ejecutar los patrones activos
document.addEventListener("DOMContentLoaded", () => {
  DARK_PATTERNS.PRESELECTION.init();
  // console.log('Disparando DPs');
  ejecutarDPsSeleccionados();
});

document.addEventListener('visibilitychange', async () => {
  if (!chrome.runtime || !chrome.runtime.id) return;
  if (document.visibilityState === 'visible') {
    for(const dpNombre of Object.keys(DARK_PATTERNS)){
      desresaltarElementoConTipo(dpNombre);
    }
    PintarAnalizados();
  }
});

// Recibir patrones activos desde el popup a través del service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tipo === "ACTUALIZAR_DP") {
    chrome.storage.sync.get(["dpActivos"], (result) => {
      const dpActivos = result.dpActivos || {};
      
      for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
        if (!boolActivo) {
          desresaltarElementoConTipo(dpNombre);
        }
      }
      PintarAnalizados();
    });

    sendResponse({ status: "ejecutando patrones activos" });
  } else if (message.tipo === "MODO_AVISO") {
    PintarAnalizados();
  }
});

function findLowestCommonAncestor(el1, el2) {
  if (!el1 || !el2) return null;
  const path1 = [];
  let temp = el1;
  while (temp) {
    path1.push(temp);
    temp = temp.parentElement;
  }
  temp = el2;
  while (temp) {
    if (path1.includes(temp)) {
      return temp;
    }
    temp = temp.parentElement;
  }
  return null;
}

function getDepthToAncestor(child, ancestor) {
  let depth = 0;
  let temp = child;
  while (temp && temp !== ancestor) {
    depth++;
    temp = temp.parentElement;
  }
  return depth;
}

function groupCloseElements(elements) {
  let list = elements.filter(el => el && el.parentElement);
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const el1 = list[i];
        const el2 = list[j];
        if (el1 === el2) continue;
        
        const lca = findLowestCommonAncestor(el1, el2);
        
        if (lca && !['BODY', 'HTML', 'MAIN', 'SECTION', 'UL', 'OL', 'FORM', 'DL'].includes(lca.tagName)) {
          const d1 = getDepthToAncestor(el1, lca);
          const d2 = getDepthToAncestor(el2, lca);
          
          if (d1 <= 2 && d2 <= 2) {
            // Reemplazar ambos con el LCA
            list = list.filter((_, idx) => idx !== i && idx !== j);
            list.push(lca);
            changed = true;
            break;
          }
        }
      }
      if (changed) break;
    }
  }
  return [...new Set(list)];
}function PintarAnalizados() {
  if (!chrome.runtime || !chrome.runtime.id) return;
  chrome.storage.sync.get(["dpActivos", "modoSeleccionado", "modoDev"], async (result) => {
    const dpActivos = result.dpActivos || {};
    const modoSeleccionado = result.modoSeleccionado || "TODO";
    const modoDev = !!result.modoDev;
    
    const elementosDetecciones = new Map();
    
    for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
      if (boolActivo && DARK_PATTERNS[dpNombre]) {
        const detectadosRaw = [...DARK_PATTERNS[dpNombre].detectados]
          .map(path => XPATHINTERPRETER.getElementByXPath(path, document.body))
          .filter(elem => elem !== null && elem !== undefined);
        const detectados = modoDev ? detectadosRaw : groupCloseElements(detectadosRaw);
        const tipo = DARK_PATTERNS[dpNombre].tipo;
        
        detectados.forEach(elem => {
          if (elem) {
            const path = XPATHINTERPRETER.getPath(elem, document.body)?.[0];
            if (path) {
              if (!elementosDetecciones.has(path)) {
                elementosDetecciones.set(path, { element: elem, tipos: new Set() });
              }
              elementosDetecciones.get(path).tipos.add(tipo);
            }
          }
        });
      }
    }
    
    // 2. Fusionar detecciones anidadas (hijos dentro de padres) en modo no-dev
    if (!modoDev) {
      const paths = Array.from(elementosDetecciones.keys());
      for (let i = 0; i < paths.length; i++) {
        for (let j = 0; j < paths.length; j++) {
          if (i === j) continue;
          const pathA = paths[i];
          const pathB = paths[j];
          
          if (!elementosDetecciones.has(pathA) || !elementosDetecciones.has(pathB)) {
            continue;
          }
          
          const objA = elementosDetecciones.get(pathA);
          const objB = elementosDetecciones.get(pathB);
          
          if (objB.element.contains(objA.element)) {
            objA.tipos.forEach(t => objB.tipos.add(t));
            elementosDetecciones.delete(pathA);
            break;
          }
        }
      }
    }
    
    // 3. Desresaltar elementos obsoletos
    const clasesSelector = Object.values(DP_TYPES).map(t => `.${t}`).join(',');
    const actualmenteResaltados = document.querySelectorAll(clasesSelector);
    actualmenteResaltados.forEach((elem) => {
      const path = XPATHINTERPRETER.getPath(elem, document.body)?.[0];
      if (!path || !elementosDetecciones.has(path)) {
        elem.style.outline = '';
        elem.style.outlineOffset = '';
        Object.values(DP_TYPES).forEach(t => elem.classList.remove(t));
        let globo = Array.from(elem.childNodes).find(child => child.classList && child.classList.contains('resaltado-dark-pattern'));
        if (globo) elem.removeChild(globo);
      } else {
        const obj = elementosDetecciones.get(path);
        obj.element = elem; // Actualizar con la referencia de nodo más fresca del DOM
        
        Object.values(DP_TYPES).forEach(t => {
          if (!obj.tipos.has(t) && elem.classList.contains(t)) {
            elem.classList.remove(t);
            let globo = Array.from(elem.childNodes).find(child => child.classList && child.classList.contains('resaltado-dark-pattern'));
            if (globo) {
              let p = globo.querySelector(`p[data-dp-type="${t}"]`);
              if (p) globo.removeChild(p);
              if (globo.querySelectorAll('p').length === 0) {
                elem.removeChild(globo);
              }
            }
          }
        });
      }
    });

let countDebounceTimers = {};
async function setCountForType(dpNombre, count) {
  return new Promise((resolve) => {
    chrome.storage.local.get([dpNombre], (result) => {
      if (result[dpNombre] !== count) {
        if (countDebounceTimers[dpNombre]) clearTimeout(countDebounceTimers[dpNombre]);
        countDebounceTimers[dpNombre] = setTimeout(() => {
          chrome.storage.local.set({ [dpNombre]: count }, () => {
            resolve();
          });
        }, 1200);
      } else {
        if (countDebounceTimers[dpNombre]) {
          clearTimeout(countDebounceTimers[dpNombre]);
          countDebounceTimers[dpNombre] = null;
        }
        resolve();
      }
    });
  });
}
    // 4. Pintar / actualizar elementos detectados
    for (const obj of elementosDetecciones.values()) {
      const elem = obj.element;
      const tipos = obj.tipos;
      
      if (modoSeleccionado === "TODO") {
        tipos.forEach(tipo => {
          resaltarElementoConTexto(elem, tipo);
        });
      } else if (modoSeleccionado === "MARCA") {
        tipos.forEach(tipo => {
          resaltarBorde(elem, tipo);
        });
        let globo = Array.from(elem.childNodes).find(child => child.classList && child.classList.contains('resaltado-dark-pattern'));
        if (globo) elem.removeChild(globo);
      } else {
        elem.style.outline = '';
        elem.style.outlineOffset = '';
        let globo = Array.from(elem.childNodes).find(child => child.classList && child.classList.contains('resaltado-dark-pattern'));
        if (globo) elem.removeChild(globo);
      }
    }

    // 5. Actualizar contadores
    for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
      if (boolActivo && DARK_PATTERNS[dpNombre]) {
        let count = 0;
        for (const obj of elementosDetecciones.values()) {
          if (obj.tipos.has(DARK_PATTERNS[dpNombre].tipo)) count++;
        }
        await setCountForType(dpNombre, count);
      } else if (DARK_PATTERNS[dpNombre]) {
        DARK_PATTERNS[dpNombre].clear();
      }
    }
  });
}



// Ejecutar solo los DP seleccionados por el usuario
// Ejecutar solo los DP seleccionados por el usuario si el backend está activo
function ejecutarDPsSeleccionados() {
  if (!chrome.runtime || !chrome.runtime.id) return;
  chrome.storage.local.get("backendOnline", (localResult) => {
    console.log("Extension>ejecutarDPsSeleccionados: backendOnline =", localResult.backendOnline);
    if (localResult.backendOnline === false) {
      // Si el backend está desconectado, desresaltamos todo y vaciamos sets
      for (const dpNombre of Object.keys(DARK_PATTERNS)) {
        desresaltarElementoConTipo(dpNombre);
        if (DARK_PATTERNS[dpNombre].detectados) {
          DARK_PATTERNS[dpNombre].detectados.clear();
        }
      }
      clearAllCounts();
      return;
    }

    chrome.storage.sync.get("dpActivos", async (result) => {
      const estadosDp = result.dpActivos || {};
      console.log("Extension>ejecutarDPsSeleccionados: dpActivos =", estadosDp);
      let activos = [];
      
      // Crear array de DPs a excluir
      for (const [dp, valor] of Object.entries(estadosDp)) {
        if (valor) {
          activos.push(dp);
        }
      }
      
      console.log("Extension>ejecutarDPsSeleccionados: activos =", activos);
      for (const tipoDP of Object.values(activos)) {
        try{
          console.log("Extension>ejecutarDPsSeleccionados: Ejecutando check para", tipoDP);
          DARK_PATTERNS[tipoDP].check();
        } catch (e) {
          console.log("Extension>ejecutarDPsSeleccionados error: ", e);
        }
      }
      
      // Pintar resultados
      PintarAnalizados();
    });
  });
}



// Observer solo ejecuta el callback 1 segundos después de la ultima mutación
// En páginas que cambian constantemente no sirve
let previousURL = '';
let timer;
const observer = new MutationObserver(function (mutation) {
  // Necesario para preselection
  let newElems = false;
  mutation.addedNodes?.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.matches && node.matches("input[type='checkbox'], input[type='radio'], select option")) {
        newElems = true;
      }
      if (node.querySelector && node.querySelector("input[type='checkbox'], input[type='radio'], select option")) {
        newElems = true;
      }
    }
  });
  if (newElems) DARK_PATTERNS.PRESELECTION.init();
  
  // Re-pintar inmediatamente para evitar parpadeos si se reemplazaron nodos
  PintarAnalizados();
  
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    if (!chrome.runtime || !chrome.runtime.id) return;
    ejecutarDPsSeleccionados();
  }, 500); // 1 segundos para menos ejecuciones
});

observer.observe(document, { childList: true, subtree: true });

// Escuchar cambios en el estado de conexión del backend
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (!chrome.runtime || !chrome.runtime.id) return;
  if (areaName === "local" && changes.backendOnline) {
    const isOnline = changes.backendOnline.newValue;
    if (isOnline === false) {
      // Limpiar todo si se cae la conexión
      for (const dpNombre of Object.keys(DARK_PATTERNS)) {
        desresaltarElementoConTipo(dpNombre);
        if (DARK_PATTERNS[dpNombre].detectados) {
          DARK_PATTERNS[dpNombre].detectados.clear();
        }
      }
      clearAllCounts();
    } else {
      // Si vuelve a estar conectado, reanalizar
      ejecutarDPsSeleccionados();
    }
  }
});




