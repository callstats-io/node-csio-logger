/**
 * New node file
 */

var cslogging = require('../cs-logger');

function testUsingConfig() {
  
  // let the csLogger use a config file. the default level is "info"
//  {"fileName":"./cs.log",
//    "maxSize":10000000,
//    "loggers":{
//      "default":{"level":"INFO"},
//      "coke":{"level":"DEBUG"},
//      "pepsi":{"level":"INFO"}
//      }
//  }
  
  cslogging.loadConfig('./testConfig.json');
  
  // logger 'coke' is defined in the logger config, so its level defined in the config will be used
  var cokeLogger = cslogging.getLogger('Coke');
  
  cokeLogger.debug("This line should be logged #1");

  cokeLogger.info("This line should be logged #2");
  
  // logger 'joke' is not defined in the logger config. So it will use default level, which is 'INFO'
  var jokeLogger = cslogging.getLogger('Joke');
  jokeLogger.debug("This line should not be logged");
  jokeLogger.info("This line should be logged #1");
  
  // now programmably change the logger level to debug 
  jokeLogger.setLevel("debug");
  jokeLogger.debug("This line should be logged #2");

  
  setTimeout(function() {
    var pepsiLogger = cslogging.getLogger("pepsi");
    pepsiLogger.debug("This line shall not be logged as the pepsi logger level is INFO");
    
    pepsiLogger.info("This line shall be logged #1");
    }, 5000);
}

testUsingConfig();



