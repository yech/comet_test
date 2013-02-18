"use strict";

var http = require('http'),
    parse = require('url').parse;
http.globalAgent.maxSockets = 100000;
var HttpClient = function () {

};

exports = module.exports = HttpClient;

HttpClient.REQUEST_TIMEOUT = 60 * 35 * 1000;
HttpClient.REPONSE_TIMEOUT = 90 * 1000;

HttpClient.prototype.get = function (url, callback) {
    var info = parse(url),
        path = info.pathname + (info.search || ''),
        options = { host: info.hostname, port: info.port || 80, path: path, method: 'GET' },
        req = null,
        request_timeout = null,
        response_timeout = null,
        responseTimeout = function () {
            response_timeout = null;
            req.abort();
            callback(new Error('Response timeout'));
        };
    request_timeout = setTimeout(function () {
        request_timeout = null;
        req.abort();
        callback(new Error('Request timeout'));
    }, HttpClient.REQUEST_TIMEOUT);

    req = http.request(options, function (res) {
        clearTimeout(request_timeout);
        var chunks = [], length = 0;
        response_timeout = setTimeout(responseTimeout, HttpClient.REPONSE_TIMEOUT);
        res.on('data', function (chunk) {
            if (response_timeout) {
                clearTimeout(response_timeout);
                response_timeout = setTimeout(responseTimeout, HttpClient.REPONSE_TIMEOUT);
            }
            length += chunk.length;
            chunks.push(chunk);
        }).on('end', function () {
            if (response_timeout) {
                // node0.5.x及以上：req.abort()会触发res的end事件
                clearTimeout(response_timeout);
                var data = new Buffer(length), i, pos, len;
                for (i = 0, pos = 0, len = chunks.length; i < len; i++) {
                    chunks[i].copy(data, pos);
                    pos += chunks[i].length;
                }
                res.body = data;
                callback(null, res);
            }
        }).on('error', function (err) {
            clearTimeout(response_timeout);
            callback(err, res);
        }).on('aborted', function () {
            if (response_timeout) {
                // node0.5.x及以上：当res有效的时候，req.abort()会触发res的aborted事件
                callback(new Error('Response aborted'), res);
            }
        });
    }).on('error', function (err) {
        // node0.5.x及以上，调用req.abort()会触发一次“socket hang up” error
        // 所以需要判断是否超时，如果是超时，则无需再回调异常结果
        if (request_timeout) {
            clearTimeout(request_timeout);
            callback(err);
        }
    });
    req.end();
};