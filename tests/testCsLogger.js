/**
 * New node file
 */

var csLogger = require('../cs-logger');

function testLogging() {
  
  var cokeLogger = csLogger.getLogger('Coke');
  
  cokeLogger.debug("this is debug line %d", 10);

  cokeLogger.info('test message %s, %s', 'first', 'second');
  
  cokeLogger.warn('test warn message %s, %s', 'first', 'second');
  
  cokeLogger.error("an error line");
  
  setTimeout(function() {
    cokeLogger.info("%s testing testLogging ", (new Date()).toLocaleTimeString());
    }, 5000);
  
  // create another logger
  var pepsiLogger = csLogger.getLogger('Pepsi');
  for (var i=1; i<=3; i++) {
    pepsiLogger.debug("Line #%d logged from %s", i, "PepsiLogger");

  }

}

testLogging();

//start to test the logging in 2 seconds
//setTimeout(testLogging, 2000);

