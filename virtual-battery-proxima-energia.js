const VirtualBattery=require("./virtual-battery").VirtualBattery;
const SortedArray = require("collections/sorted-array");
const BatteryBalance=require("./virtual-battery").BatteryBalance;

module.exports = function(RED) {
    var looperTimeout=null;
    var battery=null;
    var node=null;
    var balanceNetoHorarioBuffer=new SortedArray();
    var batteryBalance=new BatteryBalance(0,0,0,0);

    function VirtualBatteryProximaEnergiaNode(config) {
    
     
        
        RED.nodes.createNode(this,config);
        node = this;
        battery=new VirtualBattery({wastePercent:config.wastePercent});
       
        this.on('close', function() {
         
        });

        this.on('input',function(msg,send,done){
           

            if ("pricesTables" in msg.payload){
                node.log( " CARGANDO CACHE");
                battery.setCache(msg.payload.pricesTables);
                node.status({fill:"green",shape:"dot",text:"Prices cache loaded"});
            }else{

                processBalanceNetoHorario(msg);

            }

        });
     
    }

    function processBalanceNetoHorario(msg){
        node.log( " PROCESANDO LECTURAS "+JSON.stringify(msg.payload));
        if(!battery.cacheIsReady()){
            node.status({fill:"red",shape:"dot",text:"Prices not loaded"});
          //  balanceNetoHorarioBuffer.push({balanceNetoHorario:msg.payload});
            setTimeout(processBalanceNetoHorario,500,msg);   
            return;
        }

        let balanceNeto=fillPricesIndicators(msg.payload);
      
        var msgBalanceNeto={};
        var msgBatteryBalance={};

        msgBalanceNeto.payload=balanceNeto;
        /// PARA CONSOLIDAR
        if(balanceNeto.isConsolidable){
            batteryBalance.addBalaceNeto(balanceNeto);
            let sellPrice=battery.searchPriceSell(msg.payload.startAt).getPrice();
            let buyPrice=battery.searchPriceBuy(msg.payload.startAt).getPrice();
            msgBatteryBalance.payload=batteryBalance.get(buyPrice,sellPrice);
            node.send([msgBalanceNeto,msgBatteryBalance]);
            node.log("Sending data to both nodes BALANCE-NETO Y BATTERY balance"+JSON.stringify(msgBalanceNeto+"\n "+JSON.stringify(msgBatteryBalance)));
        }else{
            node.log("Sending data to first node BALANCE-NETO:"+JSON.stringify(msgBalanceNeto));
            node.send([msgBalanceNeto,null]);
        }


        /*
if(balanceNetoHorarioBuffer.length===0){
                node.log("Price to sell:"+;
            }else{
                balanceNetoHorarioBuffer.forEach(item=>{
                    node.log("Price to sell buffered:"+battery.searchPriceSell(item.startAt));
                });

                balanceNetoHorarioBuffer.clear();
            }
        */
    }

    function fillPricesIndicators(balanceNetoHorario){
        let sellPrice=battery.searchPriceSell(balanceNetoHorario.startAt).getPrice();
        let buyPrice=battery.searchPriceBuy(balanceNetoHorario.startAt).getPrice();
        node.log("Prices: Sell Vs Buy:"+(sellPrice)+" Vs "+(buyPrice)+"->"+((sellPrice/buyPrice)*100)+"%");
        if(balanceNetoHorario.feeded>0){
            balanceNetoHorario.feededPrice=balanceNetoHorario.feeded*(sellPrice/1000000);    
        }else{
            balanceNetoHorario.feededPrice=balanceNetoHorario.feeded*(buyPrice/1000000);    
        }
        node.log("BalanceNetoHorario with prices is:"+JSON.stringify(balanceNetoHorario));
        return balanceNetoHorario;
    }

    
    RED.nodes.registerType("virtual-battery-proxima-energia",VirtualBatteryProximaEnergiaNode);
}
