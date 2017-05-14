
"use strict";
var Actor, Achievement, Highscore, Main, Debug, Challenge, Reddit;
global.onReady(function(initPack){
	Reddit = SERVER && !MINIFY && rootRequire('private','Reddit'); Actor = rootRequire('shared','Actor'); Achievement = rootRequire('shared','Achievement'); Highscore = rootRequire('server','Highscore'); Main = rootRequire('shared','Main'); Debug = rootRequire('server','Debug'); Challenge = rootRequire('server','Challenge');
	db = initPack.db;
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.questButton,Command.MAIN,[ //{
		Command.Param('string','Button Id',false),
	],function(main,str){
		if(!main.questActive) return;
		Quest.get(main.questActive).event._button(main.id,str);
	}); //}

	Command.create(CST.COMMAND.dialogOpen,Command.MAIN,[ //{	//only for Qtutorial, check Dialog.open
		Command.Param('string','Dialog Id',false),
	],function(main,str){
		if(main.questActive !== CST.QTUTORIAL) return;
		Quest.get(main.questActive).event._dialogOpen(main.id,str);
	}); //}

	Command.create(CST.COMMAND.dialogClose,Command.MAIN,[ //{	//only for Qtutorial, check Dialog.open
		Command.Param('string','Dialog Id',false),
	],function(main,str){
		if(main.questActive !== CST.QTUTORIAL) 
			return;
		Quest.get(main.questActive).event._dialogClose(main.id,str);
	}); //}
	Command.create(CST.COMMAND.getTutorialHelp,Command.MAIN,[ //{ 
	],function(main){
		if(main.questActive !== CST.QTUTORIAL)
			return;
		var str = Quest.get(CST.QTUTORIAL).event._help(main.id);
		Main.openDialog(main,'permPopupMouseover',{text:str});
	}); //}
	Command.create(CST.COMMAND.questFeedback,Command.MAIN,[ //{
		Command.Param('string','Quest Id',false),
		Command.Param('number','Rating',true,{min:0,max:3}),
		Command.Param('string','Comment',true),
		Command.Param('string','Abandon Reason',true),
		Command.Param('string','Hint',true),
	],Quest.rate.onCommand); //}
	
},{db:['questRating','mainQuest']},'Quest',['SpriteModel','AnimModel'],function(){
	Quest.init();
});
var ONLINE_QUEST_LIST = [
	"Qsystem","QfirstTown","Qdebug","QsideQuest",
	"Qcontribution","Qhighscore",	
	//TODO
];

var Quest = exports.Quest = function(extra){
	//considering i create the things on the fly; its useless except for sutff in loadAPI
	this.id = '';
	this.version = 'v1.0';
	this.name = 'Default Name';
	this.reward = Quest.Reward();
	this.showInTab = true;
	this.sideQuestAllowed = false;
	this.showWindowComplete = true;
	this.dailyTask = true;
	this.inMain = true;	//in Main.get(key).quest
	this.globalHighscore = false;	//call updateHighscore everytime a quest complete
	this.alwaysActive = false;	//can call event without being questActive (ex: town)
	this.admin = false;		//allow extra in item, ability
	this.autoStartQuest = true;
	this.disabled = false;
	this.maxPartySize = 2;
	this.recommendedPartySize = 2;
	this.author = 'rc';
	this.description = 'A super awesome quest!';
	this.thumbnail = false;
	this.scoreModInfo = '';
	this.lvl = 0;
	this.difficulty = 'Easy';
	this.rating = 0;
	this.statistic = Quest.Statistic();
	this.playerComment = [];
	this.category = [];
	this.party = "Coop";
	this.zone = null;
	this.mainStory = false;
	this.loadingPrerequisite = [];
	this.completable = true;
	this.requirement = {};
	this.questMarker = null;	// {map,spot}
	this.mapAddon = {};
	this.map = {};
	this.item = {};
	this.equip = {};
	this.npc = {};
	this.ability = {};
	this.dialogue = {};
	this.boss = {};
	this.challenge = {};
	this.sideQuest = {};
	this.preset = {};
	this.highscore = {};
	this.event = Quest.Event();
	this.skillPlot = [];
	this.path = {};
	this.s = null;	//set in s.exports
	Tk.fillExtra(this,extra);
};

Quest.create = function(extra){
	//Quest.getAPItemplate for template

	DB[extra.id] = extra;
	Debug.createQuestTool(extra);
	//Quest.fetchPlayerComment(q.id);
	
	return extra;
}

Quest.getAPItemplate = function(extra){
	if(extra.reward)
		extra.reward = Quest.Reward(extra.reward);
	if(!extra.id || extra.id[0] !== 'Q')
		return ERROR(1,'quest needs to start with Q',extra.id);
	if(extra.recommendedPartySize === undefined)
		extra.recommendedPartySize = extra.maxPartySize;
	
	var tmp = new Quest(extra);
	
	
	if(tmp.zone && !ZONE.$contains(tmp.zone))
		return ERROR(3,'invalid zone',tmp.zone);
	
	//tmp.requirement = Quest.Requirement(tmp.requirement); //called in Quest.init cuz depends on other quest
	
	if(!Quest.Party(tmp.party)) 
		return ERROR(3,'invalid party param',tmp.party);
	if(!Quest.Category(tmp.category)) 
		return ERROR(3,'invalid category param',tmp.category);

	return tmp;
}

var db;
var QUEST_FOLDER = './quest/';
var QUEST_EXCLUDE = ['tileset'];


var ZONE = ['QfirstTown-west','QfirstTown-south','QfirstTown-main','QfirstTown-east','QfirstTown-eastCave','QfirstTown-north'];

var SIGN_IN_PACK = {};
var SIGN_IN_PACK_RATING = null;	//set in getRatingSignInPack

var DB = Quest.DB = {};

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
		score:reward.score === undefined ? 1 : reward.score,
		completion:reward.completion === undefined ? 1 : reward.completion,
		monster:reward.monster === undefined ? 1 : reward.monster,
	};
}

Quest.Statistic = function(countComplete,countStarted,averageRepeat){
	return {
		countComplete:countComplete || 0,
		countStarted:countStarted || 0,
		averageRepeat:averageRepeat || 0,
	}
}

Quest.isValidZone = function(name){
	return ZONE.$contains(name);
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
			if(!Main.haveCompletedQuest(main,a.questComplete[i]))
				return false;
				
		if(Actor.getLevel(Main.getAct(main)) < a.lvl)
			return false;
		if(Main.getCompletedAchievementCount(main) < a.achievementCount)
			return false;
		for(var i = 0 ; i < a.achievementComplete.length; i++)
			if(!Main.haveCompletedAchievement(main,a.achievementComplete[i]))
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

Quest.init = function(){
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
		var req = null;
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
			ERROR(2,'quest filename doesnt match quest id',q.id,qid);
	}
	
	
	for(var i in DB){
		DB[i].requirement = Quest.Requirement(DB[i].requirement);
		SIGN_IN_PACK[i] = Quest.compressClient(DB[i],false);
	}
	Quest.updateStatistic();
	Quest.updateRating();
}

Quest.get = function(id){
	return DB[id] || null;
}

Quest.getSignInPack = function(){
	return SIGN_IN_PACK;
}

Quest.getRatingSignInPack = function(){
	if(SIGN_IN_PACK_RATING)
		return SIGN_IN_PACK_RATING;
	SIGN_IN_PACK_RATING = {};
	for(var i in DB){
		SIGN_IN_PACK_RATING[i] = {
			rating:DB[i].rating,
			statistic:DB[i].statistic
		}
	}
	return SIGN_IN_PACK_RATING;
}	

Quest.compressClient = function(quest){ //decompression in QueryDb.uncompressQuest. 
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
		quest.showInTab,
		false,
		quest.category,
		Quest.compressClient.requirement(quest.requirement),
		quest.maxPartySize,
		quest.recommendedPartySize,
		quest.mainStory,
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

Quest.getDefaultVariable = function(){
	var list = {};
	for(var i in DB){
		if(DB[i].inMain){
			list[i] = Main.Quest.Part(DB[i]);
		}
	}
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
		_death:CST.func,		//function(key,killer,partyDead): boolean
		_respawn:CST.func,		//when manually click revive button. revive by teammate doesnt count
		_button:CST.func,
		_getScoreMod:function(){ return 1; },	//return NUMBER
	}
	obj = obj || {};
	for(var i in obj) 
		tmp[i] = obj[i];
	return tmp;
}

Quest.getChallengeList = function(q){
	if(typeof q === 'string') return ERROR(3,'q needs to be object');
	var tmp = {};
	for(var i in q.challenge){
		tmp[i] = false;
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
	var timeComplete = main.quest[quest] ? Math.round((Date.now() - main.quest[quest].startTime)/CST.MIN) : 0;

	db.questRating.insert({
		quest:quest,
		rating:rating || 0,	//0 means no rating, only feedback
		text:(text || '').slice(0,1000),
		username:main.username,
		timestamp:Date.now(),
		abandonReason:abandonReason,
		read:false,
		hint:hint,
		timeToComplete:timeComplete
	});
}
Quest.addGeneralFeedback = function(main,text){
	Quest.rate(main,CST.GENERAL_FEEDBACK,0,text,null,null);
}

Quest.rate.onCommand = function(main,quest,rating,text,abandonReason,hint){
	var username = main.username;
	var name = main.name;
	if(!main.quest[quest])
		return;
	if(rating === 0)
		Quest.rate(main,quest,rating,text,abandonReason,hint);
	else {
		Quest.canRate(username,quest,function(res){
			if(res)
				Quest.rate(main,quest,rating,text,abandonReason,hint);
		});
	}
	
	if(!Reddit || !Reddit.isInit() || !Reddit.isValidParent(quest)) 
		return Main.addMessage(main,'Thanks for your feedback.');
	
	if(!text.trim() || text.length > 10000)
		return;
	var str = name + ' says: ' + text;
	Reddit.comment(quest,str);	
	var url = Reddit.getUrlParent(quest);
	Main.addMessage(main,'Thanks for your feedback. <a class="message" href="' + url + '" target="_blank">Check your comment here.</a>');
}

Quest.canRate = function(username,quest,cb){
	db.questRating.findOne({
		username:username,
		quest:quest,
	},function(err,res){
		cb(!res);
	});
}

Quest.setQuestMarker = function(qid,spot){
	DB[qid].questMarker = Quest.QuestMarker(spot.x,spot.y,spot.mapModel);
}

Quest.QuestMarker = function(x,y,map){
	return {x:x,y:y,map:map};	//BAD...
}

//ts("Quest.updateRating(true)")
//Dialog.open('questRating','QlureKill')
Quest.updateRating = function(){
  return;
	db.questRating.aggregate([
		{ 
			$match: {
				rating: { $gt: 0 }
			}
		},
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
	/*
	var func = function(i){
		return function(err,res){
			DB[i].playerComment = res;
		}
	};
	for(var i in DB){
		db.questRating.find({quest:i,text:{$ne:""}},{_id:0,text:1,username:1})
			.sort({timestamp:1})
			.limit(5,func(i));
	}
	*/
}

//ts("Quest.updateStatistic('QlureKill')")
Quest.updateStatistic = function(quest){
  return;
	if(!quest){
		for(var i in DB)
			Quest.updateStatistic(i);
		return;
	}
	
	var countCompleted = 0;
	var countStarted = 0;
	var countCompletedAtLeastOnce = 0;
	
	db.mainQuest.find({quest:quest},{_id:0,complete:1,started:1}).forEach(function(err,res){
		if(!res){	//aka search done
			DB[quest].statistic = Quest.Statistic(countCompletedAtLeastOnce,countStarted,countCompleted/countCompletedAtLeastOnce);
			return;
		}
		countCompleted += res.complete;
		if(res.complete) 
			countCompletedAtLeastOnce++;
		countStarted += +res.started;
	});
}

Quest.getQuestFeedback = function(key,readToo){	//admin
  return;
	var query = {}; //text:{$ne:""}};
	if(!readToo)
		query.read = false;
	
	var param = {list:[]};
	db.questRating.find(query).forEach(function(err,doc){
		if(!doc) 
			return Main.openDialog(Main.get(key),'adminQuestFeedback',param);
		param.list.push(doc);
	});
}

Quest.setQuestRatingAsRead = function(){	//admin
	db.questRating.update({read:false},{$set:{read:true}},{multi:true});
}







