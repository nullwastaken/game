
"use strict";
(function(){ //}
var ItemList, Dialog;
global.onReady(function(){
	ItemList = rootRequire('shared','ItemList');
	Dialog = rootRequire('client','Dialog',true);
});
var Main = rootRequire('shared','Main');

Main.getSignInPack = function(main){
	return {
		reputation:main.reputation,
		social:main.social,
		quest:main.quest,
		questActive:main.questActive,
		questHint:main.questHint,
		sideQuestHint:main.sideQuestHint,
		invList:Main.ItemList.compressClient(main.invList),
		bankList:Main.ItemList.compressClient(main.bankList),
		hudState:main.hudState,
		sideQuest:main.sideQuest,
		dailyTask:main.dailyTask,
		contribution:main.contribution,
		achievement:main.achievement,
		username:main.username,
		name:main.name,
		party:Main.Party.compressClient(main.party),
	}
}

Main.setChangeAll = function(frame){
	if(frame % 6 !== 0)
		return;
	for(var i in Main.LIST)
		Main.generateChange(Main.LIST[i],frame);
}

Main.setChange = function(main,what,value,append){	//good if no compression and changed a 1 place
	if(!append){
		main.change[what] = value;
		return;
	}
	main.change[what] = main.change[what] || [];
	main.change[what].push(value);
}

Main.generateChange = function(main,frame){
	if(frame % 6 === 0){
		for(var i in main.flag)
			main.change[i] = main.flag[i](main);
		main.flag = {};
		
		for(var i in main.temp)
			main.change[i] = main.temp[i];
		main.temp = {};
	}
};

Main.onChange('invList',function(main,data){
	main.invList = Main.ItemList.uncompressClient(data);
});

Main.onChange('chrono',function(main,data){
	main.chrono = data;
	Dialog.onChronoChange();
});

Main.onChange('bankList',function(main,data){
	main.bankList = Main.ItemList.uncompressClient(data);
});

Main.onChange('tradeList',function(main,data){
	main.tradeList = Main.ItemList.uncompressClient(data);
});

Main.onChange('party',function(main,data){
	main.party = Main.Party.uncompressClient(data);
});

Main.onChange('dialogue',function(main,data){
	if(!data){
		Dialog.close('dialogue');
		Dialog.open('chat');
	}
	else {
		Dialog.open('dialogue',data);
		Dialog.close('chat');
	}
	main.dialogue = data;
});

Main.applyChange = function(main,change){
	for(var i in change)
		if(Main.onChange.have(i))
			Main.onChange.pub(i,main,change[i]);
		else
			Tk.viaArray.set(main,i.split(','),change[i]);	
}

Main.setFlag = function(act,what,func){ //good if compression
	act.flag[what] = func;
}

Main.resetChangeForAll = function(){
	for(var i in Main.LIST){ 
		Main.get(i).change = {}; 
	}
}


if(!SERVER)
	return;

Main.compressDb = function(main){ //main is clone. Main.Quest.compressDb separated
	var tmp = {
		invList:Main.ItemList.compressDb(ItemList.combine(main.invList,main.tradeList)),
		bankList:Main.ItemList.compressDb(main.bankList),
		chrono:Main.Chrono.compressDb(main.chrono),
		killCount:Main.KillCount.compressDb(main.killCount),
		reputation:Main.Reputation.compressDb(main.reputation),
		contribution:Main.Contribution.compressDb(main.contribution),
		username:main.username,
		name:main.name,
		questActive:main.questActive,
	}
	if(!Main.getDbSchema()(tmp))
		ERROR(3,'invalid main schema',JSON.stringify(Main.getDbSchema().errors(tmp)),tmp);
	return tmp;
}

var schema;
Main.getDbSchema = function(){
	schema = schema || require('js-schema')({
		invList:Main.ItemList.getDbSchema(),
		bankList:Main.ItemList.getDbSchema(),
		chrono:Main.Chrono.getDbSchema(),
		killCount:Main.KillCount.getDbSchema(),
		reputation:Main.Reputation.getDbSchema(),
		contribution:Main.Contribution.getDbSchema(),
		username:String,
		name:String,
		questActive:String,
		'*':null
	});
	return schema;
}
Main.uncompressDb = function(main,key){
	if(!Main.getDbSchema()(main))
		return ERROR(3,'data not following schema',JSON.stringify(Main.getDbSchema().errors(main)),main);
	
	main.invList = Main.ItemList.uncompressDb(main.invList,key);
	main.bankList = Main.ItemList.uncompressDb(main.bankList,key);
	main.tradeList = Main.ItemList(key);
	
	main.killCount = Main.KillCount.uncompressDb(main.killCount);
	
	main.social = Main.Social.uncompressDb(main.social);	//main.social not saved anymore
	main.chrono = Main.Chrono.uncompressDb(main.chrono);
	main.questActive = Main.QuestActive.uncompressDb(main.questActive,main);
	main.contribution = Main.Contribution.uncompressDb(main.contribution);
	
    return Main.create(key,main);
}


})(); //{










