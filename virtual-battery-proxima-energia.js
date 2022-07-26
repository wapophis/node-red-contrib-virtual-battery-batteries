const NodeBatteryProxima=require("./build/NodeBatteryProxima.js");

module.exports = function(RED) {


    function VirtualBatteryProximaEnergiaNode(config) {
        RED.nodes.createNode(this,config);
        var nodeBattery=new NodeBatteryProxima.NodeBatteryProxima(this,config);

        nodeBattery._readFromContext();
        
        nodeBattery.afterSend=function(msg){
            console.log({sended:msg});
        };
       
        this.on('close', function() {
         nodeBattery._writeToContext();
        });

        this.on('input',(msg,send,done)=>nodeBattery.onInput(msg,send,done));

     
    }





 /*   function _readFromContext(nodeContext){
        let recoveredBatBalance=nodeContext.get("payLoadBatteryBalance");
        let batteryBalance=null;
        if(recoveredBatBalance !== undefined){
            let batBal=JSON.parse(recoveredBatBalance);
            batteryBalance=new BatteryBalance(batBal.energyImported,batBal.energyFeeded,batBal.energyLossed,batBal.batteryLoad);
        }else{
            batteryBalance=new BatteryBalance(0,0,0,0);
        }
        return batteryBalance;
    }
    */

    
    RED.nodes.registerType("virtual-battery-proxima-energia",VirtualBatteryProximaEnergiaNode);
}
