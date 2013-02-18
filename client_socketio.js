"use strict";
var SERVER = '127.0.0.1',
    PORT = 8124,
    SUB_COUNT = 1000,
    SUB_INTERVAL = 100;

process.argv.forEach(function (val, index) {
    switch (index) {
        case 2:
            SERVER = val;
            break;
        case 3:
            PORT = val;
            break;
        case 4:
            SUB_COUNT = parseInt(val, 10);
            break;
        case 5:
            SUB_INTERVAL = parseInt(val, 10);
            break;
        default:
    }
});
var sub = function (no) {
    var io = require('socket.io-client');
    var socket = io.connect('http://' + SERVER + ':' + PORT);
    socket.on('connect', function () {
        console.log("client no " + no + " is connecting");
    });
    socket.on('giveId', function (id) {
        socket.rcvId = id;
        console.log("client no " + no + " receive id -> "+id);
    });
    socket.on('heartbeat',function(){
        console.log("client no " + no + " receive heartbeat");
    });
};

for (var i = 0; i < SUB_COUNT; i++) {
    setTimeout(sub, i * SUB_INTERVAL, i + 1);
}

