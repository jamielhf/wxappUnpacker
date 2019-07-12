const fs = require('fs');

fs.readFile('./test.js',(err,buf)=>{
	let b = buf.slice(0,10);
	console.log(b);
	console.log(b.readUInt32LE(0));
})
 
    