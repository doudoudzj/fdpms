'use strict';

module.exports = () => {
    // 正式环境配置文件
    // 所配置参数值会覆盖 'config.prod.js' 默认配置项值
    const config = (exports = {});

    config.debug = false;
    config.origin = 'http://localhost:7001';

    // redis配置
    config.redis = {
        client: {
            port: 6379, // Redis port
            host: '127.0.0.1', // Redis host
            password: '',
            db: 0
        }
    };

    // mongodb 服务
    const dbclients = {
        db3: {
            // 单机部署
            url: 'mongodb://127.0.0.1:27017/performance',
            // 副本集 读写分离
            // url: 'mongodb://127.0.0.1:28100,127.0.0.1:28101,127.0.0.1:28102/performance?replicaSet=rs1',
            // 集群分片
            // url: 'mongodb://127.0.0.1:30000/performance',
            options: {
                poolSize: 100,
                keepAlive: 10000,
                connectTimeoutMS: 10000,
                autoReconnect: true,
                reconnectTries: 100,
                reconnectInterval: 1000
            }
        }
    };
    if (config.report_data_type === 'mongodb') {
        dbclients.db1 = {
            // url: 'mongodb://127.0.0.1:27017,127.0.0.1:27018/performance?replicaSet=performance',
            url: 'mongodb://127.0.0.1:27019/performance',
            options: {
                poolSize: 100,
                keepAlive: 10000,
                connectTimeoutMS: 10000,
                autoReconnect: true,
                reconnectTries: 100,
                reconnectInterval: 1000
            }
        };
    }

    // mongoose配置
    config.mongoose = {
        clients: dbclients
    };

    return config;
};
