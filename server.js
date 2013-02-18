"use strict";
var http = require("http");
var returnResponseTimeout = 1000 * 60 * 15;
var count = 0;
var returnResponse = function (response) {
    var body =new Buffer(JSON.stringify({messages:[]}));
    response.end(body);
    count--;
};

http.createServer(function (req, res) {
    count++;
    req.connection.setNoDelay(true);
    req.connection.setTimeout(0);
    res.writeHead(200, {"Content-Type": "text/plain","Connection": "close"});
    setTimeout(returnResponse, returnResponseTimeout, res);
}).listen(8001);

setInterval(function () {
    var mem = process.memoryUsage();
    console.log("current connection:" + count+'  rss:' + mem.rss);
}, 1000);
