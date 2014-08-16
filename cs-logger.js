/**
 * our own version of the logging module. Abstract away the selected logging
 * module such as 'winston' or 'log4js'
 * 
 * 
 */

// ---- copied from
// https://github.com/flatiron/winston#instantiating-your-own-logger
var winston = require('winston');
var util = require('util');

var _level = {
  DEBUG : {
    value : 0,
    name : "debug"
  },
  INFO : {
    value : 10,
    name : "info"
  },
  WARNING : {
    value : 20,
    name : "warn"
  },
  ERROR : {
    value : 30,
    name : "error"
  }
};

/**
 * compare two levels and return -1 if l1 < l2, 0 if l1 == l2, 1 if l1 > l2
 * 
 * @param l1
 *            a level
 * @param l2
 *            a level
 * @returns
 */
function compareLevels(l1, l2) {
  if (l1.value < l2.value)
    return -1;

  if (l1.value === l2.value)
    return 0;

  return 1;
}

//load the config file
var fs = require('fs');
var configFileName = 'cs-logger.json';
var _logger = new (winston.Logger)({
  transports : [
  // it will be nice to reset the log level dynamically
  new (winston.transports.File)({
    filename : './cs.log',
    timestamp : true,
    level : 'debug'
  }) ],
  exceptionHandlers : [ new winston.transports.File({
    filename : './exceptions.log'
  }) ]
});

var _loggerConfig = null;

var configFileExists = fs.existsSync(configFileName);

if (configFileExists) {
  var data = fs.readFileSync(configFileName, 'utf8');
    
    _loggerConfig = JSON.parse(data);

    console.dir(_loggerConfig);
}



/**
 * Get a logger object for the given module
 */
function getLogger(moduleName) {

  var logger = {};

  // need a better way to set log level
  var _logLevel = _level.DEBUG;

  logger.moduleName = moduleName;

  logger.setLevel = function(newLevel) {
    _logLevel = newLevel;
  };

  logger.debug = function() {
    _writeLog(_level.DEBUG, arguments);
  };

  logger.info = function() {
    _writeLog(_level.INFO, arguments);
  };

  logger.warn = function() {
    _writeLog(_level.WARNING, arguments);
  };

  logger.error = function() {
    _writeLog(_level.ERROR, arguments);
  };

  function _writeLog(logLevel, args) {

    // we only log the message if logLevel is higher than the '_level' set to
    // the logger
    if (compareLevels(logLevel, _logLevel) < 0)
      return;

    var msgArgs = Array.prototype.slice.call(args);

    while (msgArgs[msgArgs.length - 1] === null) {
      msgArgs.pop();
    }
    var msg = util.format.apply(null, args);

    _logger.log(logLevel.name, msg, {
      module : logger.moduleName
    });

  }
  ;

  return logger;
};

exports.getLogger = getLogger;
