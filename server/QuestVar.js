
"use strict";
var Debug;
global.onReady(function(initPack){
	Debug = rootRequire('server','Debug');
	db = initPack.db;
},{db:['questVar']});
var QuestVar = exports.QuestVar = {};
var db;
//BAD weird constructor
QuestVar.create = function(quest,main,oldValue){	//oldValue is taken from db
	var regular = QuestVar.getInitVar(quest);
	if(!oldValue)
		oldValue = regular;
	else {
		for(var i in oldValue){
			if(regular[i] === undefined)	//var was removed
				delete oldValue[i];
		}
		for(var i in regular){
			if(oldValue[i] === undefined)	//var was added
				oldValue[i] = regular[i];
		}
	}
	
	oldValue.key = main.id;
	oldValue.username = main.username;
	return oldValue;
}
QuestVar.Model = function(quest,varName){	//called from s.exports
	var tmp = {
		quest:quest,
		key:null,
	}
	for(var i in varName)
		tmp[i] = varName[i];
	DB[quest] = tmp;
	LIST[quest] = {};
}


var LIST = QuestVar.LIST = {};	//player values ||| questId:playerId:variableName:value
var DB = QuestVar.DB = {};	//default values

QuestVar.set = function(quest,key,name,value){
	if(typeof value === 'object') return ERROR(3,'cant set object',quest,name,value);
	if(value === undefined) return ERROR(3,'undefined value',quest,name);
	
	if(!LIST[quest] || !LIST[quest][key]) return ERROR(3,'invalid quest key',quest,key);
	if(Debug.getAttr('trackQuestVar'))
		INFO(name,value,'[old: ' + LIST[quest][key][name] + ']');
	
	LIST[quest][key][name] = value
	return value;
}

QuestVar.get = function(quest,key,name){
	var value = LIST[quest] && LIST[quest][key] && LIST[quest][key][name];
	if(value === undefined) return ERROR(3,'undefined',quest,key,name);
	return value;
}
QuestVar.getInitVar = function(quest){
	if(!DB[quest]) return ERROR(3,'no quest',quest);
	return Tk.deepClone(DB[quest]);
}
QuestVar.getInitVar.all = function(){
	return Tk.deepClone(DB);
}

QuestVar.addToList = function(questVar){	//questVar was created via QuestVar
	if(!LIST[questVar.quest]) return ERROR(3,'invalid quest',questVar.quest);
	LIST[questVar.quest][questVar.key] = questVar;
}

QuestVar.removeFromList = function(quest,main){
	if(!LIST[quest]) return ERROR(3,'invalid quest',quest);
	delete LIST[quest][main.id];
}

QuestVar.onSignOff = function(main){
	if(!main.questActive) return;
	if(!LIST[main.questActive]) return ERROR(3,'invalid quest',main.questActive);
	delete LIST[main.questActive][main.id];
}


QuestVar.removeFromDb = function(quest,main,cb){
	db.questVar.remove({quest:quest,username:main.username},cb||db.err);
}

QuestVar.getViaMain = function(main){
	try {
		return LIST[main.questActive][main.id];
	}catch(err){ ERROR.err(3,err); }
}

QuestVar.uncompressDb = function(questVar,main){
	if(!questVar){
		ERROR(3,'questVar dont exist for',main.questActive,main.username);
		questVar = QuestVar.create(main.questActive,main);
	}
	return questVar;
}

QuestVar.onSignIn = function(questVar,main){
	if(questVar)
		QuestVar.addToList(QuestVar.create(questVar.quest,main,questVar));
}








