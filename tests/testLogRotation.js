/**
 * New node file
 */

var csLogger = require('../cs-logger');

function testRotation() {
	var cokeLogger = csLogger.getLogger('Coke');
	for(var i=0;i<10;i++) {
		cokeLogger.debug("this is debug line %d", i);
	}
}

console.log("Test start");
testRotation();