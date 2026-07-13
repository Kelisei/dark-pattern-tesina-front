/**
 * Luminancia según W3C
 */
function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Contraste entre dos colores
 */
function getContrast(color1, color2) {
  const luminance1 = getLuminance(color1[0], color1[1], color1[2]);
  const luminance2 = getLuminance(color2[0], color2[1], color2[2]);
  return (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);
}

/**
 * Convierte "rgb(r,g,b)" a [r,g,b]
 */
function rgbToArray(rgbString) {
  const result = rgbString.match(/\d+/g);
  return result ? result.map(Number) : null;
}

/**
 * Comprueba si un elemento está oculto
 */
function isHidden(element) {
  let actual = element;
  while (actual && actual !== document.body) {
    if (
      (actual.classList && actual.classList.contains('hidden')) ||
      actual.getAttribute('hidden') === 'true' ||
      window.getComputedStyle(actual).display === 'none' ||
      window.getComputedStyle(actual).visibility === 'hidden'
    ) return true;
    actual = actual.parentNode;
  }
  return false;
}

/**
 * Comprueba si un elemento es clickeable y visible
 */
function isSpecial(element, especiales) {
  try {
    if (
      element.nodeName !== '#text' &&
      !isHidden(element) && (
        element.getAttribute('onclick') != null ||
        element.getAttribute('href') != null ||
        especiales.includes(element.nodeName.toLowerCase())
      )
    ) return true;
  } catch (e) {}
  return false;
}

/**
 * Devuelve los padres con 2 o más hijos especiales
 */
function getParentOfSpecialNodes(element, especiales) {
  let arrReturn = [];
  let specialChildCounter = 0;
  let special = false;

  if (element.hasChildNodes()) {
    element.childNodes.forEach((hijo) => {
      const rta = getParentOfSpecialNodes(hijo, especiales);
      if (rta.isSpecial) specialChildCounter++;
      arrReturn = arrReturn.concat(rta.arr);
    });
    if (specialChildCounter >= 2) arrReturn.push(element);
  }

  if (isSpecial(element, especiales) || specialChildCounter === 1) special = true;

  return { arr: arrReturn, isSpecial: special };
}

/**
 * Obtiene los primeros hijos especiales de un elemento
 */
function getSpecialNodes(element, especiales) {
  let arrReturn = [];
  if (element.hasChildNodes()) {
    element.childNodes.forEach((hijo) => {
      if (isSpecial(hijo, especiales)) arrReturn.push(hijo);
      else arrReturn = getSpecialNodes(hijo, especiales).concat(arrReturn);
    });
  }
  return arrReturn;
}

/**
 * Contraste acumulado de hoja a raíz
 */
function contrastarNiveles(raiz, hoja) {
  let actual = hoja;
  const contrastes = [];
  while (actual && actual !== raiz) {
    const styles = window.getComputedStyle(actual);
    const fg = rgbToArray(styles.color);
    const bg = rgbToArray(styles.backgroundColor);
    if (fg && bg) contrastes.push(getContrast(fg, bg));
    actual = actual.parentNode;
  }
  return contrastes.reduce((acc, num) => acc + num, 0);
}

/**
 * Calcula cuántos valores están por encima del promedio + porcentaje
 */
function cantidadDestacados(contrastes, porcentaje) {
  const promedio = contrastes.reduce((a, b) => a + b, 0) / contrastes.length;
  return contrastes.reduce((acc, actual) => {
    if (actual > promedio + promedio * porcentaje) return acc + 1;
    return acc;
  }, 0);
}

/**
 * Evalúa lenguaje persuasivo / frase "No deseo elegir mi asiento"
 */
function evaluarLenguaje(hijos) {
  const patronesPersuasivos = /(continuar|aceptar|obtener|mejor opción|recomendado|no deseo elegir mi asiento|comprar|sí|si|agregar)/i;
  const patronesEvasivos = /(rechazar|cancelar|no|mantener gratis)/i;
  let score = 0;

  hijos.forEach(hijo => {
    const texto = hijo.textContent.toLowerCase();
    if (patronesPersuasivos.test(texto)) score += 1;
    if (patronesEvasivos.test(texto)) score -= 1;
  });
  return score;
}

/**
 * Detector de Misdirection
 */
const Misdirection = {
  destacadosEncimaPromedio: 0.2,
  umbralCantidadDestacados: 0.5,
  clickeables: ['a', 'button'],
  tipo: DP_TYPES.MISDIRECTION,
  detectados: new Set(),
  check: function() {
    this.detectados.clear();
    // console.log("Analizando misdirection...");
    const specialParents = getParentOfSpecialNodes(document.body, this.clickeables).arr;

    specialParents.forEach(parent => {
      const hijos = getSpecialNodes(parent, this.clickeables);
      if (hijos.length < 2) return;

      const contrastes = hijos.map(h => contrastarNiveles(parent, h));
      const destacados = cantidadDestacados(contrastes, this.destacadosEncimaPromedio);
      const scoreTexto = evaluarLenguaje(hijos);

      if (destacados >= hijos.length * this.umbralCantidadDestacados && scoreTexto >= 0) {
        // resaltarElementoConTexto(parent, this.tipo);
        const path = XPATHINTERPRETER.getPath(parent, document.body)?.[0];
        if (path) {
          this.detectados.add(path);
        }
      }
    });
  },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
};
