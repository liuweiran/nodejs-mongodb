const log4js = require('log4js');
const fs = require('fs');
const logDir = './log';

function init() {

    !fs.existsSync(logDir) && fs.mkdirSync(logDir);

    log4js.configure({
        appenders: [{
            type: "Clustered",
            appenders: [
                {
                    type: 'dateFile',
                    filename: 'log/access',
                    pattern: '-yyyy-MM-dd.log',
                    alwaysIncludePattern: true,
                    category: 'access',
                    layout: {
                        include: [ 'startTime', 'categoryName', "data", "level", "httpMethod", "ip", "status" ]
                    }
                },
                {
                    type: 'dateFile',
                    filename: 'log/app',
                    pattern: '-yyyy-MM-dd.log',
                    alwaysIncludePattern: true,
                    maxLogSize : 104857600,
                    numBackups : 3,
                    layout: {
                        include: [ 'startTime', 'categoryName', "data", "level", "httpMethod", "ip", "status" ]
                    }
                },
                {
                    type: 'logLevelFilter',
                    level: 'ERROR',
                    appender: {
                        type: 'file',
                        filename: 'log/errors',
                        pattern: '-yyyy-MM-dd.log',
                        alwaysIncludePattern: true,
                    },
                    layout: {
                        include: [ 'startTime', 'categoryName', "data", "level", "httpMethod", "ip", "status" ]
                    }
                },
                {
                    type: 'console',
                    messageParam : 'msg',
                    layout: {
                        include: [ 'startTime', 'categoryName', "data", "level", "httpMethod", "ip", "status" ]
                    }
                }
            ]
        }]
    });
}

function getLogger(logger) {
    return function (req, res, next) {
        if (req._logging) return next();

        let start = new Date().getTime();
        req._logging = true;

        res.on('finish', () => {

            res.responseTime = new Date().getTime() - start;
            if (res.statusCode) {
                const logString = `${req.hostname} ${req.originalUrl || req.url} ${res.responseTime}ms`;
                const appendObject = {
                    httpMethod: req.method,
                    ip: req.ip,
                    status: req.statusCode
                };

                const code = Number(res.statusCode);
                switch (true) {
                    case code >= 300 && code !== 304:
                        logger.warn(logString, appendObject);
                        break;
                    case code >= 400:
                        logger.error(logString, appendObject);
                        break;
                    default:
                        logger.info(logString, appendObject);
                        break;
                }
            }
        });

        next();
    }
}

module.exports = {
    init,
    getLogger
};