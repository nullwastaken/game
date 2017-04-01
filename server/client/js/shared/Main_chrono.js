
"use strict";
(function(){ //}
var Dialog;
global.onReady(function(){
	Dialog = rootRequire('client','Dialog',true);
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.chronoRemove,Command.MAIN,[ //{
		Command.Param('string','Chrono Name',false),
	],Main.chrono.onRemoveCommand); //}
});
	
var Main = rootRequire('shared','Main');

Main.chrono = {}; 

Main.Chrono = function(chrono){	//should do something cuz can store timer in db...
	return chrono || {};
}
var Chrono = function(id,visible,text){
	return {
		id:id || '',
		visible:visible !== false,
		text:text || '',
		time:0,
		removeTime:0,
		serverFrameCount:0,	//in theory serverFrameCount===time
		active:true,
	};
}

Main.Chrono.compressDb = function(chrono){
	var ret = [];
	for(var i in chrono){
		if(chrono[i].active) 
			ret.push(chrono[i]);
	}
	return ret;
}

Main.Chrono.uncompressDb = function(chrono){
	var ret = {};
	for(var i = 0 ; i < chrono.length; i++)
		ret[chrono[i].id] = chrono[i];
	return Main.Chrono(ret);
}

Main.Chrono.getDbSchema = function(){
	return Array.of({
		id:String,
		visible:Boolean,
		text:String,
		time:Number,
		removeTime:Number,
		serverFrameCount:Number,	//in theory serverFrameCount===time
		active:Boolean,
		'*':null
	});
}

Main.chrono.start = function(main,id,visible,text){ //server
	main.chrono[id] = Chrono(id,visible,text);
	Main.setChange(main,'chrono',main.chrono);
}
Main.chrono.stop = function(main,id){ //server
	if(!main.chrono[id])
		return ERROR(3,'no chrono',id);
	main.chrono[id].active = false;
	Main.setChange(main,'chrono',main.chrono);
	return main.chrono[id].time;	//send # frames 
}
Main.chrono.remove = function(main,id){ //server 
	delete main.chrono[id];	
	Main.setChange(main,'chrono',main.chrono);
}

Main.chrono.onRemoveCommand = function(main,name){
	if(main.chrono[name] && !main.chrono[name].active)
		Main.chrono.remove(main,name);
}

var onChange = function(){
	if(!SERVER)
		Dialog.onChronoChange();
}

Main.chrono.loop = function(main){	//only function ran on client side
	var changed = false;
	for(var i in main.chrono){
		if(main.chrono[i].active){
			changed = true;
			main.chrono[i].time += 1;
		}
		else if(main.chrono[i].removeTime++ > 25*30 && SERVER) 
			Main.chrono.remove(main,i);
	}
	if(changed)
		onChange();
}

Main.chrono.onPackageReceived = function(num){
	var changed = false;
	for(var i in w.main.chrono){
		if(w.main.chrono[i].active){
			w.main.chrono[i].serverFrameCount += num;
			w.main.chrono[i].time = w.main.chrono[i].serverFrameCount;
			changed = true;
		}	
	}	
	if(changed)
		onChange();
}	





})(); //{














