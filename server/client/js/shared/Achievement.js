//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}

var Actor = require2('Actor'), Main = require2('Main'), Quest = require2('Quest'), Message = require2('Message');

var VALID_ONTEST = ['onActorKilled','onCompetitionEntry','onEquipChange','onQuestComplete','onLevelUp','onTeleport','onDeath','onItemAdd','onReputationChange'];
var INDEX = 0;
var Achievement = exports.Achievement = {};
Achievement.create = function(id,name,description,icon,variable,onAction,getProgressText,testOn,reward){
	var a = {
		id:id || ERROR(3,'invalid id') || '',
		name:name || '',
		displayIndex:INDEX++,
		description:description || name || '',
		icon:icon || '',
		variable:variable || {},	//default values
		onAction:onAction || ERROR(3,'invalid onAction') || CST.func,	//bool param(main)
		getProgressText:getProgressText || ERROR(3,'invalid getProgressText') || CST.func,	//string param(main,variable)
		testOn:testOn || [],
		reward:reward || Achievement.Reward(),
	};
	for(var i = 0 ; i < testOn.length; i++){
		if(!VALID_ONTEST.$contains(testOn[i]))
			ERROR(3,'invalid onTest',testOn[i]);
		else
			QUICK_DB[testOn[i]].push(a);
	}
	
	DB[id] = a;
	
	return a;
}
var DB = Achievement.DB = {};
var QUICK_DB = {};

Achievement.get = function(id){
	return DB[id] || ERROR(3,'invalid achievement id',id) || null;
}

var onTest = function(main,what,extraParam,extraParam1){
	var list = QUICK_DB[what];
	for(var i = 0 ; i < list.length; i++){
		var a = list[i];
		var ma = main.achievement[a.id];
		if(!ma)
			return ERROR(3,'achievement id not in main',a.id);
		if(ma.complete)
			continue;
		var good = a.onAction(main,main.achievement[a.id].variable,extraParam,extraParam1);
		if(good){
			a.reward.onComplete(main.id,a);
			Main.achievement.onAchievementComplete(main,a);
		}
		var text = a.getProgressText(main,main.achievement[a.id].variable);
		if(main.achievement[a.id].progressText !== text){
			main.achievement[a.id].progressText = text;
			Main.setFlag(main,'achievement',a.id);
		}
	}
}

Achievement.getDefaultVariable = function(){
	var a = {};
	for(var i in DB){
		a[i] = Tk.deepClone(DB[i].variable);	
	}
	return a;
}

Achievement.onLevelUp = function(main){
	onTest(main,'onLevelUp');
}
Achievement.onQuestComplete = function(main){
	onTest(main,'onQuestComplete');
}
Achievement.onActorKilled = function(main,actorKilled){
	onTest(main,'onActorKilled',actorKilled);
}
Achievement.onTeleport = function(main,spot){
	onTest(main,'onTeleport',spot);
}
Achievement.onDeath = function(main){
	onTest(main,'onDeath');
}
Achievement.onItemAdd = function(main,item,amount){
	onTest(main,'onItemAdd',item,amount);
}
Achievement.onReputationChange = function(main){
	onTest(main,'onReputationChange');
}

Achievement.onCompetitionEntry = function(main,rank){
	onTest(main,'onCompetitionEntry',rank);
}

Achievement.onEquipChange = function(main,eid){
	onTest(main,'onEquipChange',eid);
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

var onCompleteHelper = function(key,exp,item,ability){
	if(exp)
		Actor.addExp(Actor.get(key),exp);
	if(item)
		Main.addItem(Main.get(key),item);
	if(ability)
		Actor.addAbility(Actor.get(key),ability);
}

var onCompleteHelperAbility = function(key,achievement){
	var str = 'Achievement "' + achievement.name + '" complete!<br>You have unlocked a ';
	str += Message.generateTextLink("exports.Dialog.open(\'ability\');",'new ability');
	str += '.';
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
complete all challenge for a quest

top 15 highscore

reach x1.5 dmg,x2 for 1 stats (rep equip)
reach x1.5 def,x2 for 1 stats (rep equip)


trade an item
complete quest with 1,3 friend


get x10, x100 of same material
get highest lvl material
get each type of material
upgrade material

get every type equip
get yellow equip
get gold equip
equip with prefix Epic
equip with suffix 'of Epicness'
equip with prefix Epic and suffix 'of Epicness'
salvage 10,100 equip
upgrade equip 10,100 times

harvest 10,100,1000 times

get max score in 1,5,all quests


kill 10, 100, 1000 monsters
kill each type of monsters
talk with every npc in town

visit every non-quest map
visit every map
be turned into a bee by the wise old man
make ___ spawn squirrels

puzzle master: compelte puzzlebridge and puzzleswitch back to back all lvl
complete king of the hill with 3 friends
complete duel league with 3 friends

get killed 100 times


*/


Achievement.init = function(){
	for(var i = 0 ; i < VALID_ONTEST.length; i++)
		QUICK_DB[VALID_ONTEST[i]] = [];
		
	return;
	
	//{ Lvl-based
	Achievement.create('lvl1','Reach Level 1',null,'',{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 1;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/1";		
	},['onLevelUp'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('lvl5','Reach Level 5',null,'',{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 5;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/5";
	},['onLevelUp'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('lvl10','Reach Level 10',null,'',{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 10;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/10";		
	},['onLevelUp'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('lvl20','Reach Level 20',null,'',{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 20;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/20";		
	},['onLevelUp'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('lvl50','Reach Level 50',null,'',{},function(main){
		return Actor.getLevel(Main.getAct(main)) >= 50;
	},function(main){
		return Actor.getLevel(Main.getAct(main)) + "/50";		
	},['onLevelUp'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	//}
	//{ Reputation-based
	Achievement.create('repCorner1','Unlock Reputation in corner.','Unlock a Reputation boost in one of the four corners of the grid.','',{},function(main){
		var grid = Main.reputation.getGrid(main);
		
		if(Main.reputation.getValue(grid,0,0)
			|| Main.reputation.getValue(grid,grid.length-1,0)
			|| Main.reputation.getValue(grid,grid.length-1,grid[0].length-1)
			|| Main.reputation.getValue(grid,0,grid[0].length-1)
		)
			return true;
	},function(main){
		return;		
	},['onReputationChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('repCorner4','Unlock All Reputations in corner.','Unlock Reputation boosts in each of the four corners of the grid.','',{},function(main){
		var grid = Main.reputation.getGrid(main);
		
		if(Main.reputation.getValue(grid,0,0)
			&& Main.reputation.getValue(grid,grid.length-1,0)
			&& Main.reputation.getValue(grid,grid.length-1,grid[0].length-1)
			&& Main.reputation.getValue(grid,0,grid[0].length-1)
		)
			return true;
	},function(main){
		return;		
	},['onReputationChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('repSame3','Unlock 3 times the same Reputation boost.',null,'',{},function(main){
		return Main.reputation.getMostCommonBoostCount(main) >= 3;
	},function(main){
		return Main.reputation.getMostCommonBoostCount(main) + '/3';				
	},['onReputationChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	Achievement.create('repSame5','Unlock 5 times the same Reputation boost.',null,'',{},function(main){
		return Main.reputation.getMostCommonBoostCount(main) >= 5;
	},function(main){
		return Main.reputation.getMostCommonBoostCount(main) + '/5';		
	},['onReputationChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	Achievement.create('repSame10','Unlock All Reputations in corner.','Unlock Reputation boosts in each of the four corners of the grid.','',{},function(main){
		return Main.reputation.getMostCommonBoostCount(main) >= 10;
	},function(main){
		return Main.reputation.getMostCommonBoostCount(main) + '/10';
	},['onReputationChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	Achievement.create('repConverter4','Use 4 Reputation Converters','Have 4 Reputation Converters active at the same time.','',{},function(main){
		var list = Main.reputation.getConverter(main);
		for(var i = 0 ; i < list.length; i++)
			if(!list[i])
				return false;
		return true;
	},function(main){
		return;
	},['onReputationChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	
	//}
	
	//{ Quest-based
	
	var MAX_QUEST_COMPLETE;
	var getMaxQuestComplete = function(main){
		if(MAX_QUEST_COMPLETE)
			return MAX_QUEST_COMPLETE;
		var count = 0;
		for(var i in main.quest)
			if(Quest.get(i).completable)
					count++;
		MAX_QUEST_COMPLETE = count;
		return count;
	}
	
	Achievement.create('questComplete1','Complete 1 Quest',null,'',{},function(main){
		return Main.getCompletedQuestCount(main)-1 >= 1;	//-1 for tutorial
	},function(main){
		return Main.getCompletedQuestCount(main)-1 + '/1';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('questComplete5','Complete 5 Quests',null,'',{},function(main){
		return Main.getCompletedQuestCount(main)-1 >= 5;
	},function(main){
		return Main.getCompletedQuestCount(main)-1 + '/5';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('questComplete10','Complete 10 Quests',null,'',{},function(main){
		return Main.getCompletedQuestCount(main)-1 >= 10;
	},function(main){
		return Main.getCompletedQuestCount(main)-1 + '/10';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('questCompleteAll','Complete All Quests',null,'',{},function(main){
		return Main.getCompletedQuestCount(main)-1 >= getMaxQuestComplete(main);
	},function(main){
		return Main.getCompletedQuestCount(main)-1 + '/' + getMaxQuestComplete(main);		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	Achievement.create('gem125','Reach GEM x1.25',null,'',{},function(main){
		return Actor.getGEM(Main.getAct(main)) >= 1.25;
	},function(main){
		return Tk.round(Actor.getGEM(Main.getAct(main)),2) + '/1.25';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('gem150','Reach GEM x1.5',null,'',{},function(main){
		return Actor.getGEM(Main.getAct(main)) >= 1.5;
	},function(main){
		return Tk.round(Actor.getGEM(Main.getAct(main)),2) + '/1.5';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('gem200','Reach GEM x2',null,'',{},function(main){
		return Actor.getGEM(Main.getAct(main)) >= 2;
	},function(main){
		return Tk.round(Actor.getGEM(Main.getAct(main)),2) + '/2';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('gem300','Reach GEM x3',null,'',{},function(main){
		return Actor.getGEM(Main.getAct(main)) >= 3;
	},function(main){
		return Tk.round(Actor.getGEM(Main.getAct(main)),2) + '/3';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	//}
	//{ Challenge-based
	var getChallengeComplete = function(main){
		var count = 0;
		for(var i in main.quest)
			for(var j in main.quest[i]._challengeDone)
				if(main.quest[i]._challengeDone[j])
					count++;
		return count;
	}
	var MAX_CHALLENGE_COMPLETE;
	var getMaxChallengeComplete = function(main){
		if(MAX_CHALLENGE_COMPLETE)
			return MAX_CHALLENGE_COMPLETE;
		var count = 0;
		for(var i in main.quest)
			for(var j in main.quest[i]._challengeDone)
				count++;
		MAX_CHALLENGE_COMPLETE = count;
		return count;
	};
	Achievement.create('challengeComplete1','Complete 1 Challenge',null,'',{},function(main){
		return getChallengeComplete(main) >= 1;
	},function(main){
		return getChallengeComplete(main) + '/1';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('challengeComplete5','Complete 5 Challenges',null,'',{},function(main){
		return getChallengeComplete(main) >= 5;
	},function(main){
		return getChallengeComplete(main) + '/5';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('challengeComplete10','Complete 10 Challenges',null,'',{},function(main){
		return getChallengeComplete(main) >= 10;
	},function(main){
		return getChallengeComplete(main) + '/10';		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('challengeCompleteAll','Complete All Challenges',null,'',{},function(main){
		return getChallengeComplete(main) >= getMaxChallengeComplete(main);
	},function(main){
		return getChallengeComplete(main) + '/' + getMaxChallengeComplete(main);		
	},['onQuestComplete'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	//}
	//{ Competition
	Achievement.create('competitionRank1','Competition Top 1','Be first in the weekly competition for a brief instant.','',{},function(main,variable,rank){
		return rank === 0;	//note: 0 = rank 1
	},function(main){
		return;
	},['onCompetitionEntry'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	Achievement.create('competitionRank5','Competition Top 5','Be in the top 5 in the weekly competition for a brief instant.','',{},function(main,variable,rank){
		return rank <= 4;	//note: 0 = rank 1
	},function(main){
		return;
	},['onCompetitionEntry'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('competitionRankAny','Enter a Competition','Set a score for the weekly competition','',{},function(main,variable,rank){
		return true;
	},function(main){
		return;
	},['onCompetitionEntry'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	//}
	
	//{ Stat-based
	Achievement.create('statMeleeDmg15','Get x1.5 Melee Dmg','Reach x1.5 Melee Damage from Equip and Reputation bonus.','',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-melee') >= 0.5;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-melee').r(2) + '/1.5';
	},['onReputationChange','onEquipChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('statMagicDmg20','Get x2.0 Magic Dmg','Reach x2.0 Magic Damage from Equip and Reputation bonus.','',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-magic') >= 1;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-magic').r(2) + '/2.0';
	},['onReputationChange','onEquipChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('statColdDmg25','Get x2.5 Cold Dmg','Reach x2.5 Cold Damage from Equip and Reputation bonus.','',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-cold') >= 1.5;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'dmg-cold').r(2) + '/2.5';
	},['onReputationChange','onEquipChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	
	Achievement.create('statRangeDef15','Get x1.5 Range Def','Reach x1.5 Range Defence from Equip and Reputation bonus.','',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-range') >= 0.5;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-range').r(2) + '/1.5';
	},['onReputationChange','onEquipChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('statFireDef20','Get x2.0 Fire Def','Reach x2.0 Fire Defence from Equip and Reputation bonus.','',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-fire') >= 1;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-fire').r(2) + '/2.0';
	},['onReputationChange','onEquipChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	Achievement.create('statLightningDef25','Get x2.5 Lightning Def','Reach x2.5 Lightning Defence from Equip and Reputation bonus.','',{},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-lightning') >= 1.5;
	},function(main){
		return Actor.boost.getBase(Main.getAct(main),'def-lightning').r(2) + '/2.5';
	},['onReputationChange','onEquipChange'],Achievement.Reward(
		textHelper('Magic Bullet Ability','Shoot Magic bullets that can drain mana.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-magicBullet');
			onCompleteHelperAbility(key,achievement);
		}
	));
	
	
	
	/*
	Achievement.create('killDragon100','Kill 100 Dragons',null,'',{
		killCount:0
	},function(main,variable){
		variable.killCount++;
		return variable.killCount >= 2;
	},function(main,variable){
		return variable.killCount + "/100";
	},['onActorKilled'],Achievement.Reward(
		textHelper('Fireball Ability','Shoot Fireball that can burn foes.'),
		function(key,achievement){
			onCompleteHelper(key,null,null,'Qsystem-player-fireBullet');
			onCompleteHelperAbility(key,achievement);
		}	
	));
	*/
}


})(); //{


