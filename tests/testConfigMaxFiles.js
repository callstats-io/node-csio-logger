/*jslint node: true */

/**
run this with nodeunit. Install nodeunit via 'npm install nodeunit -g'
*/
'use strict';

var cslogging = require('../cs-logger');
var glob = require('glob');
var log_file_pattern = 'testConfig*.log';
var fs = require('fs');


process.on('uncaughtException', function (err) {
  console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

function removeTestLogs() {
  // remove all testConfig*.log files
  var log_files = glob.sync(log_file_pattern);
  for(var i=0; i< log_files.length; i++) {
    console.log('removing existing log file %s', log_files[i]);
    fs.unlinkSync(log_files[i]);
  }
}


function createLogWritingFunction(logger, chr, numOfBytes) {
  return function(){logger.info((new Array(numOfBytes)).join(chr));};
}

/**
 * Test that the 'maxFiles' config works by writing logs
*/
function writeLogs() {
  cslogging.loadConfig('./testConfig.json');

  // the configFile set the maxSize to be 1K and maxFiles to be 10
  // So we need to write out a bit more then 10*1K of bytes of logs
  var testLogger = cslogging.getLogger('test');

  console.log('writing logs!');
  for(var i=0; i < 20; i++) {
    var chr = String.fromCharCode(97 + i);
    var logwriting = createLogWritingFunction(testLogger, chr, 1000);

    setTimeout(logwriting, i*100);
  }

}


module.exports = {
    setUp: function (callback) {
        removeTestLogs();
        callback();
    },
    tearDown: function (callback) {
        // clean up
        removeTestLogs();
        callback();
    },
    testMaxFiles: function (test) {
        // writing out logs will take around 2 seconds
        writeLogs();

        // checkout our expecations after 4 seconds
        setTimeout(function() {
            var log_files = glob.sync(log_file_pattern);
            // as we've set the maxFiles to be 10 there shouldn't be more than 10 files generated
            test.equals(log_files.length, 10);

            test.done();
          }, 4000);
    }
};

