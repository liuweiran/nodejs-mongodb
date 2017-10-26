const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require("cors");
const log4js = require('log4js');

const mongo = require('./mongo/mongo');
const log = require("./utils/log");

mongo.init();
log.init();

const app = express();

app.set('view engine', 'jade'); // 设置模板引擎
app.set('views', path.join(__dirname, 'views'));  // 设置模板相对路径(相对当前目录)

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const index = require('./routes/index');
const list = require('./routes/list');
const user = require('./routes/user');

app.use(log.getLogger(log4js.getLogger('http')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/list', list);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

/*
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
var questions=[
    {
        data:213,
        num:444,
        age:12
    },
    {
        data:456,
        num:678,
        age:13
    }];
app.get('/123', function(req, res) {
   res.status(200);
   res.json(questions);
});
const server = app.listen(3000, function(){
    const host = server.address().address;
    const port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});*/