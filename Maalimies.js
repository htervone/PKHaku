"use strict";
var restify = require("restify");
var server = restify.createServer({
  name: 'Koirahaku',
  version: '1.0.0'
});

var https = require("https");
var socketio  = require ("socket.io");


server.use(restify.bodyParser());

// REMOVE THESE?? Needed for enabling CORS and needed for allowing cross-origin resource sharing 
server.use(restify.CORS());
server.use(restify.fullResponse());

// socket
var io = socketio.listen(server.server);


var sendRes = function(res,items){
    console.dir(items);
    res.send(items);
};

function pushCoordsData(data){
  io.emit('PushLocation', JSON.stringify(data));  // send data to browser
}

function sendTargetCoordinates(coordData, res){
	pushCoordsData(CoordData);
	sendRes(res, "");
}

function handleSenses(senses, time){ 
    var pushData = {};  // init
    for (var i=0; i<senses.length; i++){ // go through all the senses data
      if (senses[i].sId == '0x00010100' ){ // Latitude
        console.log("The latitude is " + senses[i].val); // remove this
        pushData["source"] = "dog";
        pushData["LAT"] = senses[i].val;
        pushData["time"] = time;
        storeSensesData("temperature", "temp", currentTemp, time);   
      }
      else{
        console.dir(senses[i]);
      }
    }
    pushCoordsData(pushData); // send data to browser
}

function addZero(i) { // adds leading zero to timestamp to get double digit figure
if (i < 10) {
      i = "0" + i;
    }
    return i;
}



//REST API implementation for getting the log data from the client
server.post('/sendCoords', function (req, res, next) {
    var coordData = req.params;
    console.log ("Maalimies coordinates received");
    sendTargetCoordinates(coordData, res);
    next();
});

//REST API implementation for getting the log data from the client
server.post('/getLog', function (req, res, next) {
    console.log ("Log request received");
    getLogdata(res, getButtonStats);
    next();
});

// REST API implementation for handling the push messages from the Thingsee IOT
server.post('/', function (req, res, next) {
    var time = new Date();
    var hh = addZero(time.getHours());
    var mm = addZero(time.getMinutes());
    var ss = addZero(time.getSeconds());
    var consoleTime = hh + ":" + mm + ":" + ss; 
    
    console.log('got IOT message from Lutikka. Timestamp ' + consoleTime); // remove this
    handleSenses(req.params[0].senses, time);

    res.send(Number(200)); // send reply, otherwise Thingsee does not send next measurement normally
    next();
});

// Socket handling
io.sockets.on('connection', function (socket) {
    //wait for client to make a socket connection
    console.log("socket connection has been made");
    //var string = "Oh. Just got a new visitor to my webpage :)";
    //postToFacebook(string, config.token);
});                              

server.listen(8080, function () {
    console.log('Node.js weatherMachine Kerttu listening at %s', server.url);
});

