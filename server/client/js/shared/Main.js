//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require2('Actor'), Server = require2('Server'), QuestVar = require2('QuestVar'), ActorGroup = require2('ActorGroup'), Message = require2('Message'), Drop = require2('Drop');
var Pref = require4('Pref');
var Main = exports.Main = {};
Main.create = function(key,extra){
	var main = {
		dialogue:null,
		name:'player000',		
		username:'player000',	
		id:key,
		chrono:Main.Chrono(),
		reputation:Main.Reputation(),
		social:Main.Social(),
		dailyTask:[],
		questActive:'',
		quest:Main.Quest(),
		killCount:Main.KillCount(),
		questHint:'',
		change:{},
		old:{},
		flag:Main.Flag(),
		invList:Main.ItemList(),	//bad... cuz need init with key
		bankList:Main.ItemList(),
		tradeList:Main.ItemList(),
		tradeInfo:Main.TradeInfo(),
		contribution:Main.Contribution(),
		achievement:Main.Achievement(),
		pref:Main.Pref(),
		hudState:Main.HudState(),
		currentTab:"inventory",
		question:null,
		party:Main.Party(),
		acceptPartyInvite:true,
		lookingFor:Main.LookingFor(),
		timestampQuestComplete:Date.now(),	//BAD for contribution
		//part of temp
		temp:{},
		questRating:'',	//name of quest
		sfx:'',
		song:'',
		questComplete:null,
		screenEffect:{},
	};
	for(var i in extra){
		if(main[i] === undefined) ERROR(4,'prop not in constructor',i);
		main[i] = extra[i];
	}
	
	return main;
}

Main.LIST = {}; //supposed to be only accesable by file starting with Main_

Main.TradeInfo = function(){
	return {
		otherId:'',
		data:{},
		acceptSelf:false,
		acceptOther:false
	};
}

Main.get = function(id){
	return Main.LIST[id] || null;
}

Main.addToList = function(main){
	Main.LIST[main.id] = main;
}

Main.removeFromList = function(id){
	delete Main.LIST[id]; 
}

Main.forEach = function(func){
	for(var i in Main.LIST)
		func(Main.get(i));
}

Main.onSignIn = function(main){	//require act to be inited
	Main.reputation.updatePt(main);
	Main.reputation.updateBoost(main);
	Main.social.onSignInOff(main,'in');
	Main.updatePlayerOnline(main,Server.getPlayerInfo());
	Main.achievement.onSignIn(main);
	Main.updateCanStartQuest(main,false);
}

Main.onSignOff = function(main){	//require act to be inited
	Main.social.onSignInOff(main,'off');
	Main.party.onSignOff(main);
	QuestVar.onSignOff(main);
}

Main.Pref = function(pref){
	return SERVER ? null : Pref.getDefaultValue(pref);
}

Main.getPref = function(main,id){
	return main.pref[id];
}

Main.getAct = function(main){
	return SERVER ? Actor.get(main.id) : player;
}

//#############

Main.addMessage = function(main,msg){
	if(typeof msg === 'string') 	
		msg = Message.Game(msg,Message.SERVER);
	main.temp.message = main.temp.message || [];
	main.temp.message.push(msg);
}

Main.addPopup = function(main,text){
	Message.addPopup(main.id,text);
}

Main.dropInv = function(main,id,amount){
	var amount = Math.min(1,Main.haveItem(main,id,0,'amount'));
	if(!amount) return false;
	
	var act = Main.getAct(main);
	Main.removeItem(main,id,amount);
	var spot = ActorGroup.alterSpot(Actor.Spot(act.x,act.y,act.map),25);
	Drop.create(spot,id,amount);
	return true;
}

Main.destroyInv = function(main,id,amount){
	var amount = Math.min(1,Main.haveItem(main,id,0,'amount'));
	if(!amount) return false;
	
	Main.removeItem(main,id,amount);
	return true;
}

Main.HudState = function(){
	return {
		tab:0,
		inventory:0,
		'tab-equip':0,
		'tab-ability':0,
		'tab-stat':0,
		'tab-quest':0,
		'tab-reputation':0,
		'tab-highscore':0,
		'tab-friend':0,
		'tab-feedback':0,
		'tab-homeTele':0,
		'tab-setting':0,
		'tab-contribution':0,
		'tab-achievement':0,
		chat:0,
		bottomChatIcon:0,
		aboveInventory:0,
		mana:0,
		hp:0,
		party:0,
		clan:0,
		minimap:0,	//impact hint and belowMinimap
		abilityBar:0,
		curseClient:0,
		questHint:0,
		pvpLookingFor:0,
	};
}
Main.hudState = {};
Main.hudState.set = function(main,what,value){
	if(main.hudState[what] !== value){
		main.hudState[what] = value;
		Main.setFlag(main,'hudState');
	}
}
Main.hudState.NORMAL = 0;
Main.hudState.INVISIBLE = 1;
Main.hudState.FLASHING = 2;

Main.hudState.toggleAll = function(){	//for client ONLY
	for(var i in main.hudState)
		main.hudState[i] = +!main.hudState[i];
}


Main.hudState.applyHudState = function(name,html){
	if(main.hudState[name] === Main.hudState.NORMAL) return html;
	else if(main.hudState[name] === Main.hudState.INVISIBLE) return '';
	else if(main.hudState[name] === Main.hudState.FLASHING){
		//if(Main.hudState.FLASHING_INTERVAL[name])	//prevent interval to stack up
		//	return html;
		
		Main.hudState.BOOL[name] = true;
		Main.hudState.HTML[name] = html;
		Main.hudState.BORDER[name] = html.css('border');
		Main.hudState.FLASHING_INTERVAL[name] = setInterval(function() {
			Main.hudState.BOOL[name] = !Main.hudState.BOOL[name];
			if(Main.hudState.BOOL[name])
				html.css({border:'2px solid white'});
			else html.css({border:'2px solid black'});
		},1000);
		return html;
	} 
	return html;	//shouldnt happen
}	
Main.hudState.FLASHING_INTERVAL = {};
Main.hudState.BOOL = {};
Main.hudState.BORDER = {};
Main.hudState.HTML = {};
Main.hudState.clearInterval = function(list){
	for(var i in Main.hudState.FLASHING_INTERVAL){
		if(Main.hudState.FLASHING_INTERVAL[i] && list.$contains(i)){
			delete Main.hudState.FLASHING_INTERVAL[i];
			clearInterval(Main.hudState.FLASHING_INTERVAL[i]);
			if(Main.hudState.HTML[i])
				Main.hudState.HTML[i].css({border:Main.hudState.BORDER[i]});
		}
	}
	
}	

Main.LookingFor = function(category,comment){
	return {
		category:category || '',
		comment:comment || '',
	}
}


Main.LookingFor.toString = function(lookingFor){
	if(!lookingFor.category) return '';
	if(!lookingFor.comment) return lookingFor.category;
	return lookingFor.category + ': ' + lookingFor.comment;
}

})(); //{











