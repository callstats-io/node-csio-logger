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
  
  var errMsg = util.format("can not parse level str: %s", levelStr);
  util.debug(errMsg);
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

//load the config file
var fs = require('fs');

// the default logger config
var _loggerConfig = {
    fileName :'./cs.log',
    maxSize : 10 * 1024 * 1024, // Max size in bytes of the logfile
    loggers:{
      "default":{"level":"debug"}
    }
};

/**
 * create the actual logger object based on the _loggerConfig
 * @returns {winston.Logger}
 */
function createLogger() {
  return new (winston.Logger)({
    transports : [
    new (winston.transports.File)({
      filename : _loggerConfig.fileName,
      timestamp : true,
      level : "debug",
      maxsize: _loggerConfig.maxSize
    }) ],
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
  var _logLevel = parseLevel(_loggerConfig.loggers["default"].level);

  // if the moduleName exists as a logger in the configFile, use that one
  if (_loggerConfig) {

    for ( var loggerName in _loggerConfig.loggers) {
      if (_loggerConfig.loggers.hasOwnProperty(loggerName)
          && (loggerName.toLowerCase() === moduleName.toLowerCase())) {
        
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

    var msgArgs = Array.prototype.slice.call(args);

    while (msgArgs[msgArgs.length - 1] === null) {
      msgArgs.pop();
    }
    var msg = util.format.apply(null, args);

    _theRealLogger.log(logLevel.name, msg, {
      module : logger.moduleName
    });

  };

  return logger;
};

/**
 * check whether the config is valid or not
 * @param configObj
 * @returns {Boolean}
 */
function isValidConfig(configObj) {
  return true;
}

/**
 * use the provided configFile to set the logger properties,
 * such as outputFileName, default level, level for named logger, ... etc
 * 
 * @param configFileName
 */
function loadConfig(configFileName) {
  // load the config file
  var fs = require('fs');

  var configFileExists = fs.existsSync(configFileName);

  if (! configFileExists) {
    var errorMsg = util.format("couldn't find log config file: %s", configFileName);
    util.debug(errorMsg);
    throw errorMsg;
  }
  
  var data = fs.readFileSync(configFileName, 'utf8');

  var candidateConfig = JSON.parse(data);

  //console.dir(candidateConfig);
  
  if (!isValidConfig(candidateConfig)) {
    var errorMsg = util.format("invalid config json: %s", candidateConfig);
    util.debug(errorMsg);
    throw errorMsg;
  }
  
  _loggerConfig = candidateConfig;
  // use the config to recreate the real logger object
  _theRealLogger = createLogger();
  return
}

exports.getLogger = getLogger;
exports.loadConfig = loadConfig;

// export this just for testing
exports.parseLevel = parseLevel;

