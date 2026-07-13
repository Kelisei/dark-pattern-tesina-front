//Esta deteccion es temporal para realizar la deteccion en la muestra
const FakeUrgency = {
  tipo: DP_TYPES.URGENCY,
  detectados: new Set(),
  check: function() {
    let elements_urgency = segments(document.body);
    let filtered_elements_urgency = [];

    for (let i = 0; i < elements_urgency.length; i++) {
        if (elements_urgency[i].innerText === undefined) {
            continue;
        }
        let text = elements_urgency[i].innerText.trim().replace(/\t/g, " ");
        if (text.length == 0) {
            continue;
        }
        let path = XPATHINTERPRETER.getPath(elements_urgency[i], document.body)?.[0];
        filtered_elements_urgency.push({ text, path });
    }

    console.log("FakeUrgency-Check", filtered_elements_urgency);

    chrome.runtime.sendMessage({ pattern: this.tipo, data: filtered_elements_urgency }, (response) => {
      const { error, data } = response;
      if (error) {
        if (error.code === "ERR_NETWORK") console.log("El servidor no responde.");
        else console.log(error);
      }
      else {
        console.log("FakeUrgency>check response: ", data);
        this.detectados.clear();
        data.urgency_instances.forEach((item) => {
          if (item.has_urgency) {
            console.log("FakeUrgency>check: detected urgency for path:", item.path, item.text);
            this.detectados.add(item.path);
          }
        });
        console.log(this.detectados);
        chrome.runtime.sendMessage({tipo: "MODO_AVISO"})
      }
    });
    },
  clear: function() {
    desresaltarElementoConTipo(this.tipo);
  }
}
