/**
 * our own version of the logging module. Abstract away the selected logging
 * module such as 'winston' or 'log4js'
 *
 *
 */

/*jslint node: true */
'use strict';

// ---- copied from
// https://github.com/flatiron/winston#instantiating-your-own-logger
var winston = require('winston');
var util = require('util');
var fs = require('fs');


var _level = {
  DEBUG : {
    value : 0,
    name : 'debug'
  },
  INFO : {
    value : 10,
    name : 'info'
  },
  WARNING : {
    value : 20,
    name : 'warn'
  },
  ERROR : {
    value : 30,
    name : 'error'
  }
};

/*
we consider the first argument in the log(xx...) as a metaData if it is an plain object (created using "{}" or "new Object")
*/
var _objectConstructor = {}.constructor;
function isMetaData(anObj) {
  if (anObj.constructor === _objectConstructor) {
      return true;
  }
  return false;
}

/**
  copied from http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically

 * Merge attributes of two objects.
 * Attributes with the same name in obj2 will overrite the ones in obj1
 * @param obj1
 * @param obj2
 * @returns a new object with merged attributes
 */
function merge_attributes(obj1,obj2){
  var obj3 = {};
  for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
  for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
  return obj3;
}

/**
 * convert a string to a enumerated item in _level
 * @param levelStr
 */
function parseLevel(levelStr) {
  for (var enumItem in _level) {
    if (_level.hasOwnProperty(enumItem)) {
        if (_level[enumItem].name === levelStr.toLowerCase()) {
          return _level[enumItem];
        }
    }
  }

  var errMsg = util.format('can not parse level str: %s', levelStr);
  console.error(errMsg);
  throw errMsg;
}

/**
 * compare two levels and return -1 if l1 < l2, 0 if l1 == l2, 1 if l1 > l2
 */
function compareLevels(l1, l2) {
  if (l1.value < l2.value)
    return -1;

  if (l1.value === l2.value)
    return 0;

  return 1;
}

// the default logger config
var _loggerConfig = {
    fileName : './cs.log',
    maxSize : 10 * 1024 * 1024, // Max size in bytes of the logfile
    maxFiles: 10, // The default number of files to keep after rotation
    loggers:{
      'default':{'level':'INFO'}
    }
};

/**
 * create the actual logger object based on the _loggerConfig
 * @returns {winston.Logger}
 */
function createLogger() {
  var config_options={
      filename : _loggerConfig.fileName,
      timestamp : true,
      level : 'debug', // we don't rely on winston to control the level. So set it to higher verbosity here.
      maxsize: _loggerConfig.maxSize,
    };
  if (_loggerConfig.maxFiles) {
    config_options.maxFiles = _loggerConfig.maxFiles;
  }

  return new (winston.Logger)({
    transports : [ new winston.transports.File(config_options) ],
    exceptionHandlers : [ new winston.transports.File({
      filename : _loggerConfig.fileName,
      timestamp: true,
    }) ]
  });
}

var _theRealLogger = createLogger();

/**
 * Get a logger object for the given module
 */
function getLogger(moduleName) {

  var logger = {};

  // use the default level as the initial value
  var _logLevel = parseLevel(_loggerConfig.loggers['default'].level);

  // if the moduleName exists as a logger in the configFile, use that one
  if (_loggerConfig) {

    for ( var loggerName in _loggerConfig.loggers) {
      if (_loggerConfig.loggers.hasOwnProperty(loggerName) &&
         (loggerName.toLowerCase() === moduleName.toLowerCase())) {

        // override the _logLevel with configured level
        _logLevel = parseLevel(_loggerConfig.loggers[loggerName].level);
        break;
      }
    }
  }

  logger.moduleName = moduleName;

  logger.setLevel = function(newLevelStr) {
    _logLevel = parseLevel(newLevelStr);
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

  // the actual log output logic
  function _writeLog(logLevel, args) {

    // we only log the message if logLevel is higher than the '_level' set to
    // the logger
    if (compareLevels(logLevel, _logLevel) < 0)
      return;

    // converts the args to an array
    var msgArgs = Array.prototype.slice.call(args);

    // remove trailing nulls if any
    while (msgArgs[msgArgs.length - 1] === null) {
      msgArgs.pop();
    }

    if (msgArgs.length === 0) {
      return;
    }

    var metaData = {module : logger.moduleName};
    //check if the first argument is an meta data object
    if (isMetaData(msgArgs[0]) && (msgArgs.length > 1)) {
      metaData = merge_attributes(metaData, msgArgs[0]);
      msgArgs = msgArgs.slice(1); // remove the metaData from msg rendering
    }

    var msg = util.format.apply(null, msgArgs);

    _theRealLogger.log(logLevel.name, msg, metaData);

  }

  return logger;
}

/**
 * check whether the config is valid or not
 * @param configObj
 * @returns {Boolean}
 */
function isValidConfig(configObj) {
  // TO-DO: check whether the give config is valid
  if (configObj) return true;
  return false;
}

/**
 * use the provided configFile to set the logger properties,
 * such as outputFileName, default level, level for named logger, ... etc
 *
 * @param configFileName
 */
function loadConfig(configFileName) {

  var configFileExists = fs.existsSync(configFileName);

  if (! configFileExists) {
    var errorMsg = util.format("couldn't find log config file: %s", configFileName);
    console.error(errorMsg);
    throw errorMsg;
  }

  var data = fs.readFileSync(configFileName, 'utf8');

  var candidateConfig = JSON.parse(data);

  //console.dir(candidateConfig);

  if (!isValidConfig(candidateConfig)) {
    var errorMsg = util.format('invalid config json: %s', candidateConfig);
    console.error(errorMsg);
    throw errorMsg;
  }

  _loggerConfig = candidateConfig;

  // use the config to recreate the real logger object
  _theRealLogger = createLogger();

}

exports.getLogger = getLogger;
exports.loadConfig = loadConfig;

// export this just for testing
exports.parseLevel = parseLevel;
exports.isMetaData = isMetaData;

