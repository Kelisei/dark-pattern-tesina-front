/**
 * Este archivo tiene la finalidad de definir todas las estructuras y variables globales necesarias a ejecutarse
 * antes que cualquier script para evitar "not defined"
 */
const DP_TYPES = {
    SHAMING: 'SHAMING',
    URGENCY: 'URGENCY',
    MISDIRECTION: 'MISDIRECTION',
    HIDDENCOST: 'HIDDENCOST',
    PRESELECTION: 'PRESELECTION',
    SCARCITY: 'SCARCITY'
}

const DP_TEXT = {
  SHAMING: 'Posible forma de persuasión',
  URGENCY: 'Podría ser falso',
  MISDIRECTION: 'Posible acción oculta',
  HIDDENCOST: 'Posible precio oculto',
  PRESELECTION: 'Cuidado, opción preseleccionada',
  SCARCITY: 'Podria no ser cierto'
};

const DP_COLORS = {
  SHAMING: 'FF9500', // #FF9500
  URGENCY: 'FF0000', // #FF0000
  MISDIRECTION: '0400FF', // #0400FF
  HIDDENCOST: '1AFF00', // #1AFF00
  PRESELECTION: 'EE82EE', // #EE82EE
  SCARCITY: 'FFFF00' // #FFFF00
}

const DP_NAMES = {
  SHAMING: 'Confirm Shaming',
  URGENCY: 'Fake Urgency',
  SCARCITY: 'Fake Scarcity',
  HIDDENCOST: 'Hidden Costs',
  MISDIRECTION: 'Misdirection',
  PRESELECTION: 'Preselection'
};

/**
 * 
 * @param {Element} elemento 
 * @param {string} tipo - Usar DP_TYPES para no tener errores
 * @returns 
 */
function resaltarBorde(elemento, tipo) {
  if (elemento == undefined) return;
  
  elemento.classList.add(tipo);
  
  // Si tiene múltiples tipos de DP, usamos un color violeta de combinación, si no, el del tipo actual
  const tiposActivos = Object.values(DP_TYPES).filter(t => elemento.classList.contains(t));
  let color = DP_COLORS[tipo];
  if (tiposActivos.length > 1) {
    color = '8b5cf6'; // Violeta vibrante para multipatrones
  }
  
  elemento.style.outline = `3px dashed #${color}`;
  elemento.style.outlineOffset = '-3px';
}

// Función para obtener un selector único para un elemento
function getUniqueSelector(elemento) {
  if (elemento.id) return `#${elemento.id}`;
  let path = '';
  let el = elemento;
  while (el && el.nodeType === 1 && el !== document.body) {
    let index = 1;
    let sibling = el.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === el.tagName) index++;
      sibling = sibling.previousElementSibling;
    }
    path = `/${el.tagName.toLowerCase()}[${index}]` + path;
    el = el.parentElement;
  }
  return '/html/body' + path;
}

function resaltarElementoConTexto(elemento, tipo) {
  if (elemento == undefined) return;

  resaltarBorde(elemento, tipo);
  elemento.style.position = 'relative';

  // Buscar si ya existe el globo
  let globoTexto = Array.from(elemento.childNodes).find(child => child.classList && child.classList.contains('resaltado-dark-pattern'));
  
  if (!globoTexto) {
    globoTexto = document.createElement('span');
    globoTexto.classList.add('resaltado-dark-pattern');
    
    // Estilos iniciales del globo
    Object.assign(globoTexto.style, {
      position: 'absolute',
      left: '0',
      zIndex: '10000',
      padding: '10px',
      color: 'black',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
      fontSize: '13px',
      whiteSpace: 'normal',
      minWidth: '170px',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    });
  }

  // Si tiene múltiples tipos activos, usamos fondo violeta/morado, si no, el del tipo
  const tiposActivos = Object.values(DP_TYPES).filter(t => elemento.classList.contains(t));
  let colorBg = DP_COLORS[tipo];
  if (tiposActivos.length > 1) {
    colorBg = 'c084fc'; // Violeta pastel para el fondo del globo
  }
  globoTexto.style.backgroundColor = `#${colorBg}`;
  
  let containerNombre = globoTexto.querySelector('.resaltado-nombre');

  // Verificar si ya existe el párrafo para este tipo de DP
  let parrafoExistente = globoTexto.querySelector(`p[data-dp-type="${tipo}"]`);
  if (!parrafoExistente) {
    parrafoExistente = document.createElement('p');
    parrafoExistente.setAttribute('data-dp-type', tipo);
    parrafoExistente.style.margin = '0';
    parrafoExistente.style.lineHeight = '1.4';
    parrafoExistente.innerHTML = `<strong>${DP_NAMES[tipo]}:</strong> ${DP_TEXT[tipo]}`;
    
    // Si ya hay otros párrafos, podemos añadir una pequeña línea divisoria superior
    if (globoTexto.querySelectorAll('p').length > 0) {
      parrafoExistente.style.borderTop = '1px solid rgba(0, 0, 0, 0.15)';
      parrafoExistente.style.paddingTop = '6px';
      parrafoExistente.style.marginTop = '4px';
    }
    
    globoTexto.appendChild(parrafoExistente);
  }

  // Ajustar la posición vertical del globo basándose en el elemento
  const rect = elemento.getBoundingClientRect();
  globoTexto.style.top = `${rect.height}px`;

  // Asegurar que el globo esté agregado al elemento
  if (globoTexto.parentNode !== elemento) {
    elemento.appendChild(globoTexto);
  }
}

/**
 *
 * @param {string} tipo Patrón a desresaltar
 */
function desresaltarElementoConTipo(tipo) {
  const elementos = document.querySelectorAll(`.${tipo}`);
  
  elementos.forEach((elemento) => {
    elemento.classList.remove(tipo);
    
    // Verificar si quedan otros tipos de DP activos en el elemento
    const tiposActivosRestantes = Object.values(DP_TYPES).filter(t => elemento.classList.contains(t));
    
    if (tiposActivosRestantes.length > 0) {
      // Si todavía quedan otros patrones, actualizar el borde/outline con los colores restantes
      let color = DP_COLORS[tiposActivosRestantes[0]];
      if (tiposActivosRestantes.length > 1) {
        color = '8b5cf6';
      }
      elemento.style.outline = `3px dashed #${color}`;
      
      // Buscar el globo de texto y eliminar el párrafo de este tipo
      let globoTexto = Array.from(elemento.childNodes).find(child => child.classList && child.classList.contains('resaltado-dark-pattern'));
      if (globoTexto) {
        let parrafo = globoTexto.querySelector(`p[data-dp-type="${tipo}"]`);
        if (parrafo) {
          globoTexto.removeChild(parrafo);
        }
        
        // Si ya no quedan párrafos de texto (solo el botón de cerrar), eliminar el globo
        if (globoTexto.querySelectorAll('p').length === 0) {
          elemento.removeChild(globoTexto);
        } else {
          // Actualizar el color de fondo del globo con los restantes
          let colorBg = DP_COLORS[tiposActivosRestantes[0]];
          if (tiposActivosRestantes.length > 1) {
            colorBg = 'c084fc';
          }
          globoTexto.style.backgroundColor = `#${colorBg}`;
        }
      }
    } else {
      // Si no quedan tipos activos, quitar el outline y el globo completo
      elemento.style.outline = '';
      elemento.style.outlineOffset = '';
      
      let globoTexto = Array.from(elemento.childNodes).find(child => child.classList && child.classList.contains('resaltado-dark-pattern'));
      if (globoTexto && globoTexto.parentNode === elemento) {
        elemento.removeChild(globoTexto);
      }
    }
  });
}