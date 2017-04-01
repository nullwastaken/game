
"use strict";
(function(){ //}
var Actor, Server, Achievement, QuestVar, ActorGroup, Message, Drop, Pref;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Server = rootRequire('private','Server'); Achievement = rootRequire('shared','Achievement'); QuestVar = rootRequire('server','QuestVar'); ActorGroup = rootRequire('server','ActorGroup'); Message = rootRequire('shared','Message'); Drop = rootRequire('shared','Drop');
	Pref = rootRequire('client','Pref',true);
	
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.setLookingFor,Command.MAIN,[ //{
		Command.Param('string','Looking For',false),
		Command.Param('string','Comment',true),
	],Main.setLookingFor); //}

},null,SERVER ? '' : 'Main',['QueryDb','SideQuest'],function(pack){	
	Main.init(pack);
});
var Main = exports.Main = function(extra){
	this.dialogue = null;
	this.name = '';
	this.username = '';
	this.id = '';
	this.chrono = Main.Chrono();
	this.reputation = Main.Reputation();
	this.social = Main.Social();
	this.dailyTask = [];	//DailyTask[]
	this.questActive = '';	
	this.quest = Main.Quest();
	this.killCount = Main.KillCount();
	this.questHint = '';
	this.sideQuestHint = null;	//Main.SideQuestHint
	this.change = {};	//any
	this.changeOld = {};	//any
	this.flag = {};	//string:function():any
	this.invList = Main.ItemList();	//bad...cuz need init with key;
	this.bankList = Main.ItemList();
	this.tradeList = Main.ItemList();
	this.tradeInfo = Main.TradeInfo();
	this.contribution = Main.Contribution();
	this.achievement = Main.Achievement();
	this.sideQuest = Main.SideQuest();
	this.pref = Main.Pref();
	this.hudState = Main.HudState();
	this.question = {};	//Main.Question
	this.gem = 1;
	this.party = Main.Party();
	this.acceptPartyInvite = true;
	this.lastInvite = 0;
	this.lookingFor = Main.LookingFor();
	this.timestampQuestComplete = Date.now();//BAD for contribution;
	this.temp = {};	//any
	this.screenEffect = {}; //Main.ScreenEffect
	this.preventCameraMovement = false;
	Tk.fillExtra(this,extra);
};

Main.create = function(key,extra){
	var main = new Main(extra);
	main.id = key;
	return main;
}

Main.LIST = {}; //supposed to be only accesable by file starting with Main_

Main.init = function(pack){ //client
	w.main = Main.create('',{});
	Main.applyChange(w.main,pack.main);
	
	w.main.pref = Main.Pref(JSON.parse(localStorage.getItem('pref'),false));
	
	Main.question.init();	//Dialog...
	Main.quest.init();
	Main.screenEffect.init();
}

Main.TradeInfo = function(){
	return {
		otherId:'',
		data:{},
		acceptSelf:false,
		acceptOther:false
	};
}

Main.TradeInfo.compressClient = function(main){
	var main2 = Main.getTradingWith(main);
	if(!main2){
		Main.stopTrade(main);
		return main.tradeInfo;
	}
	return {
		otherId:main2.name,
		data:Main.ItemList.compressClient(main2.tradeList),
		acceptSelf:main.tradeInfo.acceptSelf,
		acceptOther:main.tradeInfo.acceptOther
	}
}

Main.onChange = Tk.newPubSub(true);

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
	Main.updateGEM(main);
	Main.social.onSignInOff(main,Main.social.IN);
	Main.updatePlayerOnline(main,Server.getPlayerInfo());
	Main.achievement.onSignIn(main);
	Main.updateCanStartQuest(main,false);
	Actor.addPresetUntilMove(Main.getAct(main),'onSignIn',75);
	
	
}

Main.updateGEM = function(main){
	Actor.updateGEM(Main.getAct(main));
}

Main.onSignOff = function(main){	//require act to be inited
	Main.social.onSignInOff(main,Main.social.OFF);
	Main.party.onSignOff(main);
	QuestVar.onSignOff(main);
}

Main.Pref = function(pref){
	return SERVER ? null : Pref.getDefaultValue(pref);
}

Main.getPref = function(main,id){
	if(!main.pref)	//aka main is not loaded yet...
		return 0;
	return main.pref[id];
}

Main.setPref = function(main,id,value){
	Pref.set(id,value);
}	

Main.getAct = function(main){
	return SERVER ? Actor.get(main.id) : w.player;
}

Main.setPreventCameraMovement = function(main,val){
	main.preventCameraMovement = val;
	Main.setChange(main,'preventCameraMovement',val);
}

//#############

Main.addMessage = function(main,msg,color){
	if(typeof msg === 'string'){
		if(color === true)
			color = CST.color.gold;
		if(color) 
			msg = '<span style="color:' + color + '">' + msg + '</span>';
		msg = Message.Game(msg,Message.SERVER);
	}
	Main.setTemp(main,'message',msg,true);
}

Main.addPopup = function(main,text){
	Message.addPopup(main.id,text);
}

Main.dropInv = function(main,id,amount){
	var amount = Math.min(1,Main.haveItem(main,id,0,'amount'));
	if(!amount) return false;
	
	var act = Main.getAct(main);
	Main.removeItem(main,id,amount);
	var spot = ActorGroup.alterSpot(Actor.toSpot(act),25);
	Drop.create(spot,id,amount,CST.VIEWED_IF.always,false);
	return true;
}

Main.destroyInv = function(main,id,amount){
	var amount = Math.min(1,Main.haveItem(main,id,0,'amount'));
	if(!amount) return false;
	
	Main.removeItem(main,id,amount);
	return true;
}

Main.isAdmin = function(main){
	return Server.isAdmin(main.id);
}

Main.HudState = function(){
	return {
		tab:0,
		inventory:0,
		'tab-equip':0,
		'tab-ability':0,
		'tab-quest':0,
		'tab-reputation':0,
		'tab-worldMap':0,
		'tab-highscore':0,
		'tab-friend':0,
		'tab-feedback':0,
		'tab-homeTele':0,
		'tab-setting':0,
		'tab-contribution':0,
		'tab-achievement':0,
		'tab-sideQuest':0,
		chat:0,
		bottomChatIcon:0,
		aboveInventory:0,
		mana:0,
		hp:0,
		party:0,
		clan:0,
		minimap:0,
		minimapName:0,
		abilityBar:0,
		curseClient:0,
		questHint:0,
		pvpLookingFor:0,
		playerOnline:0,
		fps:0,
	};
}
Main.hudState = {};
Main.hudState.set = function(main,what,value){
	if(main.hudState[what] !== value){
		main.hudState[what] = value;
		Main.setChange(main,'hudState',main.hudState);
	}
}
Main.hudState.NORMAL = 0;
Main.hudState.INVISIBLE = 1;
Main.hudState.FLASHING = 2;

Main.hudState.toggleAll = function(){	//for client ONLY
	for(var i in w.main.hudState)
		w.main.hudState[i] = +!w.main.hudState[i];
}

Main.hudState.applyHudState = function(name,html){	//client
	if(w.main.hudState[name] === Main.hudState.NORMAL) return html;
	else if(w.main.hudState[name] === Main.hudState.INVISIBLE) return '';
	else if(w.main.hudState[name] === Main.hudState.FLASHING){
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

Main.hudState.restore = function(main){
	for(var i in main.hudState)
		main.hudState[i] = Main.hudState.NORMAL;
	Main.setChange(main,'hudState',main.hudState);
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
	if(!lookingFor.category) 
		return '';
	if(!lookingFor.comment) 
		return lookingFor.category;
	return lookingFor.category + ': ' + lookingFor.comment;
}

Main.onLevelUp = function(main,lvl){
	Main.reputation.onLevelUp(main,lvl);
	Main.contribution.onLevelUp(main,lvl);
	Achievement.onLevelUp(main);
	Main.updateCanStartQuest(main);
	
	Main.addItem(main,'equipBox',1);
	Main.playSfx(main,'levelUp');
	var str = 'Level up! You are now level ' + lvl + '!<br>You received an Equip Box and a Reputation Point.<br>';
	str += 'Spend your point via ' + Message.funcToText('exports.Dialog.open(\'reputation\');',Message.iconToText('tab-reputation')) + '.';
	Main.addPopup(main,str);
	
	if(lvl === CST.CRAFT_MIN_LVL)
		Main.addPopup(main,'You have unlocked advanced crafting! Access it via the ' + Message.iconToText('tab-equip') + ' Equip Window.');
}

Main.error = function(main,str,popup){
	Main.playSfx(main,'error');
	if(popup)
		Main.addPopup(main,str);
	else
		Main.addMessage(main,str);
}


Main.setLookingFor = function(main,str,comment){
	main.lookingFor = Main.LookingFor(str,comment);
	Main.setChange(main,'lookingFor',main.lookingFor);
}


})(); //{











