const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');  // 解析客户端请求的body中的内容
const cors = require('cors');   // 跨域资源共享
const log4js = require('log4js');

const mongo = require('./mongo/mongo');
const log = require("./utils/log");

mongo.init();
log.init();

const app = express();

app.set('view engine', 'jade'); // 设置模板引擎
app.set('views', path.join(__dirname, 'views'));  // 设置模板相对路径(相对当前目录)

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(log.getLogger(log4js.getLogger('access')));
app.use(bodyParser.json()); // 解析 application/json
app.use(bodyParser.urlencoded({extended: false}));  // 解析 application/x-www-form-urlencoded
// 经过`bodyParser`中间件处理后，可在所有路由处理器的`req.body`中访问请求参数
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const index = require('./routes/index');
const user = require('./routes/user');

app.use('/', index);
app.use('/user', user);

// 在 express 中，404并不是一个 error，因此错误处理器中间件并不捕获404。因为404只是意味着某些功能没有实现。也就是说，Express 执行了所有中间件、路由之后还是没有获取到任何输出。你所需要做的就是在其他所有中间件的后面添加一个处理 404 的中间件。
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// 错误处理器中间件的定义和其他中间件一样，唯一的区别是 4 个而不是 3 个参数，即 (err, req, res, next)：
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;