"use strict";
var port = 8124;
process.argv.forEach(function (val, index) {
    if(index===2){
        port = val;
    }
});
function handler(req, res) {

}

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app);
app.listen(port);
io.configure('development', function(){
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file
    io.set('log level', 1);                    // reduce logging


    io.set('transports', [
        'websocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
    ]);


});

io.sockets.on('connection', function (socket) {
    socket.emit('giveId',socket.id);
});

var heartBeat = function(){
    io.sockets.emit('heartbeat');
};

setInterval(heartBeat,5000);
