const Interval=require('@js-joda/extra').Interval;
const LocalDateTime = require('@js-joda/core').LocalDateTime;
const ZoneId=require("@js-joda/core").ZoneId;
const Instant=require("@js-joda/core").Instant;
const ChronoUnit=require("@js-joda/core").ChronoUnit;
const DateTimeFormatter=require('@js-joda/core').DateTimeFormatter;



class PricesTables{
    constructor(){
        this.pricesToSell=new Map();
        this.pricesToBuy=new Map();
    }

    addPriceToBuy(pvpcItem){
        this.pricesToBuy.set(pvpcItem.interval,pvpcItem);
    }

    addPricetoSell(pmhItem){
        this.pricesToSell.set(pmhItem.interval,pmhItem);
    }

    get(){
        let msg={};
        msg.payload={pricesTables:{
            pricesToSell:this.pricesToSell.toObject(),
            pricesToBuy:this.pricesToBuy.toObject()
            }
        }
        return msg;
    }

    reset(){
        this.pricesToSell.clear();
        this.pricesToBuy.clear();
    }

    static fromObject(pricesTablesObject){
        let oVal=new PricesTables();

        Object.keys(pricesTablesObject.pricesToSell).forEach(element => {
            //let pmhItem=new PmhItem(pricesTablesObject.pricesToSell[element]);
            let pmhItem=pricesTablesObject.pricesToSell[element];
            oVal.addPricetoSell(pmhItem);
        });

        


        Object.keys(pricesTablesObject.pricesToBuy).forEach(element => {
            /*let pvpcItem=new PvpcItem(
                {
                    Dia:element.dia,
                    Hora:element.hora,
                    PCB:element.PCB,
                    TEUPCB:element.TEUPCB
                }
            );*/
            let pvpcItem=pricesTablesObject.pricesToBuy[element];

            oVal.addPriceToBuy(pvpcItem);
        });
        return oVal;
    }

    searchInBuy(date){
        let a=this.pricesToBuy.filter(function(element){

            return Interval.ofInstantInstant(
                Instant.parse(element.interval.start().toString())
                ,Instant.parse(element.interval.end().toString()))
                .contains(Instant.parse(date.atZone(ZoneId.systemDefault()).toInstant().toString()))
        });
            return a.toArray()[0];
    }

    searchInSell(date){
        let a=this.pricesToSell.filter(function(element){
         
            return Interval.ofInstantInstant(
                Instant.parse(element.interval.start().toString())
                ,Instant.parse(element.interval.end().toString()))
                .contains(Instant.parse(date.atZone(ZoneId.systemDefault()).toInstant().toString()))
        });
            return a.toArray()[0];
    }
};

class BatteryBalance{

    constructor(imported,feeded,losed,load){
        this.energyImported=imported;
        this.energyFeeded=feeded;
        this.energyLossed=losed;
        this.batteryLoad=load;  
    }

    addBalaceNeto(balanceNeto){
        if(balanceNeto.feeded<0){
            this.energyImported+=balanceNeto.feeded;
        }else{
            this.energyFeeded+=balanceNeto.feeded;
            this.energyLossed+=((5*this.energyFeeded)/100)*(pmhPrice/1000000);
        }
        this.batteryLoad+=balanceNeto.feededPrice;
    }

    setPrices(pvpcPrice,pmhPrice){
        this.pvpcPrice=pvpcPrice;
        this.pmhPrice=pmhPrice;
    }
    get(){
        return {
            energyImported:this.energyImported,
            energyFeeded:this.energyFeeded,
            energyLossed:this.energyLossed,
            batteryLoad:this.batteryLoad,
            pvpcPrice:this.pvpcPrice,
            pmhPrice:this.pmhPrice
        };
    }
};

class PmhItem{

    /*
     {
                "value": 214.09,
                "datetime": "2022-05-15T00:00:00.000+02:00",
                "datetime_utc": "2022-05-14T22:00:00Z",
                "tz_time": "2022-05-14T22:00:00.000Z",
                "geo_ids": [
                    3
                ]
            }
            */
    constructor(pmhItem){
        let parcheTime=pmhItem.datetime.split(".")[0]+"+"+pmhItem.datetime.split(".")[1].split("+")[1];
        this.value=pmhItem.value;
        //this.datetime=LocalDateTime.parse(pmhItem.datetime,DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'.'SZ"));
        this.datetime=LocalDateTime.parse(parcheTime,DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        this.datetime_utc=pmhItem.datetime_utc;
        this.tz_time=pmhItem.tz_time;
        this.interval=this.getInterval();
    }

    getInterval(){
        let endDateTime=this.datetime.plusHours(1);
        let startInstant=this.datetime.atZone(ZoneId.of("Europe/Madrid")).toInstant();
        let endInstant=endDateTime.atZone(ZoneId.of("Europe/Madrid")).toInstant();
        return new Interval(startInstant,endInstant);
    }

    getPrice(){
        return this.value;
    }
};

class PvpcItem{
    constructor(fromEsios){
        {
            this.dia= fromEsios.Dia;
            this.hora= fromEsios.Hora;
            this.PCB= fromEsios.PCB;
            this.TEUPCB= fromEsios.TEUPCB;
            ///this.timeInterval=Interval.of(Instant.)
            this.interval=this.getInterval();
        }
    }

    getInterval(){
        let startHour=this.hora.split("-")[0];
        let startDateTime=LocalDate.parse(this.dia,DateTimeFormatter.ofPattern("dd/MM/yyyy")).atTime4(startHour,0,0,0);
        let endDateTime=startDateTime.plusHours(1);
        let startInstant=startDateTime.atZone(ZoneId.of("Europe/Madrid")).toInstant();
        let endInstant=endDateTime.atZone(ZoneId.of("Europe/Madrid")).toInstant();
        return new Interval(startInstant,endInstant);
    }

    getPrice(){
        return  parseFloat(this.PCB.replace(/,/g, '.'));
    }

    getPeaje(){
        return this.TEUPCB;
    }

};

class VirtualBattery{
    pricesTablesCache=null;
   
       constructor(config){
           this.wastePercent=config.wastePercent;
       }
   
       setCache(pricesTablesObject){
           this.pricesTablesCache=PricesTables.fromObject(pricesTablesObject);
       }

       cacheIsReady(){
           return this.pricesTablesCache!=null;
       }
   
       searchPriceSell(date){
            return this.pricesTablesCache.searchInSell(date);

       }
   
       searchPriceBuy(date){
         return this.pricesTablesCache.searchInBuy(date);
       }
   
       searchPeaje(date){
   
       }
   
       /**
        * Tipo de tarifa 
        */
       getType(){
   
       }
   
       getBatteryBalance(){
   
       }
   
       setBatteryBalance(){
   
       }
}; 

module.exports.VirtualBattery=VirtualBattery;

module.exports.PriceTables=PricesTables;

module.exports.PvpcItem=PvpcItem;

module.exports.PmhItem=PmhItem;

module.exports.BatteryBalance=BatteryBalance;