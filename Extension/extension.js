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
        
        if (lca && lca.tagName !== 'BODY' && lca.tagName !== 'HTML' && lca.tagName !== 'MAIN' && lca.tagName !== 'SECTION') {
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
    
    // 1. Recopilar todas las detecciones por elemento
    for (const [dpNombre, boolActivo] of Object.entries(dpActivos)) {
      if (boolActivo && DARK_PATTERNS[dpNombre]) {
        const detectadosRaw = [...DARK_PATTERNS[dpNombre].detectados];
        const detectados = modoDev ? detectadosRaw : groupCloseElements(detectadosRaw);
        const tipo = DARK_PATTERNS[dpNombre].tipo;
        
        detectados.forEach(elem => {
          if (elem) {
            if (!elementosDetecciones.has(elem)) {
              elementosDetecciones.set(elem, new Set());
            }
            elementosDetecciones.get(elem).add(tipo);
          }
        });
      }
    }
    
    // 2. Fusionar detecciones anidadas (hijos dentro de padres) en modo no-dev
    if (!modoDev) {
      const elementos = Array.from(elementosDetecciones.keys());
      for (let i = 0; i < elementos.length; i++) {
        for (let j = 0; j < elementos.length; j++) {
          if (i === j) continue;
          const elA = elementos[i];
          const elB = elementos[j];
          if (elB.contains(elA)) {
            const tiposA = elementosDetecciones.get(elA);
            if (tiposA) {
              tiposA.forEach(t => elementosDetecciones.get(elB).add(t));
            }
            elementosDetecciones.delete(elA);
            break;
          }
        }
      }
    }
    
    // 3. Desresaltar elementos obsoletos
    const clasesSelector = Object.values(DP_TYPES).map(t => `.${t}`).join(',');
    const actualmenteResaltados = document.querySelectorAll(clasesSelector);
    actualmenteResaltados.forEach((elem) => {
      if (!elementosDetecciones.has(elem)) {
        elem.style.outline = '';
        elem.style.outlineOffset = '';
        Object.values(DP_TYPES).forEach(t => elem.classList.remove(t));
        let globo = Array.from(elem.childNodes).find(child => child.classList && child.classList.contains('resaltado-dark-pattern'));
        if (globo) elem.removeChild(globo);
      } else {
        const tiposNuevos = elementosDetecciones.get(elem);
        Object.values(DP_TYPES).forEach(t => {
          if (!tiposNuevos.has(t) && elem.classList.contains(t)) {
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

    // 4. Pintar / actualizar elementos detectados
    for (const [elem, tipos] of elementosDetecciones.entries()) {
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
        for (const tipos of elementosDetecciones.values()) {
          if (tipos.has(DARK_PATTERNS[dpNombre].tipo)) count++;
        }
        await setCountForType(dpNombre, count);
      } else {
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




