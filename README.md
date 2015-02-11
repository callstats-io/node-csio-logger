node-csio-logger
================

node-csio-logger is a thin wrapper to winston logger with very simple APIs.

Our specific requirements
- [x] write to file
- [x] log level specified per module
- [ ] ability to change log level during runtime

## Usage instructions:

- Add to `package.json`

```js
  "dependencies": {
    "node-csio-logger": "git://github.com/dialogue-io/node-csio-logger#master"
  }
```

- Install using NPM

```
$ npm install
```

- bind your code

```js
var logging = require('node-csio-logger');

//retrieve a logger for a module. The minimum loglevel is either the default level
//or a level defined spcifically for the given module.
var cokeLogger = logging.getLogger('coke');

cokeLogger.debug("this is debug line %d", 10);

cokeLogger.info('test message %s, %s', 'first', 'second');

```

- The level of a logger defines the minimum priority of the messages that will be written to the output file. For example, if a logger is set to level "info" then all `logger.debug(message)` call will not generate log output.

```
  DEBUG   : logger.debug
  INFO    : logger.info
  WARNING : logger.warn
  ERROR   : logger.error
```

- configuration file: The default output filename is 'cs.log' and the default level is "debug". You can use configuration files to specify default log level and log level for particular modules. The configuration can be picked up by calling  `loadConfig(configFileName)`.

```json
{"fileName":"./cs.log",
  "maxSize":10000000,
  "loggers":{
    "default":{"level":"INFO"},
    "coke":{"level":"DEBUG"},
    "pepsi":{"level":"INFO"}
    }
}
```
