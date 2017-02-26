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
var myPort1 = new serialport("COM3", {
   baudRate: 115200,
   // look for return and newline at the end of each data packet:
   parser: serialport.parsers.readline("\n")
 });
 var myPort2 = new serialport("COM6", {
   baudRate: 115200,
   // look for return and newline at the end of each data packet:
   parser: serialport.parsers.readline("\n")
 });
myPort1.on('open', showPortOpen);
myPort1.on('data', sendSerialData);
myPort1.on('close', showPortClose);
myPort1.on('error', showError);
myPort2.on('open', showPortOpen);
myPort2.on('data', sendSerialData);
myPort2.on('close', showPortClose);
myPort2.on('error', showError);
function showPortOpen() {
   console.log('port open. Data rate: ' + myPort1.options.baudRate);
   console.log('port open. Data rate: ' + myPort2.options.baudRate);
}
	var degree;
	var minutes;
	//var degreebuff[10];
function sendSerialData(data) {
	//-----------------------------------
	//console.log(String(data));
	if (!data.includes("Not found")) {
   // found RMC
    p = data;
	var rangeFound = p.split(" ");
    
	
	var mess = rangeFound[0].concat(",",rangeFound[4]);
	
	//console.log(p);
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
  myPort1.write(data);
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
