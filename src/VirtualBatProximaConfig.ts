import { PricesTables } from "@virtualbat/entities/dist/src/PriceTables.js";
import { VirtualBatteryConfig } from "@virtualbat/entities/dist/src/VirtualBattery.js";

export class VirtualBatteryConfigProxima extends VirtualBatteryConfig{

    wastePercent:number=0;
    cargosPotenciaP1:number=0;                  // €/Kw año
    cargosPotenciaP2:number=0;                 // €/Kw año
    cargosConsumoP1:number=0;                   // €/Kwh
    cargosConsumoP2:number=0;                   // €/Kwh
    cargosConsumoP3:number=0;                  // €/Kwh
    conmisionGestionConsumo:number=0;         // €/dia
    conmisionGestionExcedentes:number=0;       // €/dia
    conmisionGestionBatVirtual:number=0;       // €/dia
    peajesPotenciaP1:number=0;                  // €/Kw año               
    peajesPotenciaP2:number=0;                  // €/Kw año
    peajesConsumoP1:number=0;                   // €/Kwh
    peajesConsumoP2:number=0;                   // €/Kwh
    peajesConsumoP3:number=0;                   // €/Kwh
    potenciaContratadaP1: number=0;             // KWH
    potenciaContratadaP2: number=0;             // KWH


    constructor(nodeConfig:any,priceTable:PricesTables){
        super(priceTable);
        this.wastePercent=nodeConfig.wastePercent;
        this.cargosPotenciaP1=nodeConfig.cargosPotenciaP1;
        this.cargosPotenciaP2=nodeConfig.cargosPotenciaP2;
        this.cargosConsumoP1=nodeConfig.cargosConsumoP1;
        this.cargosConsumoP2=nodeConfig.cargosConsumoP2;
        this.cargosConsumoP3=nodeConfig.cargosConsumoP2;
        this.conmisionGestionBatVirtual=nodeConfig.conmisionGestionBatVirtual;
        this.conmisionGestionExcedentes=nodeConfig.conmisionGestionExcedentes;
        this.conmisionGestionConsumo=nodeConfig.conmisionGestionConsumo;
        this.peajesConsumoP1=nodeConfig.peajesConsumoP1;
        this.peajesConsumoP2=nodeConfig.peajesConsumoP2;
        this.peajesConsumoP3=nodeConfig.peajesConsumoP3;
        this.peajesPotenciaP1=nodeConfig.peajesPotenciaP1;
        this.peajesPotenciaP2=nodeConfig.peajesPotenciaP2;
        this.potenciaContratadaP1=parseFloat(nodeConfig.potenciaContratadaP1);
        this.potenciaContratadaP2=parseFloat(nodeConfig.potenciaContratadaP2);
    }

    getPeajePotencia(arg0: string): number {
        if(arg0==="P1"){
            return this.peajesPotenciaP1;
        }
        if(arg0==="P2"){
            return this.peajesPotenciaP2;
        }

        return 0;
    }

    getPotenciaContratada(arg0: string):number{
        if(arg0==="P1"){
            return this.potenciaContratadaP1;
        }
        if(arg0==="P2"){
            return this.potenciaContratadaP2;
        }
        return 0;
    }

    getCargosPotencia(arg0: string): number {
        if(arg0==="P1"){
            return this.cargosPotenciaP1;
        }
        if(arg0==="P2"){
            return this.cargosPotenciaP2;
        }

        return 0;
    }

    getCargosConsumo(arg0: string): number {
        if(arg0==="P1"){
            return this.cargosConsumoP1;
        }
        if(arg0==="P2"){
            return this.cargosConsumoP2;
        }

        if(arg0==="P3"){
            return this.cargosConsumoP3;
        }
        return 0;
    }

    getPeajesConsumo(arg0: string): number {
        if(arg0==="P1"){
            return this.peajesConsumoP1;
        }
        if(arg0==="P2"){
            return this.peajesConsumoP2;
        }

        if(arg0==="P3"){
            return this.peajesConsumoP3;
        }
        return 0;
    }

}