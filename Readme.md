# Bateria virtual proxima energia
This node receives "balance-neto-horario" formatted payload, and makes the numbers to give you info about proxima energia, virtual battery product, updated near real time. 


![Image](resources/general-flow.png?raw=true)

INPUTS:
 - PricesTables: This table contains the price to be applied to selled energy and buyed energy.
    - Format: Expected to arrays into this object:
        - PricesToSell: 
            - Example:
                {"2022-06-30T22:00:00Z/2022-06-30T23:00:00Z":        /// INTERVAL ON WHICH THIS PRICE CAN BE APPLIED USED JODAJS INTERVAL DATA TYPE TO GET THIS PARSED. MAIN KEY TO SEARCH INTO THE INDEX
                {
                    value: 147.89,                                  /// PRICE FOR MWH
                    datetime: "2022-07-01T00:00",                   /// DATETIME REQUIRED TO INDENTIFY THE START INSTANT OF THIS INTERVAL.
                    datetime_utc: "2022-06-30T22:00:00Z",
                    tz_time: "2022-06-30T22:00:00.000Z",
                    interval: {
                    _start: "2022-06-30T22:00:00Z",                 // START DATE TIME FOR THE INTERVAL JODAJS LOCALDATETIME
                    _end: "2022-06-30T23:00:00Z"                    // END DATE TIME FOR THE INTERVAL JODAJS LOCALDATETIME
                }
            }
        - PricesToBuy:
            - Example: 
                {"2022-06-30T23:00:00Z/2022-07-01T00:00:00Z": {     /// INTERVAL ON WHICH THIS PRICE CAN BE APPLIED USED JODAJS INTERVAL DATA TYPE TO GET THIS PARSED. MAIN KEY TO SEARCH INTO THE 
                    "dia": "01/07/2022",                            // DAY OF APPLIANCE, 
                    "hora": "01-02",                                // HOUR INTERVAL START-END
                    "PCB": "302,91",                                // PRICE TO BUY
                    "TEUPCB": "3,03",                               // TERMINO ENERGIA
                    "interval": {                                   // JODAJS INTERVAL IN WICH APPLIED
                        "_start": "2022-06-30T23:00:00Z",
                        "_end": "2022-07-01T00:00:00Z"
                    }
                }

       

OUTPUTS:
This node has two outputs:
 - Balance neto horario payload, with the applied price. This output is triggered everytime that a new battery slot is delivered. If your data come from the inverter each 5secs, the cadency will be 5secs. 

 - Battery balance payload, giving data of the energy and overall load in €. The configured timeout threshold in the balance-neto-horario setted, will be the cadency for this output.ç
 



Is an alpha preview.