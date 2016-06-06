/*jshint esversion: 6 */

var cbor = require('cbor');

var content = {"temp": 15, "id": 1234};
var encoded = cbor.encode(content);
console.log("###CBOR###");
console.log(`Length: ${encoded.length} bytes`);
console.log(encoded);
console.log();

console.log("###JSON###");
console.log(`Length: ${JSON.stringify(content).length} bytes`);
console.log(JSON.stringify(content));
