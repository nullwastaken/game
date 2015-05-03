//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Actor = require2('Actor'), Achievement = require2('Achievement'), Highscore = require2('Highscore'), Main = require2('Main'), Debug = require2('Debug'), Challenge = require2('Challenge');
var db;
var QUEST_FOLDER = './client/quest/';
var QUEST_EXCLUDE = ['QkillTheDragon','tileset','Qpvp'];
var ONLINE_QUEST_LIST = [
	"Qsystem","QfirstTown","Qdebug",
	"Qcontribution","Qhighscore",
	"QsadTree","QaggressiveNpc","QbaseDefence","Qbtt000","QbulletHeaven","QcatchThemAll","QcollectFight","Qdarkness","QduelLeague","Qfifteen","QkingOfTheHill","QlureKill","Qminesweeper","QprotectFirstTown","QpuzzleBridge","QpuzzleSwitch","Qrgb","Qsoccer","QtowerDefence","Qtutorial"
];

var ZONE = ['QfirstTown-south','QfirstTown-main','QfirstTown-east','QfirstTown-eastCave','QfirstTown-north'];

var SIGN_IN_PACK = {};

var Quest = exports.Quest = {};
var DB = Quest.DB = {};
Quest.create = function(extra){
	//Quest.getAPItemplate for template
	var tmp = {};	
	for(var i in extra) 
		tmp[i] = extra[i];
	DB[tmp.id] = tmp;
	Debug.createQuestTool(tmp);
	//Quest.fetchPlayerComment(q.id);
	
	return tmp;
}

Quest.getAPItemplate = function(extra){
	var tmp = {	//note: considering i create the things on the fly, its useless except for sutff in loadAPI
		id:'',
		version:'v1.0',
		name:'Default Name',
		reward:Quest.Reward(),
		showInTab:true,
		showWindowComplete:true,
		dailyTask:true,
		inMain:true,	//in Main.get(key).quest
		globalHighscore:false,	//call updateHighscore everytime a quest complete
		alwaysActive:false,	//can call event without being questActive (ex: town)
		skillPlotAllowed:false,
		admin:false,		//allow extra in item, ability
		autoStartQuest:true,
		maxParty:2,
		author:'rc',
		description:'A super awesome quest!',
		thumbnail:'',
		scoreModInfo:'',
		lvl:0,
		difficulty:'Easy',
		rating:0,
		statistic:Quest.Statistic(),
		playerComment:[],
		category:[],
		solo:true,
		party:"Coop",
		zone:null,
		completable:true,
		requirement:{},
		//
		mapAddon:{},
		map:{},
		item:{}, 
		equip:{},
		npc:{},
		ability:{},
		dialogue:{},
		boss:{},
		//		
		challenge:{},
		preset:{},
		highscore:{},
		event:Quest.Event(),
		skillPlot:[],
		path:{},	
		s:null,	//set in s.exports
	};
	for(var i in extra){
		if(tmp[i] === undefined) 
			ERROR(4,'prop not in constructor',i);
		tmp[i] = extra[i];
	}
	
	tmp.reward = Quest.Reward(tmp.reward);
	if(!tmp.id || tmp.id[0] !== 'Q')
		return ERROR(1,'quest needs to start with Q',tmp.id);
	
	if(tmp.thumbnail === true)
		tmp.thumbnail = '/quest/' + tmp.id + '/' + tmp.id + '.png';
	else
		tmp.thumbnail = '/img/ui/defaultQuestThumbnail.png'
	
	if(tmp.zone && !ZONE.$contains(tmp.zone))
		return ERROR(3,'invalid zone',tmp.zone);
	
	//tmp.requirement = Quest.Requirement(tmp.requirement); //called in Quest.init cuz depends on other quest
	
	if(!Quest.Party(tmp.party)) 
		return ERROR(3,'invalid party param',tmp.party);
	if(!Quest.Category(tmp.category)) 
		return ERROR(3,'invalid category param',tmp.category);

	return tmp;
}

Quest.Party = function(name){
	return ["No","Coop","PvP"].$contains(name);
}

Quest.Category = function(category){
	if(!category[0]) return true;
	return ["Puzzle","Combat","Mixed"].$contains(category[0]);
}

Quest.Reward = function(reward){
	reward = reward || {};
	return {
		reputation:reward.reputation || Quest.Reward.reputation(),
		exp:reward.exp === undefined ? 1 : reward.exp,
		item:reward.item === undefined ? 1 : reward.item,
		ability:reward.ability || {},
	};
}	

Quest.Reward.reputation = function(mod,min,max){
	return {
		mod:mod || 10,
		min:min || 1,
		max:max || 2,
	};
}

Quest.Statistic = function(countComplete,countStarted,averageRepeat){
	return {
		countComplete:countComplete || 0,
		countStarted:countStarted || 0,
		averageRepeat:averageRepeat || 0,
	}
}

Quest.Requirement = function(req){
	var a = {
		canStart:function(main){ return true; },
		canStartText:'',
		questCount:0,
		questComplete:[],
		lvl:0,
		achievementCount:0,	
		achievementComplete:[],
	};
	for(var i in req){
		if(a[i] === undefined)
			ERROR(3,'invalid prop',i);
		a[i] = req[i];
	}
	a.canStart = function(main){
		if(Main.getCompletedQuestCount(main) < a.questCount)
			return false;
		for(var i = 0 ; i < a.questComplete.length; i++)
			if(!Main.hasCompletedQuest(main,a.questComplete[i]))
				return false;
				
		if(Actor.getLevel(Main.getAct(main)) < a.lvl)
			return false;
		if(Main.getCompletedAchievementCount(main) < a.achievementCount)
			return false;
		for(var i = 0 ; i < a.achievementComplete.length; i++)
			if(!Main.hasCompletedAchievement(main,a.achievementComplete[i]))
				return false;
		return true;
	}
	//canStartText
	var str = 'LOCKED: ';
	if(a.questCount !== 0)
		str += 'Complete ' + a.questCount + ' quests. ';
	
	if(a.questComplete.length !== 0){
		str += 'Complete quest ';
		for(var i = 0 ; i < a.questComplete.length; i++){
			 str += '"' + Quest.get(a.questComplete[i]).name + '",';
		}
		str = str.slice(0,-1);
		str += '. ';
	}
	if(a.lvl !== 0)
		str += 'Get Level ' + a.lvl + '. ';
	if(a.achievementCount !== 0)
		str += 'Complete ' + a.achievementCount + ' achievements. ';
	if(a.achievementComplete.length !== 0){
		str += 'Complete achievement ';
		for(var i = 0 ; i < a.achievementComplete.length; i++){
			 str += '"' + Achievement.get(a.achievementComplete[i]).name + '",';
		}
		str = str.slice(0,-1);
		str += '. ';
	}
	a.canStartText = str;
	
	return a;
}

//#######################

var fs = require('fs'),
    path = require('path');

Quest.init = function(dbLink){	//init Module
	db = dbLink;
	
	var QUEST_ID_LIST;
	if(!NODEJITSU){
		var getDirectories = function (srcpath) {
			return fs.readdirSync(srcpath).filter(function(file) {
				return fs.statSync(path.join(srcpath, file)).isDirectory();
			});
		}
		
		var QUEST_ID_LIST = getDirectories(path.resolve(__dirname,QUEST_FOLDER));

		//Qsystem need to be first
		QUEST_ID_LIST.$remove('Qsystem');
		QUEST_ID_LIST.$remove('QfirstTown');
		QUEST_ID_LIST.$remove('Qdebug');
		QUEST_ID_LIST.unshift('Qdebug');
		QUEST_ID_LIST.unshift('QfirstTown');
		QUEST_ID_LIST.unshift('Qsystem');

		for(var i  = 0 ; i < QUEST_EXCLUDE.length; i++)
			QUEST_ID_LIST.$remove(QUEST_EXCLUDE[i]);
	} else {
		QUEST_ID_LIST = ONLINE_QUEST_LIST;
	}
	
	
	for(var i = 0; i < QUEST_ID_LIST.length; i++){
		var qid = QUEST_ID_LIST[i];
		if(!qid) continue;	//in case split mess up...
		var req;
		try {
			req = require(QUEST_FOLDER+qid + "/" + qid);
		} catch(err){
			if(PUBLIC_VERSION)
				INFO(2,'Error with quest file ' + qid + '. To delete a quest, use Quest creator.\r\n\r\n');
			ERROR.err(2,err);
			return;
		}
		
		var q = Quest.create(req.quest);
		if(q.id !== qid) 
			return ERROR(2,'quest filename doesnt match quest id',q.id,qid);
	}
	setInterval(function(){
		Quest.updateStatistic();
	},CST.HOUR*4);
	Quest.updateRequirement();
	Quest.updateStatistic();
	Quest.updateSignInPack(); //duplicated but w/e called inside updateStatistic
}
Quest.updateRequirement = function(){
	for(var i in DB)
		DB[i].requirement = Quest.Requirement(DB[i].requirement);
}


Quest.get = function(id){
	return DB[id] || null;
}

Quest.updateSignInPack = function(onlyOneQuest){
	if(onlyOneQuest){
		SIGN_IN_PACK[onlyOneQuest] = Quest.compressClient(DB[onlyOneQuest],false);
		return;
	}
	for(var i in DB)
		SIGN_IN_PACK[i] = Quest.compressClient(DB[i],false);
}

Quest.getSignInPack = function(){
	return SIGN_IN_PACK;
}
	
Quest.compressClient = function(quest,full){ //decompression in QueryDb.uncompressQuest. 
	full = true;	//not being cheap bandwidth...
	if(!full){
		return {
			name:quest.name,
			author:quest.author,
			description:quest.description,
			thumbnail:quest.thumbnail,
			showInTab:quest.showInTab,
			isPartialVersion:true,
			requirement:Quest.compressClient.requirement(quest.requirement),
		};
	}
	return [
		quest.id,
		quest.name,
		quest.icon,
		quest.reward,
		quest.description,
		quest.thumbnail,
		quest.variable,
		quest.author,
		Quest.compressClient.challenge(quest.challenge),
		Quest.compressClient.highscore(quest.highscore),
		quest.lvl,
		quest.difficulty,
		quest.rating,
		quest.statistic,
		quest.playerComment,
		quest.showInTab,
		false,
		quest.category,
		Quest.compressClient.requirement(quest.requirement)
	];
} 

Quest.compressClient.challenge = function(info){
	var tmp = {};
	for(var i in info){
		tmp[i] = Challenge.compressClient(info[i]);
	}
	return tmp;
}

Quest.compressClient.highscore = function(info){
	var tmp = {};
	for(var i in info){
		tmp[i] = Highscore.compressClient(info[i]);
	}
	return tmp;
}


Quest.compressClient.requirement = function(info){
	return {
		canStartText:info.canStartText
	}
}

//#######################

Quest.getMainVarList = function(){
	var list = [];
	for(var i in DB)
		if(DB[i].inMain) list.push(i);
	return list;
};

Quest.getMainKillCount = function(){
	var tmp = {};
	for(var i = 0 ; i < ZONE.length; i++)
		tmp[ZONE[i]] = 0;
	return tmp;
}	

Quest.fetchPlayerComment = function(id){
	return;
	//var db = requi reDb();
	/*if(!db.twitter || !NODEJITSU) return;
	db.twitter.getRainingChainBotTweet(id,function(list){
		DB[id].playerComment = list;		
	});*/
}

Quest.Event = function(obj){
	var tmp = {
		_complete:CST.func,
		_start:CST.func,
		_abandon:CST.func,
		_signIn:CST.func,
		_signOff:CST.func,
		_hint:CST.func,
		_death:CST.func,
		_button:CST.func,
		_debugSignIn:CST.func,
		_getScoreMod:function(){ return 1; },	//return NUMBER
	}
	obj = obj || {};
	for(var i in obj) 
		tmp[i] = obj[i];
	return tmp;
}

Quest.RewardInfo = function(score,exp,item){	//not an attribute of quest...
	return {
		score:score === undefined ? 1 : score, 
		exp:exp === undefined ? 1 : exp, 
		item:item === undefined ? 1 : item, 
	}
}

Quest.getChallengeList = function(q){
	if(typeof q === 'string') return ERROR(3,'q needs to be object');
	var tmp = {};
	for(var i in q.challenge){
		tmp[i] = 0;
	}	
	return tmp;
}

Quest.getHighscoreList = function(q){
	if(typeof q === 'string') return ERROR(3,'q needs to be object');
	var tmp = {};
	for(var i in q.highscore){
		tmp[i] = null;
	}
	return tmp;
}

Quest.rate = function(main,quest,rating,text,abandonReason,hint){
	if(!main.quest[quest]) return;
	db.questRating.insert({
		quest:quest,
		rating:rating || 1,
		text:(text || '').slice(0,1000),
		username:main.username,
		timestamp:Date.now(),
		abandonReason:abandonReason,
		read:false,
		hint:hint,
		timeToComplete:Math.round((Date.now() - main.quest[quest]._startTime)/CST.MIN)
	});
}
//ts("Quest.updateRating(true)")
//Dialog.open('questRating','QlureKill')
Quest.updateRating = function(){
	db.questRating.aggregate([
		// {$match : {quest : 'QlureKill'} },
		{
			$group: {
				_id: "$quest",
				avgRating: { $avg: "$rating" }
			}
		},
		
	   ],
	   function(err,res){
			for(var i = 0 ; i < res.length; i++){
				if(DB[res[i]._id])
					DB[res[i]._id].rating = res[i].avgRating;
			}
	   }
	);
	var func = function(i){
		return function(err,res){
			DB[i].playerComment = res;
		}
	};
	for(var i in DB){
		db.questRating.find({quest:i,text:{$ne:""}},{_id:0,text:1,username:1}).sort({timestamp:1}).limit(5,func(i));
	}
	
	setTimeout(function(){	//BAD
		Quest.updateSignInPack();
	},10000);
}

//ts("Quest.updateStatistic('QlureKill')")
Quest.updateStatistic = function(quest){
	if(!quest){
		for(var i in DB)
			Quest.updateStatistic(i);
		return;
	}
	
	var countCompleted = 0;
	var countStarted = 0;
	var countCompletedAtLeastOnce = 0;
	
	db.mainQuest.find({quest:quest},{_id:0,_complete:1,_started:1}).forEach(function(err,res){
		if(!res){	//aka search done
			DB[quest].statistic = Quest.Statistic(countCompletedAtLeastOnce,countStarted,countCompleted/countCompletedAtLeastOnce);
			Quest.updateSignInPack(quest);
			return;
		}
		countCompleted += res._complete;
		if(res._complete) 
			countCompletedAtLeastOnce++;
		countStarted += res._started;
	});
}

Quest.getQuestRating = function(key,readToo){
	var query = {}; //text:{$ne:""}};
	if(!readToo)
		query.read = false;
	
	var param = {list:[]};
	db.questRating.find(query).forEach(function(err,doc){
		if(!doc) return Main.openDialog(Main.get(key),'adminQuestRating',param);
		param.list.push(doc);
	});
}

Quest.setQuestRatingAsRead = function(){
	db.questRating.update({read:false},{$set:{read:true}},{multi:true})
}







