module.exports = function(RED) {

    function ThresholdFlowRouterNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        // ===== Konfiguration =====
        node.property = config.property;
        node.propertyType = config.propertyType;

        node.upper = config.upper;
        node.upperType = config.upperType;

        node.lower = config.lower;
        node.lowerType = config.lowerType;

        node.hysteresis = Number(config.hysteresis) || 0;
        node.minDuration = Number(config.minDuration) || 0;

        node.softStart = config.softStart;
        node.debug = config.debug;
        node.alwaysPass = config.alwaysPass;

        // Farben (Hex für Dropdown)
        node.colorHigh = config.colorHigh || "#00AA00";
        node.colorMid  = config.colorMid  || "#FFCC00";
        node.colorLow  = config.colorLow  || "#FF0000";

        const context = node.context();
        node.state = context.get("state") || null;
        node.timer = null;
        node.pendingState = null;

        // ===== Helper =====
        function getTypedValue(type, value, msg) {
            try {
                if (type === "num") return Number(value);
                if (type === "msg") return RED.util.getMessageProperty(msg, value);
                if (type === "flow") return node.context().flow.get(value);
                if (type === "global") return node.context().global.get(value);
            } catch(e) { return undefined; }
        }

        function evaluateState(value, upper, lower) {
            if (node.state === "HIGH") {
                if (value < upper - node.hysteresis) return "MID";
                return "HIGH";
            }
            if (node.state === "LOW") {
                if (value > lower + node.hysteresis) return "MID";
                return "LOW";
            }
            if (value > upper) return "HIGH";
            if (value < lower) return "LOW";
            return "MID";
        }

        function mapColor(hex) {
            switch(hex) {
                case "#00AA00": return "green";
                case "#FFCC00": return "yellow";
                case "#FF0000": return "red";
                case "#0000FF": return "blue";
                case "#AAAAAA": return "grey";
                default: return "grey";
            }
        }

        function commitState(newState, msg, value, upper, lower) {
            node.state = newState;
            context.set("state", node.state);

            let outputs = [null, null, null];

            if (node.state === "HIGH") outputs[0] = msg;
            if (node.state === "MID")  outputs[1] = msg;
            if (node.state === "LOW")  outputs[2] = msg;

            node.status({
                fill: node.state === "HIGH" ? mapColor(node.colorHigh) :
                      node.state === "MID" ? mapColor(node.colorMid) :
                      mapColor(node.colorLow),
                shape: "dot",
                text: `${node.state} | ${value} (L:${lower} U:${upper})`
            });

            if (node.debug) {
                node.warn(`State: ${node.state}, Value: ${value}, L:${lower}, U:${upper}`);
            }

            node.send(outputs);
        }

        // ===== Input =====
        node.on("input", function(msg) {
            if (msg.reset === true) {
                node.state = null;
                context.set("state", null);
                node.status({fill:"grey", shape:"ring", text:"reset"});
                return;
            }

            let value = getTypedValue(node.propertyType, node.property, msg);
            let upper = getTypedValue(node.upperType, node.upper, msg);
            let lower = getTypedValue(node.lowerType, node.lower, msg);

            value = Number(value);
            upper = Number(upper);
            lower = Number(lower);

            if (isNaN(value) || isNaN(upper) || isNaN(lower)) {
                node.status({fill:"red", shape:"ring", text:"ungültiger Wert"});
                return;
            }

            if (upper <= lower) {
                node.status({fill:"red", shape:"ring", text:"upper ≤ lower"});
                return;
            }

            if (node.softStart && node.state === null) {
                commitState(evaluateState(value, upper, lower), msg, value, upper, lower);
                return;
            }

            const newState = evaluateState(value, upper, lower);

            if (newState !== node.state) {
                if (node.minDuration > 0) {
                    clearTimeout(node.timer);
                    node.pendingState = newState;
                    node.timer = setTimeout(() => {
                        commitState(node.pendingState, msg, value, upper, lower);
                        node.pendingState = null;
                    }, node.minDuration);
                } else {
                    commitState(newState, msg, value, upper, lower);
                }
            } else {
                if (node.alwaysPass) {
                    let outputs = [null, null, null];
                    if (node.state === "HIGH") outputs[0] = msg;
                    if (node.state === "MID")  outputs[1] = msg;
                    if (node.state === "LOW")  outputs[2] = msg;
                    node.send(outputs);
                }
            }
        });
    }

    RED.nodes.registerType("threshold-flow-router", ThresholdFlowRouterNode);

}
