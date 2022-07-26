const VirtualBattery=require("./virtual-battery").VirtualBattery;
const SortedArray = require("collections/sorted-array");
const BatteryBalance=require("./virtual-battery").BatteryBalance;

module.exports = function(RED) {


    function VirtualBatteryProximaEnergiaNode(config) {
        var looperTimeout=null;
        var battery=null;
        var node=null;
        var balanceNetoHorarioBuffer=new SortedArray();
        var batteryBalance;
        var nodeContext;
        var pendingArray=[];
        
        RED.nodes.createNode(this,config);
        node = this;
        nodeContext=this.context();
        battery=new VirtualBattery({wastePercent:config.wastePercent});
        batteryBalance=_readFromContext(nodeContext);
        if(batteryBalance===undefined){
            _writeToContext(nodeContext,batteryBalance);
        }
       
        this.on('close', function() {
         _writeToContext(nodeContext,batteryBalance);
        });

        this.on('input',function(msg,send,done){
           
            let delay=500;
            if("pricesTables" in msg.payload){
                node.log( " CARGANDO CACHE");
                battery.setCache(msg.payload.pricesTables);
                node.status({fill:"green",shape:"dot",text:"Prices cache loaded"});
            }else{
                if(!battery.cacheIsReady()){
                    node.status({fill:"red",shape:"dot",text:"Prices not loaded"});
                    /// STORE DATA THAT MUST BE CONSOLIDATED TO PROCESS LATER WHEN PRICES AVAILABLE
                    if(msg.payload.isConsolidable){
                        pendingArray.push(msg);
                    }
                    return;
                }else{
                    if(pendingArray.length>0){
                        pendingArray.forEach((item,index,array)=>{
                            processBalanceNetoHorario(node,nodeContext,battery,item,batteryBalance);
                        });
    
                        pendingArray=[];
                    }
                }

                processBalanceNetoHorario(node,nodeContext,battery,msg,batteryBalance);
            }

        });
     
    }

    function processBalanceNetoHorario(node,nodeContext,battery,msg,batteryBalance){
        node.log( " PROCESANDO LECTURAS ");
   


        let balanceNeto=fillPricesIndicators(node,battery,msg.payload);
      
        if(balanceNeto!==null){
            var msgBalanceNeto={};
            var msgBatteryBalance={};

            msgBalanceNeto.payload=balanceNeto;
            /// PARA CONSOLIDAR
            if(balanceNeto.isConsolidable){

                let sellPrice=battery.searchPriceSell(msg.payload.startAt).getPrice();
                let buyPrice=battery.searchPriceBuy(msg.payload.startAt).getPrice();
                batteryBalance.setPrices(sellPrice,buyPrice);
                batteryBalance.addBalaceNeto(balanceNeto);
                msgBatteryBalance.payload=batteryBalance.get();
                _writeToContext(nodeContext,batteryBalance);
                node.send([msgBalanceNeto,msgBatteryBalance]);
 //               node.log("Sending data to both nodes BALANCE-NETO Y BATTERY balance"+JSON.stringify(msgBalanceNeto+"\n "+JSON.stringify(msgBatteryBalance)));
            }else{
 //               node.log("Sending data to first node BALANCE-NETO:"+JSON.stringify(msgBalanceNeto));
                node.send([msgBalanceNeto,null]);
                node.status({fill:"green",shape:"dot",text:"Prices cache loaded"+"|"+msgBalanceNeto.payload.feededPrice});
            }

           // node.status({fill:"green",shape:"dot",text:"Last udpated "+balanceNeto.startAt});
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

    function fillPricesIndicators(node,battery,balanceNetoHorario){
        if(battery.searchPriceSell(balanceNetoHorario.startAt)===undefined || battery.searchPriceBuy(balanceNetoHorario.startAt)===null){
            node.status({fill:"red",shape:"dot",text:"There is no prices for date "+balanceNetoHorario.startAt.toString()});
            return null;
        }
        let sellPrice=battery.searchPriceSell(balanceNetoHorario.startAt).getPrice();
        let buyPrice=battery.searchPriceBuy(balanceNetoHorario.startAt).getPrice();
        node.log("Prices: Sell Vs Buy:"+(sellPrice)+" Vs "+(buyPrice)+"->"+((sellPrice/buyPrice)*100)+"%");
        if(balanceNetoHorario.feeded>0){
            balanceNetoHorario.feededPrice=balanceNetoHorario.feeded*(sellPrice/1000000);    
        }else{
            balanceNetoHorario.feededPrice=balanceNetoHorario.feeded*(buyPrice/1000000);    
        }
       // node.log("BalanceNetoHorario with prices is:"+JSON.stringify(balanceNetoHorario));
        return balanceNetoHorario;
    }

    function _writeToContext(nodeContext,batteryBalance){
        nodeContext.set("payLoadBatteryBalance",JSON.stringify(batteryBalance));
    }

    function _readFromContext(nodeContext){
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

    
    RED.nodes.registerType("virtual-battery-proxima-energia",VirtualBatteryProximaEnergiaNode);
}
