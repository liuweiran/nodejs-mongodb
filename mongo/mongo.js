const mongodb = require("mongodb");
const log4js = require('log4js');
const logger = log4js.getLogger('mongo');   // 获取log4js的Logger实例，并设置实例的类型为`mongo`

let globalDb;

function init() {
    mongodb.MongoClient // 获得mongodb客户端对象
        .connect("mongodb://localhost:5000/demo") // 使用客户端连接数据  mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
        .then( db => {
            logger.info('connect success');
            globalDb = db;
        })
        .catch( err => {
            logger.error(err);
        })
}

function list() {
    return globalDb.collection('users').find({}).toArray();
}

function user(id) {
    return globalDb.collection('users').findOne({id});
}

function add(data) {
    return globalDb.collection('users').insertOne(Object.assign(data, {createDate: new Date()}));
}

module.exports = {
    init,
    list,
    user,
    add
};

