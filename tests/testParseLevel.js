/**
 * New node file
 */

var assert = require("assert");

var csLogger = require('../cs-logger');

function testParseLevel() {
  var levelObj = csLogger.parseLevel("INFO");

  assert (levelObj.name === 'info');

  levelObj = csLogger.parseLevel("debug");

  assert (levelObj.name === 'debug');

  levelObj = csLogger.parseLevel("WArn");

  assert (levelObj.name === 'warn');

  levelObj = csLogger.parseLevel("ERROR");

  assert (levelObj.name === 'error');

  assert.throws(function() {
    csLogger.parseLevel("weird");
  });
}

testParseLevel();

