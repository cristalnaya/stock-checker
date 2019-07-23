/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

require('dotenv').config();

const request = require('request');

module.exports = function (app) {
  
  const Stock = require('../model/Stock');
  
    let getData = (stock) => {
        let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${process.env.API_KEY}`;
        let obj = {};
        return new Promise((resolve, reject) => {
            request(url, {
                json: true
            }, (err, res, body) => {
                if (err) {
                    console.log(err)
                };
                obj.stock = body['Global Quote']['01. symbol'];
                obj.price = body['Global Quote']['05. price'];
                resolve(obj);
            })
        })
    }

    let objectsInit = async (req, res, next) => {
        res.locals.obj1 = {};
        res.locals.obj2 = {};
        try {
            res.locals.obj1 = await getData(req.query.stock1);
        } catch (err) {
            console.log(err);
        }
        if (req.query.stock2) {
            console.log(`1st stock is: ${req.query.stock1}`);
            console.log(`2nd stock is: ${req.query.stock2}`);
            try {
                res.locals.obj2 = await getData(req.query.stock2);
            } catch (err) {
                console.log(err);
            }
        }
        next();
    }

    function handleRequest(stock, IP) {
        return new Promise((resolve, reject) => {
            Stock.findOne({
                stock: stock
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    resolve(); 
                }
                if (!data) {
                    let newStock = new Stock({
                        stock: stock,
                        IP: IP,
                        likes: 1
                    })
                    newStock.save((err, stock) => {
                        if (err) {
                            console.log(err)
                        }
                        console.log('new stock saved');
                        resolve(1); 
                    })
                } else if (data.IP.includes(IP)) {
                    console.log(`already liked from here ${data.IP}`);
                    resolve(data.likes); 
                } else {
                    Stock.update({
                            stock: stock
                        }, {
                            $inc: {
                                likes: 1
                            },
                            $push: {
                                IP: IP
                            }
                        },
                        (err, newData) => {
                            if (err) {
                                console.log(err)
                            };
                            console.log('existing stock updated');
                            resolve(newData.likes);
                        }
                    )
                }
            })
        })
    }

    function getLikes(stock) {
        return new Promise((resolve, reject) => {
            Stock.findOne({
                stock: stock
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    resolve();
                }
                if (data) {
                    resolve(data.likes)
                }
                resolve(0); 
            })
        })
    }

    let addLikes = async (req, res, next) => {
        if (!req.query.like && !req.query.stock2) {
            res.locals.obj1.likes = await getLikes(req.query.stock1);
        } else if (req.query.like && !req.query.stock2) {
            res.locals.obj1.likes = await handleRequest(req.query.stock1, req.ip);
        } else if (!req.query.like && req.query.stock2) {
            res.locals.obj1.likes = await getLikes(req.query.stock1);
            res.locals.obj2.likes = await getLikes(req.query.stock2);
        } else if (req.query.like && req.query.stock2) {
            res.locals.obj1.likes = await handleRequest(req.query.stock1, req.ip);
            res.locals.obj2.likes = await handleRequest(req.query.stock2, req.ip);
        }
        next();
    }

    app.route('/api/stock-prices')
        .get(objectsInit, addLikes, (req, res) => {
            var result = {};
            if (req.query.stock2) {
                result.stockData = [{
                        stock: res.locals.obj1.stock,
                        price: res.locals.obj1.price,
                        rel_likes: res.locals.obj1.likes - res.locals.obj2.likes
                    },
                    {
                        stock: res.locals.obj2.stock,
                        price: res.locals.obj2.price,
                        rel_likes: res.locals.obj2.likes - res.locals.obj1.likes
                    }
                ]
            } else {
                result.stockData = res.locals.obj1
            };
            res.json(result);
        })

};