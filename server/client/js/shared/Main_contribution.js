
"use strict";
(function(){ //}
var Message, OfflineAction, Actor, SpriteModel;
global.onReady(function(initPack){
	Message = rootRequire('shared','Message'); OfflineAction = rootRequire('server','OfflineAction'); Actor = rootRequire('shared','Actor'); SpriteModel = rootRequire('shared','SpriteModel');
	db = initPack.db;
	
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.contributionPurchase,Command.MAIN,[ //{
		Command.Param('string','Type',false),
		Command.Param('string','Param',true),
	],Main.contribution.purchase); //}

	Command.create(CST.COMMAND.contributionSelect,Command.MAIN,[ //{
		Command.Param('string','Type',false),
	],Main.contribution.setActive); //}

	Command.create(CST.COMMAND.contributionReset,Command.MAIN,[ //{
		Command.Param('string','Type',false),
	],Main.contribution.resetReward); //}


	
},{db:['contributionHistory']});
var Main = rootRequire('shared','Main');


var db;

var chat = function(main,text,scroll){
	Message.add(main.id,Message.Contribution(text,scroll));
}

Main.Contribution = function(cont){
	var a = {
		pt:0,
		ptTotal:0,
		timestampQuestComplete:Date.now(),
		unlocked:{
			chatColorYellow:true,
			chatColorPink:false,
			chatColorCrimson:false,
			chatColorCyan:false,
			chatColorOrange:false,
			chatColorGreen:false,
			chatColorRainbow:false,
			
			bulletPony:false,
			bulletCannon:false,
			bulletPenguin:false,
			bulletHappyface:false,
		},
		active:{
			chatColor:'chatColorYellow',
			chatSymbol:'chatSymbolNone',
			bulletFireball:'',
			bulletIceshard:'',
			bulletLightningball:'',
			bulletArrow:'',
			playerSprite:'',
			broadcastAchievement:0,
		}
	}
	for(var i in cont)
		a[i] = cont[i];
	return a;
}
Main.Contribution.compressDb = function(contribution){
	if(contribution.ptTotal === 0)
		return null;
	return contribution;		
}
Main.Contribution.uncompressDb = function(contribution){
	return Main.Contribution(contribution);		
}


Main.Contribution.getDbSchema = function(){
	return [{},null];	//TODO...
}


Main.contribution = {};
Main.contribution.getChat = function(main){
	
}
Main.contribution.getBullet = function(main,originalSkin){
	var active = main.contribution.active;
	if(originalSkin === 'fireball'){
		if(active.bulletFireball === 'bulletPony')	return 'bullet-pony';
	}
	else if(originalSkin === 'iceshard'){
		if(active.bulletIceshard === 'bulletPenguin')	return 'bullet-penguin';
	}
	else if(originalSkin === 'lightningball'){
		if(active.bulletLightningball === 'bulletHappyface')	return 'bullet-happyface';
	}
	else if(originalSkin === 'arrow'){
		if(active.bulletArrow === 'bulletCannon')	return 'bullet-cannon';
	}
	return originalSkin;
}

var COST = {
	chatColorYellow:0,
	chatColorOrange:10,
	chatColorGreen:20,
	chatColorPink:50,
	chatColorCyan:80,
	chatColorCrimson:100,
	
	chatSymbolNone:0,
	chatSymbolBronze:10,
	chatSymbolSilver:100,
	chatSymbolGold:1000,
	chatSymbolDiamond:10000,	
	
	broadcastAchievement:1,
	
	bulletHappyface:100,
	bulletPenguin:150,
	bulletCannon:200,
	bulletPony:250,
			
	playerSprite:50,
};

var COLOR_CHART = {
	chatColorYellow:'yellow',
	chatColorOrange:'orange',
	chatColorGreen:'#55FF55',
	chatColorPink:'pink',
	chatColorCyan:'cyan',
	chatColorCrimson:'#FF5555',
};

var SYMBOL_CHART = {
	chatSymbolNone:'',
	chatSymbolAdmin:'<span title="Developper" style="color:#EEEEEE;">★</span>',
	chatSymbolBronze:'<span title="Bronze Contributor" style="color:#CD7F32;">★</span>',
	chatSymbolSilver:'<span title="Silver Contributor" style="color:#C0C0C0;">★</span>',
	chatSymbolGold:'<span title="Gold Contributor" style="color:#FFD700;">★</span>',
	chatSymbolDiamond:'<span title="Diamond Contributor" style="color:#EEEEEE;">★</span>'
};

Main.contribution.getCost = function(rewardId){
	return COST[rewardId] || ERROR(4,'invalid rewardId',rewardId);
}

Main.contribution.addHistory = function(main,category,type,pt,details){
	if(!['purchase','contribution'].$contains(category)) ERROR(3,'invalid category',category);
	
	if(category === 'purchase' && !COST[type]) ERROR(3,'invalid type',type);
	if(category === 'contribution' && ![
		'quest','other','twitch','reddit','twitter','youtube','questComplete','questFeedback',
	].$contains(type)) ERROR(3,'invalid type',type);
	
	db.contributionHistory.insert({
		username:main.username,
		timestamp:Date.now(),
		category:category,
		type:type,
		details:details || '',
		pt:pt || 0,
	});
}

Main.contribution.getPlayerSprite = function(main){
	return main.contribution.active.playerSprite;
}

Main.contribution.purchase = function(main,what,param){
	var c = main.contribution;
	var pt = c.pt;
	var cost = Main.contribution.getCost(what);
	if(!cost) return chat(main,"Invalid option: " + what,true);
	if(pt < cost) return chat(main,'You need more Contribution points to get that reward.',true);
	
	if(what === 'broadcastAchievement'){
		param = +param;
		var amount = Math.min(param,Math.floor(pt/cost));
		var totalCost = cost * amount;
		c.pt -= totalCost;
		
		c.active.broadcastAchievement += param;
		chat(main,'Transaction successfully completed.');
	}
	else if(what === 'playerSprite'){
		var list = param.split(';');
		for(var i = list.length-1 ; i >= 0; i--) 
			if(list[i] === '' || list[i] === 'NONE') 
				list.splice(i,1);
		if(list.length > 8) return chat(main,'Too many layers.',true);
		if(list.length === 0) return chat(main,'You need at least one layer.',true);
		
		for(var i in list) 
			if(!SpriteModel.isPlayerSprite(list[i])) 
				return chat(main,'Invalid sprite: ' + list[i] + '.',true);
		param = list.toString();
		
		c.pt -= cost;
		Main.contribution.addHistory(main,'purchase',what,-cost,param);
		c.active.playerSprite = param;		
		Actor.refreshNormalSprite(Main.getAct(main));
		chat(main,'Transaction successfully completed.');
	}
	
	else {	//chatColor, chatSymbol
		if(c.unlocked[what])
			return chat(main,'You have already unlocked this reward.',true);
		c.unlocked[what] = true;
		c.pt -= cost;
		Main.contribution.addHistory(main,'purchase',what,-cost);
		
		Main.contribution.setActive(main,what);
		
		chat(main,'Transaction successfully completed.');
	}
	
	Main.setChange(main,'contribution',main.contribution);
}

Main.contribution.setActive = function(main,what){
	var a = main.contribution.active;
	
	if(what.$contains('chatSymbol')){
		var cost = COST[what];
		if(cost === undefined) return;
		if(cost > main.contribution.ptTotal)
			return chat(main,'You have not unlocked that reward yet.',true);
		a.chatSymbol = what;
		Main.setChange(main,'contribution',main.contribution);
		return;
	}
	
	if(!main.contribution.unlocked[what])
		return chat(main,'You have not unlocked that reward yet.',true);
	if(what.$contains('chatColor'))
		a.chatColor = what;
	else if(what === 'bulletHappyface')
		a.bulletLightningball = what;
	else if(what === 'bulletPenguin')
		a.bulletIceshard = what;
	else if(what === 'bulletCannon')
		a.bulletArrow = what;
	else if(what === 'bulletPony')
		a.bulletFireball = what;
	else
		return ERROR(4,'cant active rewardId',what);
	Main.setChange(main,'contribution',main.contribution);
}

Main.contribution.addPt = function(main,pt,type,comment,displayMessage){
	if(isNaN(pt)) 
		return ERROR(3,'invalid pt',pt);
	
	main.contribution.pt += pt;
	main.contribution.ptTotal += pt;
	Main.contribution.addHistory(main,'contribution',type,pt,comment);
	if(displayMessage !== false){
		Message.add(main.id,'You just gained ' + pt + ' contribution points. ' + comment);
		Message.addPopup(main.id,'You just gained ' + pt + ' contribution points.<br>' 
			+ comment + '<br><br>'
			+ 'Check the cool rewards via ' + Message.funcToText('exports.Dialog.open(\'contribution\');',Message.iconToText('tab-contribution')) + '.'
		);
	}
	Main.setChange(main,'contribution',main.contribution);
}

Main.contribution.addPtOffline = function(username,pt,type,comment){
	OfflineAction.create(username,'addCP',OfflineAction.Data.addCP(pt,type,comment));
}

Main.contribution.getChat = function(main){
	return {
		symbol:SYMBOL_CHART[main.contribution.active.chatSymbol] || '',
		color:COLOR_CHART[main.contribution.active.chatColor] || 'yellow',
	}
}

Main.contribution.onLevelUp = function(main,lvl){
	if(main.contribution.active.broadcastAchievement <= 0) 
		return;
	main.contribution.active.broadcastAchievement--;
	Message.broadcast(main.name + ' is now Level ' + lvl + '.');
	Main.setChange(main,'contribution',main.contribution);
}

Main.contribution.onQuestComplete = function(main,qname,chalSuccess){	//return true if gave CP
	if(main.contribution.active.broadcastAchievement <= 0) 
		return;
	main.contribution.active.broadcastAchievement--;
	if(chalSuccess && chalSuccess.success)
		Message.broadcast(main.name + ' just completed the quest ' + qname + ' with the challenge ' + chalSuccess.name + '.');
	else
		Message.broadcast(main.name + ' just completed the quest ' + qname + '.');
		
	Main.setChange(main,'contribution',main.contribution);
	
	//add pts
	if(Date.now() - main.timestampQuestComplete > CST.MIN * 10){
		main.timestampQuestComplete = Date.now();
		Main.contribution.addPt(main,1,'questComplete','Quest Complete',false);
		return true;
	}
	return false;
}

Main.contribution.onAchievementComplete = function(main,name){
	if(main.contribution.active.broadcastAchievement <= 0) 
		return;
	main.contribution.active.broadcastAchievement--;
	Message.broadcast(main.name + ' has completed the achievement "' + name + '".');
	Main.setChange(main,'contribution',main.contribution);
}

Main.contribution.onSideQuestComplete = function(main,name){
	if(main.contribution.active.broadcastAchievement <= 0) 
		return;
	main.contribution.active.broadcastAchievement--;
	Message.broadcast(main.name + ' has completed the side quest "' + name + '".');
	Main.setChange(main,'contribution',main.contribution);
}

Main.contribution.resetReward = function(main,type){
	if(type === 'bulletFireball')	main.contribution.active.bulletFireball = '';
	else if(type === 'bulletLightningball')	main.contribution.active.bulletLightningball = '';
	else if(type === 'bulletIceshard')	main.contribution.active.bulletIceshard = '';
	else if(type === 'bulletArrow')	main.contribution.active.bulletArrow = '';
	else if(type === 'playerSprite'){
		main.contribution.active.playerSprite = '';
		Actor.refreshNormalSprite(Main.getAct(main));
	}
	Main.setChange(main,'contribution',main.contribution);
}



Main.contribution.getPoint = function(main,what){
	if(what === 'overall')
		return main.contribution.ptTotal;
	ERROR(3,'not supported yet...');
	return 0;
	
}



})(); //{
/*

Contribution.change = function(key,account,name){
	var main = Main.get(key);
	var p = main.contribution.point;
	if(!p[account]) return;
	p[account].username = name;
	Main.setChange(main,'contribution',main.contribution);
	chat(key,"You have successfully linked your GAME_NAME account with the " + account.$capitalize() + " account \"" + name + '\".');
}

Contribution.updateSocialMedia = function(key,account){
	var p = Main.get(key).contribution.point;
	var now = Date.now();
	if(account === 'youtube'){
		if(!p.youtube.username) return chat(key,'Link your GAME_NAME account with your Youtube account first by typing your Youtube name and pressing the button "Change Name"');
		var diff = CST.DAY/4 - (now - p.youtube.lastUpdate);
		if(diff > 0) return chat(key,'You will be able to update your Youtube CP in ' + (diff/CST.HOUR).r(2) + ' hour(s).');
		p.youtube.lastUpdate = now;
		Main.setChange(Main.get(key),'contribution',Main.get(key).contribution);
		Contribution.updateSocialMedia.youtube(key,p.youtube);
	}
	if(account === 'reddit'){
		if(!p.youtube.username) return chat(key,'Link your GAME_NAME account with your Youtube account first by typing your Youtube name and pressing the button "Change Name"');
		var diff = CST.DAY/4 - (now - p.reddit.lastUpdate);
		if(diff > 0) return chat(key,'You will be able to update your Reddit CP in ' + (diff/CST.HOUR).r(2) + ' hour(s).');
		p.reddit.lastUpdate = now;
		Main.setChange(Main.get(key),'contribution',Main.get(key).contribution);
		Contribution.updateSocialMedia.reddit(key,p.reddit);
	}
	if(account === 'twitch'){
		if(!p.twitch.username) return chat(key,'Link your GAME_NAME account with your Twitch account first by typing your Twitch name and pressing the button "Change Name"');
		var diff = CST.HOUR - (now - p.twitch.lastUpdate);
		if(diff > 0) return chat(key,'You will be able to update your Twitch again in ' + (diff/CST.MIN).r(2) + ' minute(s).');
		p.twitch.lastUpdate = now;
		Main.setChange(Main.get(key),'contribution',Main.get(key).contribution);
		Contribution.updateSocialMedia.twitch(key,p.twitch);
	}
	if(account === 'twitter'){
		if(!p.twitter.username) return chat(key,'Link your GAME_NAME account with your Twitter account first by typing your Twitter name and pressing the button "Change Name"');
		var diff = CST.DAY - (now - p.twitter.lastUpdate);
		if(diff > 0) return chat(key,'You will be able to update your Twitter again in ' + (diff/CST.MIN).r(2) + ' hour(s).');
		p.twitter.lastUpdate = now;
		Main.setChange(Main.get(key),'contribution',Main.get(key).contribution);
		Contribution.updateSocialMedia.twitter(key,p.twitter);
	}
	return chat(key,'Invalid');
	
	
}

Contribution.updateSocialMedia.youtube = function(key,info,cb){
	db.youtube.getListFromUser(info.username,function(list){
		if(list.length !== 0) info.history = list;
		db.youtube.getSumViewViaList(list,function(count){
			info.point = Math.round(count/10);	
			if(cb) cb(key);			
		});	
	});
}

Contribution.updateSocialMedia.reddit = function(key,info,cb){
	//ts("m.contribution.point.reddit.lastUpdate = -1")
	db.reddit.getListFromUser(info.username,function(list){
		for(var i in list){
			var bool = true;
			for(var j in info.history) if(info.history[j].id === list.id) bool = false;
			if(bool) info.history.push(list[i]);
		}
		
		db.reddit.getUpsSumViaList(info.history,function(count){
			info.point = Math.round(count/1);	
			if(cb) cb(key);			
		});	
	});
}

Contribution.updateSocialMedia.twitch = function(key,info,cb){
	db.twitch.getViewerFromUser(info.username,function(count){
		info.history.push({date:Date.now(),viewers:count});
		info.point += Math.round(count/1);	
		if(cb) cb(key);			
	});
}

Contribution.updateSocialMedia.twitter = function(key,info,cb){
	db.twitter.getListFromUser(info.username,function(list){
		for(var i in list){
			var bool = true;
			for(var j in info.history) if(info.history[j].id === list.id) bool = false;
			if(bool) info.history.push(list[i]);
		}
		info.point += info.history.length;	
		if(cb) cb(key);			
	});
}


Contribution.change = function(account,name){
	Command.execute(CST.COMM AND.reward,change,[account,name]);
}
Contribution.updateSocialMedia = function(account){
	Command.execute(CST.COM MAND.reward,updateSocialMedia,[account]);	
}

*/
