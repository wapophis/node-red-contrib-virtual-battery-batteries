import { BalanceNetoHorario } from "@virtualbat/entities/dist/src/BalanceNetoHorario.js";
import {  NodeBattery } from "@virtualbat/entities/dist/src/NodeBattery.js";
import { PricesTables } from "@virtualbat/entities/dist/src/PriceTables";
import { VirtualBattery, VirtualBatteryConfig } from "@virtualbat/entities/dist/src/VirtualBattery.js";

import { BatteryBalanceProxima } from "./BatteryBalanceProxima";
import { VirtualBatteryConfigProxima } from "./VirtualBatProximaConfig";

export class NodeBatteryProxima extends NodeBattery<BatteryBalanceProxima>{
   
    constructor(node:any,nodeConfig:any){
      super(node,nodeConfig);
      this.setConfig(new VirtualBatteryConfigProxima(nodeConfig,new PricesTables()));
      this.battery.setBalance(new BatteryBalanceProxima(0,0,0,0,new VirtualBatteryConfigProxima(nodeConfig,new PricesTables())));
    }

    init(): VirtualBattery<BatteryBalanceProxima> {
        throw new Error("Method not implemented.");
    }
    onClose(): boolean {
        throw new Error("Method not implemented.");
    }
    onInput(msg:any,send:any,done:any): VirtualBattery<BatteryBalanceProxima> {
        return super.onInput(msg,send,done);
    }
    validateConfig(): boolean {
        throw new Error("Method not implemented.");
    }
    afterSend(msg:any){
        console.log("DATOS:"+JSON.stringify(msg));
    }

    processBalanceNetoHorario(bnetoH:BalanceNetoHorario): void {
        this.node.log( " PROCESANDO LECTURAS ");
       // let balanceNeto=fillPricesIndicators(node,battery,msg.payload);
      
        if(bnetoH!==null){
            var msgBalanceNeto={payload:{}};
            var msgBatteryBalance={payload:{}};

            msgBalanceNeto.payload=bnetoH.get();
            /// PARA CONSOLIDAR
            if(bnetoH.isConsolidable()){
                this.battery.addBalanceNetoHorario(bnetoH);
                msgBatteryBalance.payload=this.battery.getBalance().get();
              //  _writeToContext(this.node.context(),this.battery.getBalance().get());
                this.node.send([msgBalanceNeto,msgBatteryBalance]);
                this.afterSend([msgBalanceNeto,msgBatteryBalance])
 //               node.log("Sending data to both nodes BALANCE-NETO Y BATTERY balance"+JSON.stringify(msgBalanceNeto+"\n "+JSON.stringify(msgBatteryBalance)));
            }else{
 //               node.log("Sending data to first node BALANCE-NETO:"+JSON.stringify(msgBalanceNeto));
                this.node.send([msgBalanceNeto,null]);
                let batStatus=this.battery.getBalance().get();
                
                this.node.status({fill:"green",shape:"dot",text:"Prices cache loaded\n"+"|F:"+batStatus.energyFeeded+"\n|I:"+batStatus.energyImported+"\n|L:"+batStatus.batteryLoad});
            }

            this._writeToContext();

           // node.status({fill:"green",shape:"dot",text:"Last udpated "+balanceNeto.startAt});
        }

    }



    _writeToContext(){
        this.nodeContext.set("payLoadBatteryBalance",JSON.stringify(this.battery.getBalance().get()));
    }

    _readFromContext(){
        if(this.nodeContext.get("payLoadBatteryBalance")!==undefined){
        let payloadSer=JSON.parse(this.nodeContext.get("payLoadBatteryBalance"));
        let oval:BatteryBalanceProxima=BatteryBalanceProxima.of(payloadSer,this.nodeConfig);
        this.battery.setBalance(oval);
        }
        
    }


    

    
}
