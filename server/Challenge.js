
"use strict";
var Challenge = exports.Challenge = function(extra){
	this.quest = '';
	this.id = '';
	this.name = '';
	this.maxPartySize = 100;
	this.description = '';
	this.testSuccess = function(key){ return true; };
	Tk.fillExtra(this,extra);
};
Challenge.create = function(quest,id,name,desc,testSuccess,maxPartySize){
	var tmp = new Challenge({
		quest:quest,
		id:id,
		name:name,
		maxPartySize: maxPartySize,
		description:desc,
		testSuccess:testSuccess,
	});
	DB[id] = tmp;
	return tmp;
}

var DB = Challenge.DB = {};

Challenge.compressClient = function(info){
	return {
		name:info.name,
		description:info.description,
	};
}


Challenge.get = function(challenge){
	return DB[challenge];
}


Challenge.testSuccess = function(challenge,key){
	return challenge.testSuccess(key) !== false;
}	






