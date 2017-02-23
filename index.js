var serialport = require('serialport');
//var SerialPort = serialport.SerialPort;
 
var WebSocketServer = require('ws').Server;   // include the webSocket library

// configure the webSocket server:
var SERVER_PORT = 8081;                 // port number for the webSocket server
var wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
var connections = new Array;            // list of connections to the server

// list serial ports:
serialport.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port);
  });
});
var myPort = new serialport("COM8", {
   baudRate: 9600,
   // look for return and newline at the end of each data packet:
   parser: serialport.parsers.readline("\n")
 });
myPort.on('open', showPortOpen);
myPort.on('data', sendSerialData);
myPort.on('close', showPortClose);
myPort.on('error', showError);
function showPortOpen() {
   console.log('port open. Data rate: ' + myPort.options.baudRate);
}
	var degree;
	var minutes;
	//var degreebuff[10];
function sendSerialData(data) {
	//-----------------------------------
	console.log(String(data));
	if (data.includes("$GPRMC")) {
   // found RMC
    p = data;
	var RMC = p.split(",");
    
	
	var mess = RMC[3].concat("," + RMC[4] + "," + RMC[5] + "," + RMC[6]);
	//mess = (hour + minute + seconds);
	//console.log(RMC[1]);
	console.log(mess);
    if (connections.length > 0) {
    broadcast(String(mess));
    }
	}
	/*//----------------------------------------
  console.log(String(data));
  if (connections.length > 0) {
    broadcast(data);
  */
	
}
	
function showPortClose() {
   console.log('port closed.');
}
 
function showError(error) {
   console.log('Serial port error: ' + error);
}
function sendToSerial(data) {
  console.log("sending to serial: " + data);
  myPort.write(data);
}
// ------------------------ webSocket Server event functions

wss.on('connection', handleConnection);

function handleConnection(client) {
  console.log("New Connection");        // you have a new client
  connections.push(client);             // add this client to the connections array

  client.on('message', sendToSerial);      // when a client sends a message,

  client.on('close', function() {           // when a client closes its connection
    console.log("connection closed");       // print it out
    var position = connections.indexOf(client); // get the client's position in the array
    connections.splice(position, 1);        // and delete it from the array
  });
}
// This function broadcasts messages to all webSocket clients
function broadcast(data) {
  for (c in connections) {     // iterate over the array of connections
    connections[c].send(JSON.stringify(data)); // send the data to each connection
  }
}
