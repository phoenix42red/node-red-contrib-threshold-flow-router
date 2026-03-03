# node-red-contrib-threshold-flow-router

![Node-RED](https://img.shields.io/badge/Node--RED-nodes-blue)

## Beschreibung

`threshold-flow-router` ist ein Node-RED Node, der Nachrichten basierend auf einem **Schwellenwert** und optionaler **Hysterese** auf **HIGH, MID oder LOW Ausgänge** leitet.  
Der Node unterstützt **Soft-Start**, **Mindestverweildauer**, **immer durchreichen** und **konfigurierbare Statusfarben**.

---

## Eigenschaften

- **Wert** – Welche Nachricht oder Property überwacht wird (msg, flow, global).  
- **Obere/Untere Grenze** – Schwellwerte für HIGH/LOW.  
- **Hysterese** – Vermeidet Flackern, wenn Werte kurz über-/unter der Grenze springen.  
- **Mindestverweildauer** – Zeit in ms, die ein neuer Zustand bestehen muss, bevor er gesendet wird.  
- **Soft-Start** – Initialzustand basierend auf dem ersten eingehenden Wert.  
- **Immer durchreichen** – MID-Output auch senden, wenn kein Wert gewechselt hat.  
- **Farben HIGH/MID/LOW** – Statuspunkt-Farben, Dropdown: Grün, Gelb, Rot, Blau, Grau.  

---

## Installation

1. Node in dein Node-RED Verzeichnis kopieren:

```bash
cd ~/.node-red
npm install https://github.com/deinusername/node-red-contrib-threshold-flow-router.git