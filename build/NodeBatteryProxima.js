"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBatteryProxima = void 0;
const src_1 = require("@virtualbat/entities/dist/src");
const BatteryBalance_1 = require("@virtualbat/entities/dist/src/BatteryBalance");
class NodeBatteryProxima extends src_1.NodeBattery {
    constructor(node, nodeConfig) {
        super(node, nodeConfig);
        this.battery.setBalance(new BatteryBalance_1.ProximanEnergiaBatteryBalance(0, 0, 0, 0, nodeConfig.wastePercent));
    }
    init() {
        throw new Error("Method not implemented.");
    }
    onClose() {
        throw new Error("Method not implemented.");
    }
    onInput(msg, send, done) {
        return super.onInput(msg, send, done);
    }
    validateConfig() {
        throw new Error("Method not implemented.");
    }
    afterSend(msg) { }
    processBalanceNetoHorario(bnetoH) {
        this.node.log(" PROCESANDO LECTURAS ");
        // let balanceNeto=fillPricesIndicators(node,battery,msg.payload);
        if (bnetoH !== null) {
            var msgBalanceNeto = { payload: {} };
            var msgBatteryBalance = { payload: {} };
            msgBalanceNeto.payload = bnetoH.get();
            /// PARA CONSOLIDAR
            if (bnetoH.isConsolidable()) {
                this.battery.addBalanceNetoHorario(bnetoH);
                msgBatteryBalance.payload = this.battery.getBalance().get();
                //  _writeToContext(this.node.context(),this.battery.getBalance().get());
                this.node.send([msgBalanceNeto, msgBatteryBalance]);
                this.afterSend([msgBalanceNeto, msgBatteryBalance]);
                //               node.log("Sending data to both nodes BALANCE-NETO Y BATTERY balance"+JSON.stringify(msgBalanceNeto+"\n "+JSON.stringify(msgBatteryBalance)));
            }
            else {
                //               node.log("Sending data to first node BALANCE-NETO:"+JSON.stringify(msgBalanceNeto));
                this.node.send([msgBalanceNeto, null]);
                let batStatus = this.battery.getBalance().get();
                this.node.status({ fill: "green", shape: "dot", text: "Prices cache loaded\n" + "|F:" + batStatus.energyFeeded + "\n|I:" + batStatus.energyImported + "\n|L:" + batStatus.batteryLoad });
            }
            this._writeToContext();
            // node.status({fill:"green",shape:"dot",text:"Last udpated "+balanceNeto.startAt});
        }
    }
    _writeToContext() {
        this.nodeContext.set("payLoadBatteryBalance", JSON.stringify(this.battery.getBalance().get()));
    }
    _readFromContext() {
        let payloadSer = JSON.parse(this.nodeContext.get("payLoadBatteryBalance"));
        let oval = new BatteryBalance_1.ProximanEnergiaBatteryBalance(payloadSer.imported, payloadSer.energyFeeded, payloadSer.energyLossed, payloadSer.batteryLoad, this.nodeConfig.wastePercent);
        this.battery.setBalance(oval);
        /*"{\"energyImported\":0,\"energyFeeded\":0,\"batteryLoad\":0,\"buyPrice\":null,\"sellPrice\":null,\"energyLossed\":0}"*/
    }
}
exports.NodeBatteryProxima = NodeBatteryProxima;
