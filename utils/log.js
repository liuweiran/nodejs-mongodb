function init() {
    // 为log创建文件夹
    try {
        require('fs').mkdirSync('./log');
    } catch ( e ) {
        if ( e.code !== 'EEXIST' ) {
            console.error("创建文件夹错误，错误是: ", e);
            process.exit(1);
        }
    }

    const log4js = require('log4js');
    const jsonLayout = require('log4js-json-layout');
    log4js.layouts.addLayout('json', jsonLayout);

    log4js.configure({
        "appenders" : [
            {
                "type"      : "clustered",
                "appenders" : [
                    {
                        "type"     : "dateFile",
                        "filename" : "log/access.log",
                        "pattern"  : "-yyyy-MM-dd",
                        "category" : "http",
                        layout     : {
                            type    : 'json',
                            source  : 'development',
                            include : [ 'startTime', 'categoryName', "data", "level", "httpMethod", "ip", "status",
                                "storeId", "tableId", "userId", "nickname", "isMany", "orderFrom" ]
                        }
                    },
                    {
                        "type"       : "dateFile",
                        "filename"   : "log/app.log",
                        "pattern"    : "-yyyy-MM-dd",
                        "maxLogSize" : 104857600,
                        "numBackups" : 3,
                        layout       : {
                            type    : 'json',
                            source  : 'development',
                            include : [ 'startTime', 'categoryName', "data", "level", "httpMethod", "ip", "status",
                                "storeId", "tableId", "userId", "nickname", "isMany", "orderFrom" ]
                        }
                    },
                    {
                        "type"     : "logLevelFilter",
                        "level"    : "ERROR",
                        "appender" : {
                            "type"     : "file",
                            "filename" : "log/errors.log"
                        },
                        layout     : {
                            type    : 'json',
                            source  : 'development',
                            include : [ 'startTime', 'categoryName', "data", "level", "httpMethod", "ip", "status",
                                "storeId", "tableId", "userId", "nickname", "isMany", "orderFrom" ]
                        }
                    },
                    {
                        type         : 'console',
                        messageParam : 'msg',
                        layout       : {
                            type    : 'json',
                            source  : 'development',
                            include : [ 'startTime', 'categoryName', "data", "level", "httpMethod", "ip", "status",
                                "storeId", "tableId", "userId", "nickname", "isMany", "orderFrom" ]
                        }
                    }
                ]
            }
        ]
    });
}

function getLoggerHttpAppendObject(httpMethod, ip, status) {
    return {
        httpMethod,
        ip,
        status
    };
}

function getLogger(logger4js) {

    return function (req, res, next) {
        // mount safety
        if ( req._logging ) return next();

        let start = new Date().getTime();

        // flag as logging
        req._logging = true;

        //hook on end request to emit the log entry of the HTTP request.
        res.on('finish', function () {
            res.responseTime = new Date().getTime() - start;
            //status code response level handling
            if ( res.statusCode ) {
                let logString = `${req.hostname} ${req.originalUrl || req.url} ${res.responseTime}ms`;
                let appendObject = getLoggerHttpAppendObject(req.method, req.ip, res.__statusCode || res.statusCode);
                if ( res.statusCode >= 300 ) {
                    logger4js.warn(logString, appendObject);
                } else if ( res.statusCode >= 400 ) {
                    logger4js.error(logString, appendObject);
                } else {
                    logger4js.info(logString, appendObject);
                }
            }
        });

        //ensure next gets always called
        next();
    };
}

module.exports = {
    init,
    getLoggerHttpAppendObject,
    getLogger
};