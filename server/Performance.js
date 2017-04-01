
"use strict";
var Sign;
global.onReady(function(){
	Sign = rootRequire('private','Sign');
	global.onLoop(Performance.loop,100);
});
var Performance = exports.Performance = {};

var FRAME_COUNT = 0;
var DISPLAY = NODEJITSU;
var OLD_TIME = Date.now();
var FREQUENCE = 30*60*1000/40;
var LAST_TICK_LENGTH = 0;
var LAST_TICK_TIME = 0;

var UPLOAD = {size:0,limitTotal:1000*1000000,limitPerMin:50*1000000};		//what server send
var DOWNLOAD = {size:0,limitTotal:100*1000000,limitPerMin:100000};	//what client send

Performance.LAST_CONSOLE_LOG = '';

Performance.DOWNLOAD = 'DOWNLOAD';
Performance.UPLOAD = 'UPLOAD';

Performance.loop = function(){
	FRAME_COUNT++;
	
	LAST_TICK_LENGTH = Date.now()-LAST_TICK_TIME;
	LAST_TICK_TIME = Date.now();
	
	if(DISPLAY && FRAME_COUNT % FREQUENCE === 0){
        var d = Date.now();
		Performance.LAST_CONSOLE_LOG = 'Performance: ' + Math.round(40*FREQUENCE/(d - OLD_TIME)*100) + '%. '
		OLD_TIME = d;
		
		INFO(
			Performance.LAST_CONSOLE_LOG
			+ 'Upload: ' + Math.round(UPLOAD.size/1000) + ' KB. '
			+ 'Download: ' + Math.round(DOWNLOAD.size/1000) + ' KB.'
		);		
    }
	
	
	
	
}

//Bandwidth
Performance.bandwidth = function(type,data,socket,interval){
	interval = interval || 1;
	var size = Performance.bandwidth.getSize(data) * interval;
	var WHAT = type === Performance.UPLOAD ? UPLOAD : DOWNLOAD;
	socket.bandwidth[type] += size;
	WHAT.size += size;
	
	if(socket.bandwidth[type] > WHAT.limitTotal
		|| socket.bandwidth[type]/Math.max(socket.globalTimer/CST.MIN,2) > WHAT.limitPerMin){
		Sign.off(socket.key,'You have capped your bandwidth for this session.');
	}
}
Performance.bandwidth.getSize = function(obj){
	return (Tk.stringify(obj||0).length * 2) || 0;   //in bytes
}  













