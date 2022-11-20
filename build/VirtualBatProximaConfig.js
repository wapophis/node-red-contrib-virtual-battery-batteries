"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualBatteryConfigProxima = void 0;
const VirtualBattery_js_1 = require("@virtualbat/entities/dist/src/VirtualBattery.js");
class VirtualBatteryConfigProxima extends VirtualBattery_js_1.VirtualBatteryConfig {
    constructor(nodeConfig, priceTable) {
        super(priceTable);
        this.wastePercent = 0;
        this.cargosPotenciaP1 = 0; // €/Kw año
        this.cargosPotenciaP2 = 0; // €/Kw año
        this.cargosConsumoP1 = 0; // €/Kwh
        this.cargosConsumoP2 = 0; // €/Kwh
        this.cargosConsumoP3 = 0; // €/Kwh
        this.conmisionGestionConsumo = 0; // €/dia
        this.conmisionGestionExcedentes = 0; // €/dia
        this.conmisionGestionBatVirtual = 0; // €/dia
        this.peajesPotenciaP1 = 0; // €/Kw año               
        this.peajesPotenciaP2 = 0; // €/Kw año
        this.peajesConsumoP1 = 0; // €/Kwh
        this.peajesConsumoP2 = 0; // €/Kwh
        this.peajesConsumoP3 = 0; // €/Kwh
        this.potenciaContratadaP1 = 0; // KWH
        this.potenciaContratadaP2 = 0; // KWH
        this.wastePercent = nodeConfig.wastePercent;
        this.cargosPotenciaP1 = nodeConfig.cargosPotenciaP1;
        this.cargosPotenciaP2 = nodeConfig.cargosPotenciaP2;
        this.cargosConsumoP1 = nodeConfig.cargosConsumoP1;
        this.cargosConsumoP2 = nodeConfig.cargosConsumoP2;
        this.cargosConsumoP3 = nodeConfig.cargosConsumoP2;
        this.conmisionGestionBatVirtual = nodeConfig.conmisionGestionBatVirtual;
        this.conmisionGestionExcedentes = nodeConfig.conmisionGestionExcedentes;
        this.conmisionGestionConsumo = nodeConfig.conmisionGestionConsumo;
        this.peajesConsumoP1 = nodeConfig.peajesConsumoP1;
        this.peajesConsumoP2 = nodeConfig.peajesConsumoP2;
        this.peajesConsumoP3 = nodeConfig.peajesConsumoP3;
        this.peajesPotenciaP1 = nodeConfig.peajesPotenciaP1;
        this.peajesPotenciaP2 = nodeConfig.peajesPotenciaP2;
        this.potenciaContratadaP1 = parseFloat(nodeConfig.potenciaContratadaP1);
        this.potenciaContratadaP2 = parseFloat(nodeConfig.potenciaContratadaP2);
    }
    getPeajePotencia(arg0) {
        if (arg0 === "P1") {
            return this.peajesPotenciaP1;
        }
        if (arg0 === "P2") {
            return this.peajesPotenciaP2;
        }
        return 0;
    }
    getPotenciaContratada(arg0) {
        if (arg0 === "P1") {
            return this.potenciaContratadaP1;
        }
        if (arg0 === "P2") {
            return this.potenciaContratadaP2;
        }
        return 0;
    }
    getCargosPotencia(arg0) {
        if (arg0 === "P1") {
            return this.cargosPotenciaP1;
        }
        if (arg0 === "P2") {
            return this.cargosPotenciaP2;
        }
        return 0;
    }
    getCargosConsumo(arg0) {
        if (arg0 === "P1") {
            return this.cargosConsumoP1;
        }
        if (arg0 === "P2") {
            return this.cargosConsumoP2;
        }
        if (arg0 === "P3") {
            return this.cargosConsumoP3;
        }
        return 0;
    }
    getPeajesConsumo(arg0) {
        if (arg0 === "P1") {
            return this.peajesConsumoP1;
        }
        if (arg0 === "P2") {
            return this.peajesConsumoP2;
        }
        if (arg0 === "P3") {
            return this.peajesConsumoP3;
        }
        return 0;
    }
}
exports.VirtualBatteryConfigProxima = VirtualBatteryConfigProxima;
