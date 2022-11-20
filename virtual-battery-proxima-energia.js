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

        this.on('input',(msg,send,done)=>{
            nodeBattery.onInput(msg,send,done);
            nodeBattery._writeToContext();
        });

     
    }    
    RED.nodes.registerType("virtual-battery-proxima-energia",VirtualBatteryProximaEnergiaNode);
}
