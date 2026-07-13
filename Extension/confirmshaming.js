// Objeto a usar en extension.js
const ConfirmShaming = {
  tipo: DP_TYPES.SHAMING,
  detectados: new Set(),
  check: function () {
    const invalidTags = ["INPUT"];
    let elements_shaming = segments(document.body);
    let filtered_elements_shaming = [];

    for (let i = 0; i < elements_shaming.length; i++) {
      const element = elements_shaming[i];
      let invalidElement = false;

      if (invalidTags.includes(element.nodeName)) invalidElement = true;
      for (const child of element.children) {
        if (invalidTags.includes(child.nodeName)) invalidElement = true;
      }
      if (invalidElement) continue;

      if (element.innerText === undefined) continue;
      let text = element.innerText.trim().replace(/\t/g, " ");
      if (text.length == 0) {
        continue;
      }
      let path = XPATHINTERPRETER.getPath(element, document.body)?.[0];
      filtered_elements_shaming.push({ text:text, path:path });
    }

    console.log("ConfirmShaming>check sending:", filtered_elements_shaming.length, "elements");

    chrome.runtime.sendMessage({ pattern: this.tipo, data: filtered_elements_shaming }, (response) => {
      const { error, data } = response;
      if (error) {
        if (error.code === "ERR_NETWORK") console.log("ConfirmShaming>check: El servidor no responde.", error);
        else console.log("ConfirmShaming>check: " ,error);
      }
      else {
        // console.log("ConfirmShaming>check: ", data);
        
        let newPaths = new Set();
        data.forEach((res) => {
          newPaths.add(res.path);
        });

        // Estabilidad: Solo borrar si desapareció en 2 chequeos seguidos
        this.missingCounts = this.missingCounts || new Map();
        
        for (let path of this.detectados) {
          if (!newPaths.has(path)) {
            let count = (this.missingCounts.get(path) || 0) + 1;
            this.missingCounts.set(path, count);
            if (count >= 2) {
              this.detectados.delete(path);
              this.missingCounts.delete(path);
            }
          } else {
            this.missingCounts.delete(path);
          }
        }

        for (let path of newPaths) {
          this.detectados.add(path);
          this.missingCounts.delete(path);
        }

        chrome.runtime.sendMessage({tipo: "MODO_AVISO"});
      }
    });
  },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}
