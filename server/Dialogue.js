
"use strict";
var IconModel;
global.onReady(function(){
	IconModel = rootRequire('shared','IconModel');
});
var Dialogue = exports.Dialogue = function(extra){
	this.quest = '';
	this.id = '';
	this.name = '';
	this.image = '';
	this.nodeList = {};	//Dialogue.Node
	Tk.fillExtra(this,extra);
};

Dialogue.create = function(Q,id,name,image,list){
	var tmp = new Dialogue({
		quest:Q,
		id:id,
		name:name,
		image:image,
	});
	for(var i in list)	
		tmp.nodeList[list[i].id] = list[i];
	
	//set npc to
	for(var i in tmp.nodeList){
		tmp.nodeList[i].npc = id;
		for(var j in tmp.nodeList[i].option)
			tmp.nodeList[i].option[j].npc = id;
	}
	
	if(image)
		IconModel.testIntegrity(image);
	
	DB[Q] = DB[Q] || {};
	DB[Q][id] = tmp;
};

var DB = Dialogue.DB = {};

Dialogue.Node = function(Q,id,text,option,event,noFace,allowExit){
	var tmp = {
		id:id,
		text:text,
		option:[],
		event:event,
		quest:Q,
		noFace:!!noFace,
		allowExit:!!allowExit,
	};	
	
	for(var i in option)
		option[i].node = id;
	tmp.option = option;
	return tmp;		
}

Dialogue.Option = function(Q,text,next,event){
	return {
		text:text,
		next:next,
		event:event,	//either func or '$0'
		quest:Q,
		npc:'',		//set later,
		node:'',	//set later
	};		
}

Dialogue.Face = function(image,name){
	return {image:image,name:name};
}

Dialogue.get = function(quest,npc){
	return (DB[quest] && DB[quest][npc]) || null;
}

