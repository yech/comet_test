"use strict";
var http = require('http'),
    numCPUs = require('os').cpus().length;
var cp = require('child_process');
var net = require('net');
var PORT = 8001;

process.argv.forEach(function (val, index) {
    if (index === 2) {
        PORT = val;
    }
});

var workers = [];
for (var i = 0; i < numCPUs; i++) {
    workers.push(cp.fork('child.js', ['normal']));
}

net.createServer(function (s) {
    s.pause();
    var worker = workers.shift();
    worker.send('c', s);
    workers.push(worker);
}).listen(PORT);

var exitTimer = null;
function aboutExit(){
    if(exitTimer){
        return;
    }

    workers.forEach(function(c){
        c.kill();
    });
    exitTimer = setTimeout(function(){
        console.log('master exit...');
        process.exit(0);
    }, 2000);
}

process.on('SIGINT' , aboutExit);
process.on('SIGTERM' , aboutExit);