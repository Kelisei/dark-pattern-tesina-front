// Objeto a usar en extension.js
const FakeScarcity = {
  tipo: DP_TYPES.SCARCITY,
  detectados: new Set(),
  check: function() {
    let elements_scarcity = segments(document.body);
    let filtered_elements_scarcity = [];
    console.log("Scarcity>check: elements segmented =", elements_scarcity.length);

    for (let i = 0; i < elements_scarcity.length; i++) {
      if (elements_scarcity[i].innerText === undefined) {
        continue;
      }
      let text = elements_scarcity[i].innerText.trim().replace(/\t/g, " ");
      if (text.length == 0) {
        continue;
      }
      let path = XPATHINTERPRETER.getPath(elements_scarcity[i], document.body)?.[0];
      filtered_elements_scarcity.push({ text, path });
    }

    console.log("Scarcity>check: sending filtered elements =", filtered_elements_scarcity.length, filtered_elements_scarcity);

    chrome.runtime.sendMessage({pattern: this.tipo, data: filtered_elements_scarcity}, (response) => {
      const { error, data } = response;
      if (error) {
        if (error.code === "ERR_NETWORK") console.log("Scarcity>check: El servidor no responde.");
        else console.log("Scarcity>check error: ", error);
      }
      else {
        console.log("Scarcity>check response: ", data);
        data.instances.forEach((instancia) => {
          if (instancia.has_scarcity) {
            console.log("Scarcity>check: detected scarcity for path:", instancia.path);
            this.detectados.add(XPATHINTERPRETER.getElementByXPath(instancia.path, document.body));
          }
        });
        chrome.runtime.sendMessage({tipo: "MODO_AVISO"});
      }
    });
  },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}
