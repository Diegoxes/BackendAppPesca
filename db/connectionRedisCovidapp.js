'use strict';
const config = require('../config/config');
const logger = require('../util/basic-logger');

const Redis = require('ioredis');
const redis = new Redis(config.redis.dbHaydukContigo);

exports.getKey = async (key) => {
    return new Promise(function(resolve, reject){

        redis.get(key, async function (err, resultRedis) {
            if (err) {
                logger.error(err);
                reject(err);
            }

            resolve(JSON.parse(resultRedis));
        });

    });
};

exports.setKey = async (key, data, time) => {
    return new Promise(async function(resolve, reject){
        try{
            if(time != null && time > 0){
                var result = await redis.set(key, JSON.stringify(data), 'EX', time);
                if(result === 'OK'){
                    resolve();
                }else{
                    reject(result);
                }
            }else{
                var result = await redis.set(key, JSON.stringify(data));
                if(result === 'OK'){
                    resolve();
                }else{
                    reject(result);
                }
            }
        }catch(err){
            logger.error(err);
            reject(err);
        }

    });
};

exports.delKey = async (key) => {
    return new Promise(async function(resolve, reject){
        try{
            await redis.del(key);
            resolve();
        }catch(err){
            logger.error(err);
            reject(err);
        }
    });
};
