
"use strict";
(function(){ //}
var SideQuest, Achievement, Actor;
global.onReady(function(){
	SideQuest = rootRequire('shared','SideQuest'); Achievement = rootRequire('shared','Achievement'); Actor = rootRequire('shared','Actor');

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.toggleSQMarker,Command.MAIN,[ //{
		Command.Param('string','Id',false),
	],Main.SideQuest.toggleQuestMarker); //}
});
var Main = rootRequire('shared','Main');


var PREFIXQM = 'sidequest-';
var CAP = 10;

Main.SideQuest = function(dbData){	//verify global integrity
	dbData = dbData || {};
	
	var a = {};
	for(var i in SideQuest.DB){
		a[i] = dbData[i] || Main.SideQuest.Part();
	}
	return a;
	
}

Main.SideQuest.Part = function(complete,completeToday){
	return {
		complete:complete || 0,
		completeToday:completeToday || 0,
	}
}

Main.SideQuest.compressDb = function(ma,main,id){
	if(!ma.complete)
		return null;
	ma.username = main.username;
	ma.id = id;
	return ma;
}

Main.SideQuest.uncompressDb = function(ma){
	if(!SideQuest.get(ma.id,true)) 
		return null;
	delete ma.username;
	delete ma.id;
	return ma;
}

Main.haveCompletedSideQuest = function(main,id){
	return !!Main.SideQuest.getComplete(main,id)
}

Main.SideQuest.getComplete = function(main,id){
	if(!main.sideQuest[id])
		return ERROR(3,'invalid id',id);
	return main.sideQuest[id].complete;
}
Main.SideQuest.getCompleteToday = function(main,id){
	if(!main.sideQuest[id])
		return ERROR(3,'invalid id');
	return main.sideQuest[id].completeToday;
}

Main.SideQuest.getCompleteCount = function(main,repeat){
	var count = 0;
	for(var i in main.sideQuest)
		if(main.sideQuest[i].complete){
			if(repeat)
				count += Math.min(CAP,main.sideQuest[i].complete);
			else
				count++;
		}
			
	return count;
}

Main.SideQuest.onComplete = function(main,id){
	var ms = main.sideQuest[id];
	ms.complete++;
	ms.completeToday++;
	Main.setChange(main,'sideQuest,' + id,ms);
	var sq = SideQuest.get(id);
	Main.addMessage(main,'You have completed the side quest "' + sq.name + '". Open the chest for your reward.',true);
	Main.playSfx(main,'levelUp');
	
	Main.KillCount.reset(main,sq.zone,ms.completeToday);
	
	Achievement.onSideQuestComplete(main);
	Main.contribution.onSideQuestComplete(main,sq.name);
	
	var act = Main.getAct(main);
	Actor.addPreset(act,'onQuestReward');
	Actor.setTimeout(act,function(){
		Actor.removePreset(act,'onQuestReward');
		Actor.addPresetUntilMove(act,'onQuestReward',75);	//after teleport
	},25*2);
}

Main.SideQuest.toggleQuestMarker = function(main,id,newStatus){
	var sq = SideQuest.get(id);
	if(!sq)
		return Main.addMessage(main,'Invalid id');
	var act = Main.getAct(main);
	var qmid = PREFIXQM + id;
	var currentStatus = !!act.questMarker[qmid];
	newStatus = newStatus === undefined ? !currentStatus : newStatus;
	if(!currentStatus && newStatus)
		Actor.addQuestMarker(act,qmid,sq.questMarker);
	if(currentStatus && !newStatus)
		Actor.removeQuestMarker(act,qmid);
}

Main.SideQuest.getSideQuestMarkerList = function(main){
	var list = [];
	var act = Main.getAct(main);
	for(var i in act.questMarker){
		if(i.$contains(PREFIXQM,true))
			list.push(i.replace(PREFIXQM,''));
	}
	return list;
}

Main.SideQuest.resetCompleteToday = function(main){
	for(var i in main.sideQuest)
		main.sideQuest[i].completeToday = 0;	
}

Main.setSideQuestHint = function(main,sideQuestHint){
	if(JSON.stringify(main.sideQuestHint) === JSON.stringify(sideQuestHint))
		return;
	main.sideQuestHint = sideQuestHint;
	Main.setChange(main,'sideQuestHint',main.sideQuestHint);
}

Main.SideQuestHint = function(model,hint){
	return {model:model,hint:hint};
}



})(); //{











