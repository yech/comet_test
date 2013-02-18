"use strict";
var HttpClient = require("./HttpClient");
var timeout = 15 * 60 * 1000;
var SERVER = "127.0.0.1";
var PORT = 8001;
var SUB_COUNT = 1000;
var SUB_INTERVAL = 100;

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
            SUB_INTERVAL = parseInt((timeout - 60 * 1000) / SUB_COUNT, 10);
            break;
        case 5:
            SUB_INTERVAL = parseInt(val, 10);
            break;
        default:
    }
});

function newGuid() {
    var guid = "";
    for (var i = 1; i <= 32; i++) {
        guid += Math.floor(Math.random() * 16.0).toString(16);
        if ((i === 8) || (i === 12) || (i === 16) || (i === 20)) {
            guid += "-";
        }
    }
    return guid;
}

function randomType() {
    var types = [-1, 10, 20, 30, 40, 50, 60];
    var randomIndex = Math.ceil(Math.random() * 7) - 1;
    return types[randomIndex];
}

function sub(no, uid, tid, eid, id, since) {
    var httpClient = new HttpClient();
    if (uid === undefined) {
        uid = newGuid();
    }
    if (tid === undefined) {
        tid = randomType();
    }
    var url = "http://" + SERVER + ":" + PORT + "/sub?uid=" + uid + "&tid=" + tid;
    if (eid !== undefined) {
        url = url + "&eid=" + eid;
    }
    if (id !== undefined) {
        url = url + "&id=" + id;
    }
    if (since !== undefined) {
        url = url + "&since=" + since;
    }
    console.log("request #" + no + " " + uid + ":" + tid);
    httpClient.get(url, function (err, res) {
        if (err !== null) {
            console.log("error:" + err.message + ". Request #" + no + " after 5s.");
            setTimeout(sub, 5000, no, uid, tid, eid, id, since);
        } else {
            if (res.statusCode === 200) {
                var result = JSON.parse(res.body);
                if (result.error !== undefined && result.error !== null && result.error !== "") {
                    console.log("error:" + result.error + ". Request #" + no + " after 5s.");
                    setTimeout(sub, 5000, no, uid, tid, eid, id, since);
                } else {
                    id = result.id;
                    var messages = result.messages;
                    if (messages !== undefined && messages.length > 0) {
                        since = 0;
                        for (var i = 0; i < messages.length; i++) {
                            if (messages[i].time > since) {
                                since = messages[i].time;
                            }
                        }
                    } else {
                        since = result.time;
                    }

                    console.log("request #" + no + " returned with " + messages.length + " messages.");
                    //process.nextTick(function () {
                    //    sub(no, uid, tid, eid, id, since);
                    //});
                    setTimeout(function () {
                        sub(no, uid, tid, eid, id, since);
                    }, 5000);
                }
            } else {
                console.log("error:" + res.body + ". Request #" + no + " after 5s.");
                setTimeout(sub, 5000, no, uid, tid, eid, id, since);
            }

        }
    });
}

for (var i = 0; i < SUB_COUNT; i++) {
    setTimeout(sub, i * SUB_INTERVAL, i + 1);
}