import { DayOfWeek, ZoneId } from "@js-joda/core";
import { LocalDateTime } from "@js-joda/core";
import { Interval } from "@js-joda/extra";
import { BalanceNetoHorario } from "@virtualbat/entities/dist/src/BalanceNetoHorario.js";
import { BatteryBalanceCounter } from "@virtualbat/entities/dist/src/BatteryBalance.js";
import { VirtualBatteryConfigProxima } from "./VirtualBatProximaConfig.js";
import '@js-joda/timezone'
import { PricesTables } from "@virtualbat/entities/dist/src/PriceTables.js";


/**
 * Extensión para la bateria de proxima energia incluyendo peajes, costes y costes de gestion.
 */
export class BatteryBalanceProxima extends BatteryBalanceCounter{
    energyLossed: number;
    batteryConfig:VirtualBatteryConfigProxima;
    peajesPorPotenciaSum: any;
    cargosPorPotenciaSum: any;
    peajesPorConsumoSum: any;
    cargosPorConsumoSum: any;
    costesGestionSum: any;
    costeLossed: any;

    
    
    constructor(imported:number,feeded:number,losed:number,load:number,batteryConfig:VirtualBatteryConfigProxima){
        super(imported,feeded,load);
        this.energyLossed=losed;
        this.batteryConfig=batteryConfig;
    }


    addBalaceNeto(balanceNeto:BalanceNetoHorario){
        super.addBalaceNeto(balanceNeto);
        this.batteryLoad+=this.applyPeajesPorPotencia(balanceNeto);
        this.batteryLoad+=this.applyCargosPorPotencia(balanceNeto);
        this.batteryLoad+=this.applyPeajesPorConsumo(balanceNeto);
        this.batteryLoad+=this.applyCargosPorConsumo(balanceNeto);
        this.batteryLoad+=this.applyCostesGestionPorDia(balanceNeto);
        this.batteryLoad+=this.applyPorcentajePerdidas(balanceNeto);

        this.energyLossed+=((this.batteryConfig.wastePercent*this.energyFeeded)/100);
        
    }

    applyPeajesPorPotencia(balanceNeto:BalanceNetoHorario):number{
        let mult:number=this.batteryConfig.getPeajePotencia(this._peajePeriod(balanceNeto.startTime))/(365*24);
        this.peajesPorPotenciaSum+=mult*this.batteryConfig.getPotenciaContratada(this._peajePeriod(balanceNeto.startTime))*-1;
        return mult*this.batteryConfig.getPotenciaContratada(this._peajePeriod(balanceNeto.startTime))*-1;
    }
    applyCargosPorPotencia(balanceNeto:BalanceNetoHorario):number{
        let mult:number=this.batteryConfig.getCargosPotencia(this._peajePeriod(balanceNeto.startTime))/(365*24);
        this.cargosPorPotenciaSum+=mult*this.batteryConfig.getPotenciaContratada(this._peajePeriod(balanceNeto.startTime))*-1;
        return mult*this.batteryConfig.getPotenciaContratada(this._peajePeriod(balanceNeto.startTime))*-1;
        
    }

    applyPeajesPorConsumo(balanceNeto:BalanceNetoHorario):number{
        let mult:number=this.batteryConfig.getPeajesConsumo(this._consumoPeriod(balanceNeto.startTime));
        if(this.energyFeeded<0){
             this.peajesPorConsumoSum+=mult*(this.energyFeeded/1000);
             return mult*this.energyFeeded*-1;
        }
        return 0;
    }

    applyCargosPorConsumo(balanceNeto:BalanceNetoHorario):number{
        let mult:number=this.batteryConfig.getCargosConsumo(this._consumoPeriod(balanceNeto.startTime));
        if(this.energyFeeded<0){
             this.cargosPorConsumoSum+=mult*(this.energyFeeded/1000);
             return mult*this.energyFeeded*-1;
        }
        return 0;
    }

    applyCostesGestionPorDia(balanceNeto:BalanceNetoHorario):number{
        let lastDate:LocalDateTime=LocalDateTime.now().withHour(23).withMinute(0).withSecond(0).withNano(0);
        let endLastDate=lastDate.plusHours(1);
        let lastDayInterval=Interval.of(lastDate.atZone(ZoneId.of("Europe/Madrid")).toInstant(),endLastDate.atZone(ZoneId.of("Europe/Madrid")).toInstant());
        if(lastDayInterval.contains(LocalDateTime.parse(balanceNeto.startTime.toString()).atZone(ZoneId.of("Europe/Madrid")).toInstant())){
            this.costesGestionSum+=(this.batteryConfig.conmisionGestionBatVirtual+this.batteryConfig.conmisionGestionConsumo+this.batteryConfig.conmisionGestionExcedentes);
            return (this.batteryConfig.conmisionGestionBatVirtual+this.batteryConfig.conmisionGestionConsumo+this.batteryConfig.conmisionGestionExcedentes)*-1;
        }

        return 0;
    }

    applyPorcentajePerdidas(balanceNeto:BalanceNetoHorario):number{
        if(this.sellPrice!==null){
            let cost=((this.batteryConfig.wastePercent*this.energyFeeded)/100)*(this.sellPrice.getPrice()/1000000);
            this.costeLossed+=cost;
            return cost*-1;
        }
        return 0;
    }



    get():any{
        let oVal:Record<string,any>=super.get();
        oVal.energyLossed=this.energyLossed;
        oVal.peajesPorPotenciaSum=this.peajesPorPotenciaSum;
        oVal.cargosPorPotenciaSum=this.cargosPorPotenciaSum;
        oVal.peajesPorConsumoSum=this.peajesPorConsumoSum;
        oVal.cargosPorConsumoSum=this.cargosPorConsumoSum;
        oVal.costesGestionSum=this.costesGestionSum;
        oVal.costeLossed=this.costeLossed;
        return oVal;
    }

    static of(payloadSer:any,nodeConfig:any):BatteryBalanceProxima{
        let oVal:BatteryBalanceProxima=new BatteryBalanceProxima(payloadSer.imported,payloadSer.energyFeeded,payloadSer.energyLossed,payloadSer.batteryLoad,new VirtualBatteryConfigProxima(nodeConfig,new PricesTables()));
        oVal.peajesPorPotenciaSum=payloadSer.peajesPorPotenciaSum!==undefined?payloadSer.peajesPorPotenciaSum:0;
        oVal.cargosPorPotenciaSum=payloadSer.cargosPorPotenciaSum!==undefined?payloadSer.cargosPorPotenciaSum:0;
        oVal.peajesPorConsumoSum=payloadSer.peajesPorConsumoSum!==undefined?payloadSer.peajesPorConsumoSum:0;
        oVal.cargosPorConsumoSum=payloadSer.cargosPorConsumoSum!==undefined?payloadSer.cargosPorConsumoSum:0;
        oVal.costesGestionSum=payloadSer.costesGestionSum!==undefined?payloadSer.costesGestionSum:0;
        oVal.costeLossed=payloadSer.costeLossed!==undefined?payloadSer.costeLossed:0;
        return oVal;
    }

    _peajePeriod(date:LocalDateTime):string{
        if(date.dayOfWeek()===DayOfWeek.SATURDAY || date.dayOfWeek()===DayOfWeek.SUNDAY){
            return "P1";
        }
        if(date.hour()>=0 && date.hour()<8){
            return "P1";
        }
        return "P2";
    }

    _consumoPeriod(date:LocalDateTime):string{
        if(date.dayOfWeek()===DayOfWeek.SATURDAY || date.dayOfWeek()===DayOfWeek.SUNDAY){
            return "P1";
        }
        if(date.hour()>=0 && date.hour()<8){
            return "P1";
        }

        if(date.hour()>=8 && date.hour()<10){
            return "P2";
        }
        if(date.hour()>=10 && date.hour()<14){
            return "P3";
        }
        if(date.hour()>=14 && date.hour()<18){
            return "P2";
        }

        if(date.hour()>=18 && date.hour()<2){
            return "P3";
        }
      
       return "P2";
            
    }
    
};