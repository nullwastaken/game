
"use strict";
(function(){ //}
//if abuser, set achievement req to be at least lvl 5
var Actor, IconModel, Main, ItemModel, Equip, Material, ItemList, Quest, Message, Ability, MapModel;
global.onReady(function(){
	MapModel = rootRequire('server','MapModel'); Actor = rootRequire('shared','Actor'); IconModel = rootRequire('shared','IconModel'); Main = rootRequire('shared','Main'); ItemModel = rootRequire('shared','ItemModel'); Equip = rootRequire('server','Equip'); Material = rootRequire('server','Material'); ItemList = rootRequire('shared','ItemList'); Quest = rootRequire('server','Quest'); Message = rootRequire('shared','Message'); Ability = rootRequire('server','Ability');
},null,'Achievement',SERVER ? ['Quest'] : ['QueryDb'],function(){
	Achievement.init();
});
var Achievement = exports.Achievement = function(extra){
	this.id = '';
	this.name = '';
	this.displayIndex = 0;
	this.description = '';
	this.variable = {};
	this.onAction = function(main){ return true; };
	this.getProgressText = function(main,variable){ return ''};
	this.testOn = [];	//string[] VALID_ONTEST
	this.reward = Achievement.Reward();
	this.preReq = [];	//string[] Achievement.id
	Tk.fillExtra(this,extra);
};

var VALID_ONTEST = ['onBeeTransform','onSideQuestComplete','onSquirrelSpawn','onSignIn','onActorKilled','onDialogue','onSalvage','onEquipUpgrade','onShopBuy','onTrade','onCompetitionEntry','onEquipChange','onQuestComplete','onLevelUp','onTeleport','onDeath','onItemAdd','onHarvest','onReputationChange'];
var INDEX = 0;
Achievement.create = function(id,name,description,variable,onAction,getProgressText,testOn,reward,preReq){
	if(typeof preReq === 'string')
		return ERROR(2,'preReq must be array',preReq);
	var a = new Achievement({
		id:id,
		name:name,
		displayIndex:INDEX++,
		description:description || name,
		variable:variable,	//default values
		onAction:onAction,	//f(main) => bool success
		getProgressText:getProgressText,	//f(main,variable) => string
		testOn:testOn,
		reward:reward,
		preReq:preReq,
	});
	for(var i = 0 ; i < testOn.length; i++){
		if(!VALID_ONTEST.$contains(testOn[i]))
			ERROR(3,'invalid onTest',testOn[i]);
		else
			QUICK_DB[testOn[i]].push(a);
	}
	
	if(DB[id])
		return ERROR(3,'achiv id already taken',id);
	DB[id] = a;
	
	return a;
}
var DB = Achievement.DB = {};
var QUICK_DB = {};

Achievement.get = function(id){
	return DB[id] || null;
}

var onTest = function(main,what,extraParam,extraParam1){
	var list = QUICK_DB[what];
	for(var i = 0 ; i < list.length; i++){
		Achievement.update(main,list[i],extraParam,extraParam1);
	}
}

Achievement.update = function(main,a,extraParam,extraParam1){
	if(!a)
		return ERROR(3,'invalid achievement');
	var ma = main.achievement[a.id];
	if(!ma)
		return ERROR(3,'achievement id not in main',a.id);
	if(ma.complete)
		return;
	var good = a.onAction(main,ma.variable,extraParam,extraParam1);
	if(good){
		Main.achievement.onAchievementComplete(main,a);
		a.reward.onComplete(main.id,a);
	}
	var text = a.getProgressText(main,ma.variable);
	if(ma.progressText !== text){
		ma.progressText = text;
		Main.setChange(main,'achievement,' + a.id,ma);
	}
}

Achievement.update.progressText = function(main,a){
	if(!a)
		return ERROR(3,'invalid achievement');
	var ma = main.achievement[a.id];
	if(!ma)
		return ERROR(3,'achievement id not in main',a.id);
	if(ma.complete)
		return;
		
	var text = a.getProgressText(main,ma.variable);
	if(ma.progressText !== text){
		ma.progressText = text;
		Main.setChange(main,'achievement,' + a.id,ma);
	}
}

Achievement.getDefaultVariable = function(){
	var a = {};
	for(var i in DB){
		a[i] = Tk.deepClone(DB[i].variable);	
	}
	return a;
}
Achievement.on = function(main,what){
	onTest(main,what);
}
Achievement.onLevelUp = function(main){
	onTest(main,'onLevelUp');
}
Achievement.onQuestComplete = function(main,quest,size){
	onTest(main,'onQuestComplete',quest,size);
}
Achievement.onActorKilled = function(main,actorKilled){
	onTest(main,'onActorKilled',actorKilled);
}
Achievement.onTeleport = function(main,spot){	//unused
	onTest(main,'onTeleport',spot);
}
Achievement.onItemAdd = function(main,item,amount){
	onTest(main,'onItemAdd',item,amount);
}
Achievement.onReputationChange = function(main){
	onTest(main,'onReputationChange');
}
Achievement.onShopBuy = function(main){
	onTest(main,'onShopBuy');
}
Achievement.onHarvest = function(main,type){
	onTest(main,'onHarvest',type);
}
Achievement.onTrade = function(main){
	onTest(main,'onTrade');
}
Achievement.onCompetitionEntry = function(main,rank){
	onTest(main,'onCompetitionEntry',rank);
}
Achievement.onEquipChange = function(main,eid){
	onTest(main,'onEquipChange',eid);
}
Achievement.onBeeTransform = function(main){
	onTest(main,'onBeeTransform');
}
Achievement.onDeath = function(main){
	onTest(main,'onDeath');
}
Achievement.onSquirrelSpawn = function(main){
	onTest(main,'onSquirrelSpawn');
}
Achievement.onSignIn = function(main,timePlayedTotal){
	onTest(main,'onSignIn',timePlayedTotal);
}
Achievement.onEquipUpgrade = function(main,eid){
	onTest(main,'onEquipUpgrade',eid);
}
Achievement.onSalvage = function(main,eid){
	onTest(main,'onSalvage',eid);
}
Achievement.onDialogue = function(main,qid,npcId,nodeId){
	onTest(main,'onDialogue',qid,npcId,nodeId);
}

Achievement.onSideQuestComplete = function(main){
	onTest(main,'onSideQuestComplete');
}

Achievement.Reward = function(text,onComplete){
	return {
		text:text || '',
		onComplete:onComplete || CST.func,
	}
}
Achievement.getRewardText = function(achievement){
	return achievement.reward.text;
}

Achievement.Reward.ability = function(abilityId,name,icon,description){
	if(SERVER && !Ability.get(abilityId))
		return ERROR(3,'invalid abilityId',abilityId);
	return Achievement.Reward(
		IconModel.toText(icon,null,description) + ' <strong title="' + description + '"> ' + name + '</strong>',
		function(key,achievement){
			onCompleteHelper(achievement,key,null,null,abilityId);
		}
	)
}
Achievement.Reward.item = function(itemList,name,description){
	if(SERVER)
		for(var i in itemList)
			if(!ItemModel.get(i))
				return ERROR(3,'invalid itemId',i);
		
	
	return Achievement.Reward(
		textHelper(name || 'Items',description || ''),
		function(key,achievement){
			onCompleteHelper(achievement,key,null,itemList,null);
		}
	)
}
Achievement.Reward.exp = function(exp){
	return Achievement.Reward(
		Tk.formatNum(exp) + ' Exp',
		function(key,achievement){
			onCompleteHelper(achievement,key,exp,null,null);
		}
	)
}

var onCompleteHelper = function(achievement,key,exp,item,ability){
	var str = 'Achievement "' + achievement.name + '" complete!<br>';
	
	if(exp){
		Actor.addExp(Actor.get(key),exp,false);
		str += 'You have gained ' + Tk.formatNum(exp) + ' exp.<br>';
	}
	if(item){
		Main.addItem(Main.get(key),item);
		str += 'You have received the items: ' + ItemList.stringify(item) + '.<br>';
	}
	if(ability){
		Actor.addAbility(Actor.get(key),ability);
		str += 'You have unlocked the ability ' + Message.iconToText(Ability.get(ability).icon) + ' ' 
			+ Message.generateTextLink("exports.Dialog.open(\'ability\');",Ability.get(ability).name)
			+ '.<br>';
		
	}
	Message.addPopup(key,str);
}

var textHelper = function(name,title){
	return '<span title="' + title + '">' + name + '</span>';
}

/*

goal of achievement:
	motivate ppl to complete quest, lvlup, get material ,explore game


DONE

#####
//onBeeTransform,onDeath,onSquirrelSpawn,onSignIn,onActorKilled,onDialogue,onSalvage,onEquipUpgrade


top 15 highscore

puzzle master: compelte puzzlebridge and puzzleswitch back to back all lvl

bullet heaven naked



*/

Achievement.init = function(){ //after ItemModel and Ability
	for(var i = 0 ; i < VALID_ONTEST.length; i++)
		QUICK_DB[VALID_ONTEST[i]] = [];
	
	// Lvl-based
	Achievement.create('lvl1','Reach Level 1',null,{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 1;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/1";		
	},['onLevelUp'],Achievement.Reward.ability(
		'Qsystem-player-magicBullet','Arcane Bullet','attackMagic-ball','Shoot Arcane bullets that can drain mana.'
	));
	Achievement.create('lvl5','Reach Level 5',null,{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 5;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/5";
	},['onLevelUp'],Achievement.Reward.ability(
		'Qsystem-player-fireBullet','Fire Ball','attackMagic-meteor','Shoot a single fireball that explodes upon hit.'
	),['lvl1']);
	Achievement.create('lvl10','Reach Level 10',null,{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 10;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/10";		
	},['onLevelUp'],Achievement.Reward.ability(
		'Qsystem-player-coldBullet','Ice Shards','attackMagic-crystal','Shoot multiple ice shards.'
	),['lvl5']);
	Achievement.create('lvl15','Reach Level 15',null,{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 15;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/15";		
	},['onLevelUp'],Achievement.Reward.ability(
		'Qsystem-player-boomerang','Boomerang','weapon-boomerang','Shoot a boomerang that comes back that you.'
	),['lvl10']);
	
	Achievement.create('lvl20','Reach Level 20',null,{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 20;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/20";		
	},['onLevelUp'],Achievement.Reward.ability(
		'Qsystem-player-magicBomb','Arcane Explosion','attackMagic-ball','Explosive spell that can leech life.'
	),['lvl15']);
	
	Achievement.create('lvl25','Reach Level 25',null,{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 25;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/25";		
	},['onLevelUp'],Achievement.Reward.ability(
		'Qsystem-player-lightningBomb-range','Electric Arrow Whirlwind','attackMagic-static','Create an electric explosion which also shoots lightning arrows in all directions.'
	),['lvl20']);
	
	
	
	// Quest-based
	var MAX_QUEST_COMPLETE;
	var getMaxQuestComplete = function(main){
		if(MAX_QUEST_COMPLETE)
			return MAX_QUEST_COMPLETE;
		var count = 0;
		for(var i in main.quest)
			if(Quest.get(i).completable && i !== CST.QTUTORIAL)
				count++;
		MAX_QUEST_COMPLETE = count;
		return count;
	}
	
	Achievement.create('questComplete1','Complete 1 quest',null,{},function(main){
		return Main.getCompletedQuestCount(main) >= 1;	//-1 for tutorial
	},function(main){
		return Main.getCompletedQuestCount(main) + '/1';		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-coldBullet-melee','Chilling Weapon Throw','attackMagic-crystal','Throw chilling weapons at your enemies.'
	));
	
	
	
	
	
	Achievement.create('questComplete5','Complete 5 quests',null,{},function(main){
		return Main.getCompletedQuestCount(main) >= 5;
	},function(main){
		return Main.getCompletedQuestCount(main) + '/5';		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-lightningBullet','Lightning Bullet','attackMagic-static','Shoot lightning balls at the speed of light.'
	),['questComplete1']);
	Achievement.create('questComplete10','Complete 10 quests',null,{},function(main){
		return Main.getCompletedQuestCount(main) >= 10;
	},function(main){
		return Main.getCompletedQuestCount(main) + '/10';		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-lightningBomb','Lightning Explosion','attackMagic-static','Explodes in all directions, piercing through enemies.'
	),['questComplete5']);
	
	Achievement.create('questCompleteAll','Complete all quests',null,{},function(main){
		return Main.getCompletedQuestCount(main) >= getMaxQuestComplete(main);
	},function(main){
		return Main.getCompletedQuestCount(main) + '/' + getMaxQuestComplete(main);		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-lightningBullet-melee','Electric Weapon Throw','attackMagic-static','Throw an electric weapon at your enemies.'
	),['questComplete10']);
	
	var getMaxScoreCount = function(main){
		var count = 0;
		for(var i in main.quest){
			if(i === CST.QTUTORIAL)
				continue;
			if(main.quest[i].rewardScore >= 10000)
				count++;
		}
		return count;
	}
	Achievement.create('questMaxScore1','Get 10,000 score in 1 quest',null,{},function(main,v,qid){
		if(qid === CST.QTUTORIAL)
			return false;
		return main.quest[qid].rewardScore >= 10000;
	},function(main){
		return;		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-fireBomb','Fire Explosion','attackMagic-fire','Explodes in all directions, piercing through enemies.'
	));
	
	Achievement.create('questMaxScore5','Get 10,000 score in 5 quests',null,{},function(main,v,qid){
		if(main.quest[qid].rewardScore < 10000)
			return false;
		return getMaxScoreCount(main) >= 5;
	},function(main){
		return getMaxScoreCount(main) + "/5";
	},['onQuestComplete'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":1,
	},"Reroll Orb"),['questMaxScore1']);
	
	Achievement.create('questMaxScore10','Get 10,000 score in 10 quests',null,{},function(main,v,qid){
		if(main.quest[qid].rewardScore < 10000)
			return false;
		return getMaxScoreCount(main) >= 10;
	},function(main){
		return getMaxScoreCount(main) + "/10";
	},['onQuestComplete'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":1,
	},"Reroll Orb"),['questMaxScore5']);
	
	
	Achievement.create('gem125','Reach GEM x1.25',null,{},function(main){
		return Actor.getGEM(Main.getAct(main)) >= 1.25;
	},function(main){
		return Tk.round(Actor.getGEM(Main.getAct(main)),2) + '/1.25';		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-lightningBomb-melee','Lightning Boom','attackMagic-fire','Create an electric explosion which also throws lightning weapons in all directions.'
	));
	
	
	
	
	
	Achievement.create('gem150','Reach GEM x1.5',null,{},function(main){
		return Actor.getGEM(Main.getAct(main)) >= 1.5;
	},function(main){
		return Tk.round(Actor.getGEM(Main.getAct(main)),2) + '/1.5';		
	},['onQuestComplete'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":1,
	},'Reroll Orb'),['gem125']);
	
	Achievement.create('gem200','Reach GEM x2',null,{},function(main){
		return Actor.getGEM(Main.getAct(main)) >= 2;
	},function(main){
		return Tk.round(Actor.getGEM(Main.getAct(main)),2) + '/2';		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-coldBullet-range','Chilling Arrows','attackMagic-crystal','Shoot 2 ice arrows.'
	),['gem150']);
	
	Achievement.create('gem300','Reach GEM x3',null,{},function(main){
		return Actor.getGEM(Main.getAct(main)) >= 3;
	},function(main){
		return Tk.round(Actor.getGEM(Main.getAct(main)),2) + '/3';		
	},['onQuestComplete'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":3,
	},'Reroll Orbs'),['gem200']);
	
	Achievement.create('challengeAll3','Complete all challenges for a quest.',null,{},function(main,v,qid){
		var mq = main.quest[qid];
		var count = 0;
		for(var i in mq.challengeDone)
			if(mq.challengeDone[i])
				count++;
		return count >= 3;
	},function(main){
		return getChallengeComplete(main) + '/' + getMaxChallengeComplete(main);		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-healCost','Expensive Regen','heal-plus','Mana-expensive but great healing.'
	));
	
	// Challenge-based
	var getChallengeComplete = function(main){
		var count = 0;
		for(var i in main.quest)
			for(var j in main.quest[i].challengeDone)
				if(main.quest[i].challengeDone[j])
					count++;
		return count;
	}
	var MAX_CHALLENGE_COMPLETE;
	var getMaxChallengeComplete = function(main){
		if(MAX_CHALLENGE_COMPLETE)
			return MAX_CHALLENGE_COMPLETE;
		var count = 0;
		for(var i in main.quest){
			var j;
			for(j in main.quest[i].challengeDone)
				count++;
		}
		MAX_CHALLENGE_COMPLETE = count;
		return count;
	};
	
	Achievement.create('challengeComplete1','Complete 1 Challenge',null,{},function(main){
		return getChallengeComplete(main) >= 1;
	},function(main){
		return getChallengeComplete(main) + '/1';		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-healFast','Fast Regen','heal-plus','Faster but less powerful healing.'
	));
	
	Achievement.create('challengeComplete5','Complete 5 Challenges',null,{},function(main){
		return getChallengeComplete(main) >= 5;
	},function(main){
		return getChallengeComplete(main) + '/5';		
	},['onQuestComplete'],Achievement.Reward.item({
		"Qsystem-bone-0":20,"Qsystem-wood-0":20,"Qsystem-metal-0":20,
	},"Materials"),['challengeComplete1']);

	Achievement.create('challengeComplete10','Complete 10 Challenges',null,{},function(main){
		return getChallengeComplete(main) >= 10;
	},function(main){
		return getChallengeComplete(main) + '/10';		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-fireBullet-melee','Throw Burning Weapons','attackMagic-meteor','Throw multiple flame weapons.'
	),['challengeComplete5']);
	
	Achievement.create('challengeCompleteAll','Complete All Challenges',null,{},function(main){
		return getChallengeComplete(main) >= getMaxChallengeComplete(main);
	},function(main){
		return getChallengeComplete(main) + '/' + getMaxChallengeComplete(main);		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-meleeBig','Bleeding Blow','attackMelee-cube','Powerful Melee Strike with increased bleed chance. Cost life.'
	),['challengeComplete10']);
	
	//sidequest
	var getSideQuestComplete = function(main){
		var count = 0;
		for(var i in main.sideQuest)
			if(main.sideQuest[i].complete)
				count++;
		return count;
	}
	var getSideQuestComplete10 = function(main){
		var count = 0;
		for(var i in main.sideQuest)
			if(main.sideQuest[i].complete >= 10)
				count++;
		return count;
	}
	var getMaxSideQuestComplete = function(main){
		return main.sideQuest.$keys().length;
	}
	Achievement.create('sideQuestWest1','Complete 1 Side Quest',null,{},function(main){
		return getSideQuestComplete(main) >= 1;
	},function(main){
		return getSideQuestComplete(main) + '/1';		
	},['onSideQuestComplete'],Achievement.Reward.exp(1000),[]);
	
	Achievement.create('sideQuestWest5','Complete 5 Side Quests',null,{},function(main){
		return getSideQuestComplete(main) >= 5;
	},function(main){
		return getSideQuestComplete(main) + '/5';		
	},['onSideQuestComplete'],Achievement.Reward("<strong>West Waypoint</strong>",function(key,achievement){
		Message.addPopup(key,"You have unlocked the West Waypoint.");
	}),['sideQuestWest1']);
	
	Achievement.create('sideQuestWestAll','Complete All Side Quests',null,{},function(main){
		return getSideQuestComplete(main) >= getMaxSideQuestComplete(main);
	},function(main){
		return getSideQuestComplete(main) + '/' + getMaxSideQuestComplete(main);		
	},['onSideQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-lightningBullet-range','Lightning Arrows','attackMagic-static','Shoot lightning arrows at the speed of light.'
	),['sideQuestWest5']);
	
	Achievement.create('sideQuestWestAllx10','Complete All Side Quests x10',"Complete All Side Quests at least 10 times each",{},function(main){
		return getSideQuestComplete10(main) >= getMaxSideQuestComplete(main);
	},function(main){
		return getSideQuestComplete10(main) + '/' + getMaxSideQuestComplete(main);		
	},['onSideQuestComplete'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":2,
	},'Reroll Orbs'),['sideQuestWestAll']);
	
	// Competition
	Achievement.create('competitionRankAny','Enter a Competition','Set a score for the weekly competition',{},function(main,variable,rank){
		if(rank === undefined)
			return false;
		return true;
	},function(main){
		return;
	},['onCompetitionEntry'],Achievement.Reward.ability(
		'Qsystem-player-coldBomb','Cold Explosion','attackMagic-crystal','Create a powerful explosion of ice.'
	));
	
	Achievement.create('competitionRank5','Competition Top 5','Be in the top 5 in the weekly competition for a brief instant.',{},function(main,variable,rank){
		if(rank === undefined)
			return false;
		return rank <= 4;	//note: 0 = rank 1
	},function(main){
		return;
	},['onCompetitionEntry'],Achievement.Reward.exp(500),['competitionRankAny']);
	
	Achievement.create('competitionRank1','Competition Top 1','Be first in the weekly competition for a brief instant.',{},function(main,variable,rank){
		if(rank === undefined)
			return false;
		return rank === 0;	//note: 0 = rank 1
	},function(main){
		return;
	},['onCompetitionEntry'],Achievement.Reward.exp(3000),['competitionRank5']);
	
	
	//map exploration
	Achievement.create('enterMapLvl10','Enter Lvl 10 Map',null,{},function(main,variable,spot){
		var lvl = MapModel.get(spot.mapModel).lvl;
		return lvl >= 10;
	},function(main,v){
		return;
	},['onTeleport'],Achievement.Reward.ability(
		'Qsystem-player-meleeChain','Chain','attackMelee-slice','Throw a chain that attracts enemies to you.'
	));
	
	Achievement.create('enterMapLvl15','Enter Lvl 15 Map',null,{},function(main,variable,spot){
		var lvl = MapModel.get(spot.mapModel).lvl;
		return lvl >= 15;
	},function(main,v){
		return;
	},['onTeleport'],Achievement.Reward.ability(
		'Qsystem-player-healTornado','Regen Tornado','heal-plus','Heals you and pushes monsters away.'
	),['enterMapLvl10']);
	
	
	
	
	
	//misc
	Achievement.create('trade1','Trade an item.',null,{},function(main,v){
		return true;
	},function(main,v){
		return;
	},['onTrade'],Achievement.Reward.exp(500));
	
	Achievement.create('shop1','Buy an item from a shop.',null,{},function(main,v){
		return true;
	},function(main,v){
		return;
	},['onShopBuy'],Achievement.Reward.exp(500));
	
	Achievement.create('beeTransform','Beefication','Get transformed into a bee by the Wise Old Man.',{},function(main,v){
		return true;
	},function(main,v){
		return;
	},['onBeeTransform'],Achievement.Reward.exp(1000));
	
	Achievement.create('squirrelSpawn','Squirrels!','Ask Zezymah to spawn squirrels.',{},function(main,v){
		return true;
	},function(main,v){
		return;
	},['onSquirrelSpawn'],Achievement.Reward.exp(500));
	
	Achievement.create('death100','Die 100 times.',null,{count:0},function(main,v){
		return ++v.count >= 100;
	},function(main,v){
		return v.count + "/100";
	},['onDeath'],Achievement.Reward.exp(2000));
	
	Achievement.create('playtime10','Play for 10 hours.',null,{timePlayed:0},function(main,v,time){
		v.timePlayed = time;
		return v.timePlayed >= 10*CST.HOUR;
	},function(main,v){
		return Tk.msToChrono(v.timePlayed,true);
	},['onSignIn'],Achievement.Reward.exp(2500));
	
	Achievement.create('playWeek','Play every day of the week.',null,{_0:false,_1:false,_2:false,_3:false,_4:false,_5:false,_6:false},function(main,v,time){
		var day = (new Date()).getDay();
		v['_' + day] = true;
		for(var i in v)
			if(!v[i])
				return false;
		return true;
	},function(main,v){
		var count = 0;
		for(var i in v)
			if(v[i])
				count++;
		return count + "/7";
	},['onSignIn'],Achievement.Reward.exp(5000));
	
	Achievement.create('dialogueTown10','Talk with 10 villagers in town.',null,{list:[]},function(main,v,qid,dialogueNpc){
		if(qid !== 'QfirstTown')
			return false;
		if(!v.list.$contains(dialogueNpc))
			v.list.push(dialogueNpc);
		return v.list.length >= 10;
	},function(main,v){
		return v.list.length + "/10";
	},['onDialogue'],Achievement.Reward.exp(1000));
	
	Achievement.create('killDragon100','Kill 100 Dragons.',null,{count:0},function(main,v,model){
		if(model === 'Qsystem-dragon')
			v.count++;
		return v.count >= 100;
	},function(main,v){
		return v.count + "/100";
	},['onActorKilled'],Achievement.Reward.exp(3000));
	
	Achievement.create('killPlayer100','Kill 100 players.',null,{count:0},function(main,v,model){
		if(model === 'player')
			v.count++;
		return v.count >= 100;
	},function(main,v){
		return v.count + "/100";
	},['onActorKilled'],Achievement.Reward.exp(3000));
	
	
	Achievement.create('killAll','Kill every monster type',"Bat, bee, mosquito, plant, slime, slime minion, snake, "
		+ "x3 goblins, x3 orcs, small worm, big worm, ghost, eyeball, skeleton, spirit,"
		+ "pumpking, werewolf, dragon",{
		"Qsystem-bat":false,
		"Qsystem-bee":false,
		"Qsystem-mosquito":false,
		"Qsystem-plant":false,
		"Qsystem-slime":false,
		"Qsystem-slime-child":false,
		"Qsystem-snake":false,
		"Qsystem-goblin-melee":false,
		"Qsystem-goblin-range":false,
		"Qsystem-goblin-magic":false,
		"Qsystem-orc-melee":false, 
		"Qsystem-orc-range":false,
		"Qsystem-orc-magic":false,
		"Qsystem-smallWorm":false, 
		"Qsystem-ghost":false, 
		"Qsystem-eyeball":false, 
		"Qsystem-skeleton":false,
		"Qsystem-spirit":false,
		"Qsystem-pumpking":false,
		"Qsystem-werewolf":false, 
		"Qsystem-bigWorm":false, 
		"Qsystem-dragon":false, 
	},function(main,v,monsterType){
		if(v[monsterType] === false)
			v[monsterType] = true;
		for(var i in v)
			if(!v[i])
				return false;
		return true;
	},function(main,v){
		var count = 0;
		for(var i in v)
			if(v[i])
				count++;
		return count + "/" + v.$length();
	},['onActorKilled'],Achievement.Reward.ability(
		'Qsystem-player-lightWave','Light Wave','system1-less','Shoot 2 waves of light.'
	));
	
	
	
	
	// Harvest based	
	Achievement.create('harvest10','Harvest 10 resources.','Harvest resources from trees, rocks or hunt 10 times.',{count:0},function(main,v){
		return ++v.count >= 10;
	},function(main,v){
		return v.count + "/10";
	},['onHarvest'],Achievement.Reward.ability(
		'Qsystem-player-pierceArrow','Piercing Arrows','weapon-crossbow','Shoot fast piercing arrows.'
	));
	
	Achievement.create('harvest100','Harvest 100 resources.','Harvest resources from trees, rocks or hunt 100 times.',{count:0},function(main,v){
		return ++v.count >= 100;
	},function(main,v){
		return v.count + "/100";
	},['onHarvest'],Achievement.Reward.exp(2000),['harvest10']);
	
	Achievement.create('harvest1000','Harvest 1000 resources.','Harvest resources from trees, rocks or hunt 1000 times.',{count:0},function(main,v){
		return ++v.count >= 1000;
	},function(main,v){
		return v.count + "/1000";
	},['onHarvest'],Achievement.Reward.exp(5000),['harvest100']);
	
	Achievement.create('harvestAll','Harvest every resource type.','Tree, rock, hunt',{tree:false,rock:false,hunt:false},function(main,v,type){
		if(type.$contains('tree'))
			v.tree = true;
		else if(type.$contains('hunt'))
			v.hunt = true;
		else if(type.$contains('rock'))
			v.rock = true;
		return v.rock && v.tree && v.hunt;
	},function(main,v){
		return;
	},['onHarvest'],Achievement.Reward.exp(1000));
		
	//inventory	
	Achievement.create('matAll','Material Master.','Own every type of material. (Ruby, Sapphire, Topaz, Metal, Wood, Bone)',{ruby:false,topaz:false,sapphire:false,metal:false,bone:false,wood:false},function(main,v,id){
		var mat = Material.get(id);
		if(!mat)
			return false;
		v[mat.type] = true;
		for(var i in v)
			if(!v[i])
				return false;
		return true;
	},function(main,v){
		var count = 0;
		for(var i in v)
			if(v[i])
				count++;
		return count + "/6";
	},['onItemAdd'],Achievement.Reward.item({
		"Qsystem-metal-0":2,"Qsystem-bone-0":2,"Qsystem-wood-0":2,
		"Qsystem-sapphire-0":2,"Qsystem-ruby-0":2,"Qsystem-topaz-0":2,
	},'Materials'));
	
	Achievement.create('mat100','Own 100 of the same material.',null,{},function(main,v,id){
		var mat = Material.get(id);
		if(!mat)
			return false;
		return Main.haveItem(main,id,100);
	},function(main,v){
		return;
	},['onItemAdd'],Achievement.Reward.exp(3000));
	
	Achievement.create('mat1000','Own 1000 of the same material.',null,{},function(main,v,id){
		var mat = Material.get(id);
		if(!mat)
			return false;
		return Main.haveItem(main,id,1000);
	},function(main,v){
		return;
	},['onItemAdd'],Achievement.Reward.exp(5000));
	
	//equip	
	Achievement.create('equipYellow','Rare Equip.','Find a rare orange equip.',{},function(main,v,id){
		var e = Equip.get(id);
		if(!e || e.color !== Equip.COLOR.ORANGE)
			return false;
		if(e.creator !== main.username)	//otherwise, can create new account and get infinite
			return false;
		return true;
	},function(main,v){
		return;
	},['onItemAdd'],Achievement.Reward.item({
		"Qsystem-metal-0":5,"Qsystem-bone-0":5,"Qsystem-wood-0":5,
	},'Materials'));
	
	Achievement.create('equipGold','Very Rare Equip.','Find a very rare gold equip.',{},function(main,v,id){
		var e = Equip.get(id);
		if(!e || e.color !== Equip.COLOR.GOLD)
			return false;
		if(e.creator !== main.username)	//otherwise, can create new account and get infinite
			return false;
		return true;
	},function(main,v){
		return;
	},['onItemAdd'],Achievement.Reward.ability(
		'Qsystem-player-fireBullet-range','Explosive Arrow','attackMagic-meteor','Shoot an explosive fire arrow.'
	),['equipYellow']);
	
	
	
	
	
	
	
	
	Achievement.create('equipEpic','Epic Equip.','Find equip with the prefix Epic',{},function(main,v,id){
		var e = Equip.get(id);
		if(!e || e.name.indexOf('Epic') !== 0)
			return false;
		if(e.creator !== main.username)	//otherwise, can create new account and get infinite
			return false;
		return true;
	},function(main,v){
		return;
	},['onItemAdd'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":1,
	},'Reroll Orb'));
	
	Achievement.create('equipEpicness','Equip of Epicness.','Find equip with the suffix of Epicness',{},function(main,v,id){
		var e = Equip.get(id);
		if(!e || e.name.indexOf('Epicness') === -1)
			return false;
		if(e.creator !== main.username)	//otherwise, can create new account and get infinite
			return false;
		return true;
	},function(main,v){
		return;
	},['onItemAdd'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":1,
	},'Reroll Orb'));
	
	Achievement.create('equipEpicEpicness','Epic Equip of Epicness.','Find equip with the prefix Epic and suffix of Epicness',{},function(main,v,id){
		var e = Equip.get(id);
		if(!e || e.name.indexOf('Epic') !== 0 || e.name.indexOf('Epicness') === -1)
			return false;
		if(e.creator !== main.username)	//otherwise, can create new account and get infinite
			return false;
		return true;
	},function(main,v){
		return;
	},['onItemAdd'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":1,
	},'Reroll Orb'),['equipEpic','equipEpicness']);
	
	Achievement.create('equipAll','Equip Master.','Own every type of equip. (x9 weapon, x3 body, x3 helm, x3 amulet, x3 ring)',{
		weapon_mace:false,weapon_sword:false,weapon_spear:false,
		weapon_crossbow:false,weapon_bow:false,weapon_boomerang:false,
		weapon_wand:false,weapon_orb:false,weapon_staff:false,
		body_metal:false,body_wood:false,body_bone:false,
		helm_metal:false,helm_wood:false,helm_bone:false,
		ring_ruby:false,ring_sapphire:false,ring_topaz:false,
		amulet_ruby:false,amulet_sapphire:false,amulet_topaz:false,
	},function(main,v,id){
		var e = Equip.get(id);
		if(e){
			var str = e.piece + '_' + e.type;
			if(v[str] === false)
				v[str] = true;
		}
		for(var i in v)
			if(!v[i])
				return false;
		return true;
	},function(main,v){
		var count = 0;
		for(var i in v)
			if(v[i])
				count++;
		return count + "/21";
	},['onItemAdd'],Achievement.Reward.ability(
		'Qsystem-player-paraboleArrow','Parabole Shot','weapon-bow','Shoot 4 parabolic arrows.'
	));
	
	Achievement.create('equipAllOrange','Full Orange.','Wear an orange equip that you found in every equip slot.',{},function(main,v,id){
		var equip = Actor.getEquip(Main.getAct(main));
		for(var i in equip.piece){
			if(!equip.piece[i])
				return false;
			var e = Equip.get(equip.piece[i]);
			if(!e || e.creator !== main.username || e.color !== Equip.COLOR.ORANGE)
				return false;
		}
		return true;
	},function(main,v){
		return;
	},['onEquipChange'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":1,
	},"Reroll Orb"));
	
	Achievement.create('equipAllGold','Full Gold.','Wear a gold equip that you found in every equip slot.',{},function(main,v,id){
		var equip = Actor.getEquip(Main.getAct(main));
		for(var i in equip.piece){
			if(!equip.piece[i])
				return false;
			var e = Equip.get(equip.piece[i]);
			if(!e || e.creator !== main.username || e.color !== Equip.COLOR.GOLD)
				return false;
		}
		return true;
	},function(main,v){
		return;
	},['onEquipChange'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":2,
	},"Reroll Orbs"),['equipAllOrange']);
	
	
	Achievement.create('salvage10','Salvage 10 equips.',null,{count:0},function(main,v){
		return ++v.count >= 10;
	},function(main,v){
		return v.count + "/10";
	},['onSalvage'],Achievement.Reward.exp(1000));
	
	Achievement.create('salvage100','Salvage 100 equips.',null,{count:0},function(main,v){
		return ++v.count >= 100;
	},function(main,v){
		return v.count + "/100";
	},['onSalvage'],Achievement.Reward.ability(
		'Qsystem-player-whirlwind','Whirlwind','attackMelee-slice','Deadly sword whirlwind that generates lightning balls.'
	),['salvage10']);
		
	Achievement.create('salvageGold','Salvage a gold equip.',null,{},function(main,v,eid){
		var e = Equip.get(eid);
		if(!e || e.color !== 'gold')
			return false;
		return true;
	},function(main,v){
		return;
	},['onSalvage'],Achievement.Reward.item({
		"Qsystem-orb-rerollOne":1,
	},"Reroll Orbs"));
	
	Achievement.create('addBoost10','Add 10 boosts to equips.',null,{count:0},function(main,v){
		return ++v.count >= 10;
	},function(main,v){
		return v.count + "/10";
	},['onEquipUpgrade'],Achievement.Reward.exp(1000));
	
	Achievement.create('addBoost100','Add 100 boosts to equips.',null,{count:0},function(main,v){
		return ++v.count >= 100;
	},function(main,v){
		return v.count + "/100";
	},['onEquipUpgrade'],Achievement.Reward.ability(
		'Qsystem-player-fireStrike','Fire Strike','attackMelee-fierce','A strike with high chance of burning and bleeding enemies.'
	),['addBoost10']);
		
		
	//quest custom
	Achievement.create('questCompleteFriend','Beat any quest with 3 friends.',null,{},function(main,v,qid,partySize){
		return partySize >= 4;
	},function(main){
		return;		
	},['onQuestComplete'],Achievement.Reward.ability(
		'Qsystem-player-coldStrike','Chilling Strike','weapon-spear','A strike with high chance of chilling and pushing back enemies.'
	));
	
	Achievement.create('questCompleteFriendKingOfHill','Beat King of The Hill with 3 friends.',null,{},function(main,v,qid,partySize){
		return qid === 'QkingOfTheHill' && partySize >= 4;
	},function(main){
		return;		
	},['onQuestComplete'],Achievement.Reward.exp(1000));
	
	Achievement.create('questCompleteFriendDuelLeague','Beat Duel League with 3 friends.',null,{},function(main,v,qid,partySize){
		return qid === 'QduelLeague' && partySize >= 4;
	},function(main){
		return;		
	},['onQuestComplete'],Achievement.Reward.exp(1000));
	
	var isNaked = function(main){
		var equip = Actor.getEquip(Main.getAct(main));
		for(var i in equip.piece)
			if(equip.piece[i])
				return false;
		for(var i in main.invList.data)
			if(Equip.get(i))
				return false;
		return true;
	}
	
	Achievement.create('questCompleteBulletHeavenNaked','Complete Bullet Heaven naked.','Must have no equipment equipped NOR IN YOUR INVENTORY.',{},function(main,v,qid,partySize){
		if(qid !== 'QbulletHeaven')
			return false;
		return isNaked(main);
	},function(main){
		return;		
	},['onQuestComplete'],Achievement.Reward.exp(2000));
	
	Achievement.create('questCompleteBossBattleNaked','Complete Boss Battle naked.','Must have no equipment equipped NOR IN YOUR INVENTORY.',{},function(main,v,qid,partySize){
		if(qid !== 'QbossBattle')
			return false;
		return isNaked(main);
	},function(main){
		return;		
	},['onQuestComplete'],Achievement.Reward.exp(2000));
		
		
		
	// Reputation-based
	Achievement.create('repCorner1','Unlock Reputation in corner.','Unlock a Reputation boost in one of the four corners of the grid.',{},function(main){
		var grid = Main.reputation.getGrid(main);
		
		if(Main.reputation.getValue(grid,0,0)
			|| Main.reputation.getValue(grid,grid.length-1,0)
			|| Main.reputation.getValue(grid,grid.length-1,grid[0].length-1)
			|| Main.reputation.getValue(grid,0,grid[0].length-1)
		)
			return true;
	},function(main){
		return;		
	},['onReputationChange'],Achievement.Reward.item({
		"Qsystem-metal-0":20,"Qsystem-bone-0":20,"Qsystem-wood-0":20,
	},'Materials'));
	Achievement.create('repCorner4','Unlock all Reputations in corner.','Unlock Reputation boosts in each of the four corners of the grid.',{},function(main){
		var grid = Main.reputation.getGrid(main);
		
		if(Main.reputation.getValue(grid,0,0)
			&& Main.reputation.getValue(grid,grid.length-1,0)
			&& Main.reputation.getValue(grid,grid.length-1,grid[0].length-1)
			&& Main.reputation.getValue(grid,0,grid[0].length-1)
		)
			return true;
	},function(main){
		return;		
	},['onReputationChange'],Achievement.Reward.item({
		"Qsystem-metal-0":20,"Qsystem-bone-0":20,"Qsystem-wood-0":20,
	},'Materials'),['repCorner1']);
	Achievement.create('repSame3','Same Reputation boost x3.','Unlock 3 times the same Reputation boost.',{},function(main){
		return Main.reputation.getMostCommonBoostCount(main) >= 3;
	},function(main){
		return Main.reputation.getMostCommonBoostCount(main) + '/3';				
	},['onReputationChange'],Achievement.Reward.ability(
		'Qsystem-player-windKnock','Tornado','attackRange-steady','Defensive tornado that pushes enemies away.'
	));
	
	Achievement.create('repSame5','Same Reputation boost x5.','Unlock 5 times the same Reputation boost.',{},function(main){
		return Main.reputation.getMostCommonBoostCount(main) >= 5;
	},function(main){
		return Main.reputation.getMostCommonBoostCount(main) + '/5';		
	},['onReputationChange'],Achievement.Reward.item({
		"Qsystem-ruby-0":20,"Qsystem-sapphire-0":20,"Qsystem-topaz-0":20,
	},'Gems'),['repSame3']);
	
	Achievement.create('repSame10','Same Reputation boost x10.','Unlock 10 times the same Reputation boost.',{},function(main){
		return Main.reputation.getMostCommonBoostCount(main) >= 10;
	},function(main){
		return Main.reputation.getMostCommonBoostCount(main) + '/10';
	},['onReputationChange'],Achievement.Reward.item({
		"Qsystem-ruby-0":20,"Qsystem-sapphire-0":20,"Qsystem-topaz-0":20,
	},'Gems'),['repSame5']);
	
	Achievement.create('repConverter4','Use 4 Reputation Converters','Have 4 Reputation Converters active at the same time.',{},function(main){
		var list = Main.reputation.getConverter(main);
		return list.length >= 4;
	},function(main){
		return;
	},['onReputationChange'],Achievement.Reward.item({
		"Qsystem-metal-0":50,
	},'Materials'));
	
		
		
	// Stat-based
	Achievement.create('statMeleeDmg15','Get x1.5 Melee Dmg','Reach x1.5 Melee Damage from Equip and Reputation bonus.',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-melee') >= 1.5;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-melee').r(2) + '/1.5';
	},['onReputationChange','onEquipChange'],Achievement.Reward.exp(1500));
	
	Achievement.create('statMagicDmg20','Get x2.0 Arcane Dmg','Reach x2.0 Arcane Damage from Equip and Reputation bonus.',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-magic') >= 2;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-magic').r(2) + '/2.0';
	},['onReputationChange','onEquipChange'],Achievement.Reward.exp(3000),['statMeleeDmg15']);
	
	Achievement.create('statColdDmg25','Get x2.5 Cold Dmg','Reach x2.5 Cold Damage from Equip and Reputation bonus.',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-cold') >= 2.5;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-cold').r(2) + '/2.5';
	},['onReputationChange','onEquipChange'],Achievement.Reward.exp(4500),['statMagicDmg20']);
	
	
	Achievement.create('statRangeDef15','Get x1.5 Range Def','Reach x1.5 Range Defence from Equip and Reputation bonus.',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-range') >= 1.5;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-range').r(2) + '/1.5';
	},['onReputationChange','onEquipChange'],Achievement.Reward.exp(1500));
	
	Achievement.create('statFireDef20','Get x2.0 Fire Def','Reach x2.0 Fire Defence from Equip and Reputation bonus.',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-fire') >= 2;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-fire').r(2) + '/2.0';
	},['onReputationChange','onEquipChange'],Achievement.Reward.exp(3000),['statFireDef20']);
	
	Achievement.create('statLightningDef25','Get x2.5 Lightning Def','Reach x2.5 Lightning Defence from Equip and Reputation bonus.',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-lightning') >= 2.5;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-lightning').r(2) + '/2.5';
	},['onReputationChange','onEquipChange'],Achievement.Reward.exp(4500),['statLightningDef25']);
	
}


})(); //{




