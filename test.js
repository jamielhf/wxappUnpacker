const fs = require('fs');
const path = require('path')

function header(buf){
	console.log("\nHeader info:");
	let firstMark=buf.readUInt8(0);
	console.log("  firstMark: 0x%s",firstMark.toString(16));
	let unknownInfo=buf.readUInt32BE(1);
	console.log("  unknownInfo: ",unknownInfo);
	let infoListLength=buf.readUInt32BE(5);
	console.log("  infoListLength: ",infoListLength);
	let dataLength=buf.readUInt32BE(9);
	console.log("  dataLength: ",dataLength);
	let lastMark=buf.readUInt8(13);
	console.log("  lastMark: 0x%s",lastMark.toString(16));
	if(firstMark!=0xbe||lastMark!=0xed)throw Error("Magic number is not correct!");
	return [infoListLength,dataLength];
}
function genList(buf){
	console.log("\nFile list info:");
	let fileCount=buf.readUInt32BE(0);
	console.log("  fileCount: ",fileCount);
	let fileInfo=[],off=4;
	for(let i=0;i<fileCount;i++){
		let info={};
		let nameLen=buf.readUInt32BE(off);
		off+=4;
		info.name=buf.toString('utf8',off,off+nameLen);
		off+=nameLen;
		info.off=buf.readUInt32BE(off);
		off+=4;
		info.size=buf.readUInt32BE(off);
		off+=4;
		fileInfo.push(info);
		console.log(info);
    }
	return fileInfo;
}
// 创建文件夹
function mkdirs(dir,cb){
    fs.stat(dir,(err,stats)=>{
        if(err)mkdirs(path.dirname(dir),()=>fs.mkdir(dir,cb));
        else if(stats.isFile())throw Error(dir+" was created as a file, so we cannot put file into it.");
		else cb();
    })
}
fs.readFile('./test.wxapkg',(err,buf)=>{
    let [infoListLength,dataLength]=header(buf.slice(0,14));
    const fileInfo = genList(buf.slice(14,infoListLength+14))
    for(let info of fileInfo) {
        let fpath = path.resolve('./file/',info.name.replace('/',''));
        mkdirs(path.dirname(fpath), () => {
            fs.writeFile(fpath, buf.slice(info.off,info.off+info.size), (err)=>{
                console.log(err)
            })
        })
    }
})
