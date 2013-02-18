"use strict";
var http = require('http');
var returnResponseTimeout = 1000 * 60 * 15;
var count = 0;
var returnResponse = function (response) {
    var body = new Buffer(JSON.stringify({messages:[]}));
    response.end(body);
};
var heartBeat = function (response) {
    response.write("\n");
};
var onClose = function(){
    count--;
    clearInterval(this.heartBeat);
};
var server = http.createServer(function (req, res) {
    count++;
    req.connection.setNoDelay(true);
    req.connection.setTimeout(0);
    res.writeHead(200, {"Content-Type":"text/plain", "Connection":"close"});
    req.connection.heartBeat = setInterval(heartBeat, 5000, res);
    req.connection.addListener('close', onClose);
    setTimeout(returnResponse, returnResponseTimeout , res);
});

console.log("webServer started on " + process.pid);
process.on("message", function (msg, socket) {
    process.nextTick(function () {
        if (msg === 'c' && socket) {
            socket.readable = socket.writable = true;
            socket.resume();
            socket.server = server;
            server.emit("connection", socket);
            socket.emit("connect");
        }
    });
});
setInterval(function () {
    var mem = process.memoryUsage();
    console.log(process.pid + "-> current connection:" + count + '  rss:' + mem.rss);
}, 1000);
