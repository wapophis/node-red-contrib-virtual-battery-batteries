"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatteryBalanceProxima = void 0;
const core_1 = require("@js-joda/core");
const core_2 = require("@js-joda/core");
const extra_1 = require("@js-joda/extra");
const BatteryBalance_js_1 = require("@virtualbat/entities/dist/src/BatteryBalance.js");
const VirtualBatProximaConfig_js_1 = require("./VirtualBatProximaConfig.js");
require("@js-joda/timezone");
const PriceTables_js_1 = require("@virtualbat/entities/dist/src/PriceTables.js");
/**
 * Extensión para la bateria de proxima energia incluyendo peajes, costes y costes de gestion.
 */
class BatteryBalanceProxima extends BatteryBalance_js_1.BatteryBalanceCounter {
    constructor(imported, feeded, losed, load, batteryConfig) {
        super(imported, feeded, load);
        this.energyLossed = losed;
        this.batteryConfig = batteryConfig;
    }
    addBalaceNeto(balanceNeto) {
        super.addBalaceNeto(balanceNeto);
        this.batteryLoad += this.applyPeajesPorPotencia(balanceNeto);
        this.batteryLoad += this.applyCargosPorPotencia(balanceNeto);
        this.batteryLoad += this.applyPeajesPorConsumo(balanceNeto);
        this.batteryLoad += this.applyCargosPorConsumo(balanceNeto);
        this.batteryLoad += this.applyCostesGestionPorDia(balanceNeto);
        this.batteryLoad += this.applyPorcentajePerdidas(balanceNeto);
        this.energyLossed += ((this.batteryConfig.wastePercent * this.energyFeeded) / 100);
    }
    applyPeajesPorPotencia(balanceNeto) {
        let mult = this.batteryConfig.getPeajePotencia(this._peajePeriod(balanceNeto.startTime)) / (365 * 24);
        this.peajesPorPotenciaSum += mult * this.batteryConfig.getPotenciaContratada(this._peajePeriod(balanceNeto.startTime)) * -1;
        return mult * this.batteryConfig.getPotenciaContratada(this._peajePeriod(balanceNeto.startTime)) * -1;
    }
    applyCargosPorPotencia(balanceNeto) {
        let mult = this.batteryConfig.getCargosPotencia(this._peajePeriod(balanceNeto.startTime)) / (365 * 24);
        this.cargosPorPotenciaSum += mult * this.batteryConfig.getPotenciaContratada(this._peajePeriod(balanceNeto.startTime)) * -1;
        return mult * this.batteryConfig.getPotenciaContratada(this._peajePeriod(balanceNeto.startTime)) * -1;
    }
    applyPeajesPorConsumo(balanceNeto) {
        let mult = this.batteryConfig.getPeajesConsumo(this._consumoPeriod(balanceNeto.startTime));
        if (this.energyFeeded < 0) {
            this.peajesPorConsumoSum += mult * (this.energyFeeded / 1000);
            return mult * this.energyFeeded * -1;
        }
        return 0;
    }
    applyCargosPorConsumo(balanceNeto) {
        let mult = this.batteryConfig.getCargosConsumo(this._consumoPeriod(balanceNeto.startTime));
        if (this.energyFeeded < 0) {
            this.cargosPorConsumoSum += mult * (this.energyFeeded / 1000);
            return mult * this.energyFeeded * -1;
        }
        return 0;
    }
    applyCostesGestionPorDia(balanceNeto) {
        let lastDate = core_2.LocalDateTime.now().withHour(23).withMinute(0).withSecond(0).withNano(0);
        let endLastDate = lastDate.plusHours(1);
        let lastDayInterval = extra_1.Interval.of(lastDate.atZone(core_1.ZoneId.of("Europe/Madrid")).toInstant(), endLastDate.atZone(core_1.ZoneId.of("Europe/Madrid")).toInstant());
        if (lastDayInterval.contains(core_2.LocalDateTime.parse(balanceNeto.startTime.toString()).atZone(core_1.ZoneId.of("Europe/Madrid")).toInstant())) {
            this.costesGestionSum += (this.batteryConfig.conmisionGestionBatVirtual + this.batteryConfig.conmisionGestionConsumo + this.batteryConfig.conmisionGestionExcedentes);
            return (this.batteryConfig.conmisionGestionBatVirtual + this.batteryConfig.conmisionGestionConsumo + this.batteryConfig.conmisionGestionExcedentes) * -1;
        }
        return 0;
    }
    applyPorcentajePerdidas(balanceNeto) {
        if (this.sellPrice !== null) {
            let cost = ((this.batteryConfig.wastePercent * this.energyFeeded) / 100) * (this.sellPrice.getPrice() / 1000000);
            this.costeLossed += cost;
            return cost * -1;
        }
        return 0;
    }
    get() {
        let oVal = super.get();
        oVal.energyLossed = this.energyLossed;
        oVal.peajesPorPotenciaSum = this.peajesPorPotenciaSum;
        oVal.cargosPorPotenciaSum = this.cargosPorPotenciaSum;
        oVal.peajesPorConsumoSum = this.peajesPorConsumoSum;
        oVal.cargosPorConsumoSum = this.cargosPorConsumoSum;
        oVal.costesGestionSum = this.costesGestionSum;
        oVal.costeLossed = this.costeLossed;
        return oVal;
    }
    static of(payloadSer, nodeConfig) {
        let oVal = new BatteryBalanceProxima(payloadSer.imported, payloadSer.energyFeeded, payloadSer.energyLossed, payloadSer.batteryLoad, new VirtualBatProximaConfig_js_1.VirtualBatteryConfigProxima(nodeConfig, new PriceTables_js_1.PricesTables()));
        oVal.peajesPorPotenciaSum = payloadSer.peajesPorPotenciaSum !== undefined ? payloadSer.peajesPorPotenciaSum : 0;
        oVal.cargosPorPotenciaSum = payloadSer.cargosPorPotenciaSum !== undefined ? payloadSer.cargosPorPotenciaSum : 0;
        oVal.peajesPorConsumoSum = payloadSer.peajesPorConsumoSum !== undefined ? payloadSer.peajesPorConsumoSum : 0;
        oVal.cargosPorConsumoSum = payloadSer.cargosPorConsumoSum !== undefined ? payloadSer.cargosPorConsumoSum : 0;
        oVal.costesGestionSum = payloadSer.costesGestionSum !== undefined ? payloadSer.costesGestionSum : 0;
        oVal.costeLossed = payloadSer.costeLossed !== undefined ? payloadSer.costeLossed : 0;
        return oVal;
    }
    _peajePeriod(date) {
        if (date.dayOfWeek() === core_1.DayOfWeek.SATURDAY || date.dayOfWeek() === core_1.DayOfWeek.SUNDAY) {
            return "P1";
        }
        if (date.hour() >= 0 && date.hour() < 8) {
            return "P1";
        }
        return "P2";
    }
    _consumoPeriod(date) {
        if (date.dayOfWeek() === core_1.DayOfWeek.SATURDAY || date.dayOfWeek() === core_1.DayOfWeek.SUNDAY) {
            return "P1";
        }
        if (date.hour() >= 0 && date.hour() < 8) {
            return "P1";
        }
        if (date.hour() >= 8 && date.hour() < 10) {
            return "P2";
        }
        if (date.hour() >= 10 && date.hour() < 14) {
            return "P3";
        }
        if (date.hour() >= 14 && date.hour() < 18) {
            return "P2";
        }
        if (date.hour() >= 18 && date.hour() < 2) {
            return "P3";
        }
        return "P2";
    }
}
exports.BatteryBalanceProxima = BatteryBalanceProxima;
;
