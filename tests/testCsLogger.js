/*
* Some tests and example to use node-csio-logger
*/
var assert = require('assert');
var csLogger = require('../cs-logger');

function testLogging() {
  console.log("=============================");
  console.log("%s testLogging ", (new Date()).toLocaleTimeString());
  console.log("=============================");

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

function testIsMetaData() {
  console.log("=============================");
  console.log("%s testIsMetaData ", (new Date()).toLocaleTimeString());
  console.log("=============================");

  assert.equal(csLogger.isMetaData("a String"), false, "String is not MetaData");
  assert.equal(csLogger.isMetaData(234), false, "number is not MetaData");
  assert.equal(csLogger.isMetaData({'foo':'bar'}), true)
}

function testLoggingWithMetaData() {
  console.log("=============================");
  console.log("%s testLoggingWithMetaData ", (new Date()).toLocaleTimeString());
  console.log("=============================");

  var metaLogger = csLogger.getLogger('Meta');

  var metaData = {'NodeID': 'node-12', 'AppID': 456, 'Service': 'Core'};

  var data = { 'min': -1, 'max': 50};

  metaLogger.debug(metaData, "received data: %j", data)
}

testLogging();

testIsMetaData();

testLoggingWithMetaData();

// process will terminate in 5 seconds
setTimeout(function() {
    process.exit();
  }, 5000);

