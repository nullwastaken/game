//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Highscore = require2('Highscore'), Debug = require2('Debug'), Challenge = require2('Challenge');
var db;
var QUEST_FOLDER = './client/quest/';
var QUEST_EXCLUDE = ['QkillTheDragon'];

var SIGN_IN_PACK = {};

var Quest = exports.Quest = {};
Quest.create = function(extra){
	//Quest.getAPItemplate for template
	var tmp = {};	
	for(var i in extra) tmp[i] = extra[i];
	DB[tmp.id] = tmp;
	Debug.createQuestTool(tmp);
	//Quest.fetchPlayerComment(q.id);
	SIGN_IN_PACK[tmp.id] = Quest.compressClient(tmp,false);
	return tmp;
}

var DB = Quest.DB = {};

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
	};
	for(var i in extra)
		tmp[i] = extra[i];
	tmp.reward = Quest.Reward(tmp.reward);
	return tmp;
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

//#######################

Quest.init = function(dbLink){	//init Module
	db = dbLink;
	
	var filePath = require('path').resolve(__dirname,QUEST_FOLDER + 'QuestList.txt');
	var questList = require('fs').readFileSync(filePath);
	var QUEST_ID_LIST = questList.toString().trim().replaceAll('\r\n','\n').split('\n');
	
	if(NODEJITSU){
		for(var i in QUEST_EXCLUDE){
			QUEST_ID_LIST.$remove(QUEST_EXCLUDE[i]);
		}
	}
	
	
	for(var i in QUEST_ID_LIST){
		var qid = QUEST_ID_LIST[i];
		if(!qid) continue;	//in case split mess up...
		var req;
		try {
			req = require(QUEST_FOLDER+qid + "/" + qid);
		} catch(err){ 
			INFO(2,'error with quest file ' + qid + '. Note: NEVER delete a quest folder manually. Use Quest creator.\r\n');
			INFO(err.stack)
			return;
		}
		
		var q = Quest.create(req.quest);
		if(q.id !== qid) 
			return ERROR(2,'quest filename doesnt match quest id',q.id,qid);
	}
	setInterval(function(){
		Quest.updateStatistic();
	},CST.HOUR*4);
	Quest.updateStatistic();	
}

Quest.get = function(id){
	return DB[id] || null;
}

Quest.getSignInPack = function(){
	return SIGN_IN_PACK;
}
	
Quest.compressClient = function(quest,full){ //decompression in QueryDb.uncompressQuest. not being cheap bandwidth...
	full = true;	
	if(!full){
		return {
			name:quest.name,
			author:quest.author,
			description:quest.description,
			thumbnail:quest.thumbnail,
			showInTab:quest.showInTab,
			isPartialVersion:true,
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
		quest.category
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

//#######################

Quest.getMainVarList = function(){
	var list = [];
	for(var i in DB)
		if(DB[i].inMain) list.push(i);
	return list;
};

Quest.fetchPlayerComment = function(id){
	return;
	//var db = requi reDb();
	/*if(!db.twitter || !NODEJITSU) return;
	db.twitter.getOwn(id,function(list){
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
	for(var i in obj) tmp[i] = obj[i];
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

Quest.rate = function(main,quest,rating,text,abandonReason){
	if(!main.quest[quest]) return;
	db.questRating.insert({
		quest:quest,
		rating:rating || 1,
		text:(text || '').slice(0,1000),
		username:main.username,
		timestamp:Date.now(),
		abandonReason:abandonReason,
	})
}
//ts("Quest.updateRating(true)")
//Dialog.open('questRating','QlureKill')
Quest.updateRating = function(){
	db.questRating.aggregate([
		//{$match : {quest : 'QlureKill'} },
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
	
	for(var i in DB){
		var func = function(i){
			return function(err,res){
				DB[i].playerComment = res;
			}
		};
		
		db.questRating.find({quest:i},{_id:0,text:1,username:1}).sort({timestamp:1}).limit(2,func(i));
	}
	/*
	db.questRating.aggregate([
		{$match : {quest : 'QlureKill'} },
		{$sort:},
		{$limit:2},
		{$projection:{text:1,username:1}},
	],function(err,res){
		
	});
	*/
	
	
	
	//}
}




//ts("Quest.updateStatistic('QlureKill')")
Quest.updateStatistic = function(i){
	if(!i){
		for(var quest in DB)
			Quest.updateStatistic(quest);
		return;
	}
	
	var countCompleted = 0;
	var countStarted = 0;
	var countCompletedAtLeastOnce = 0;
	
	db.mainQuest.find({quest:i},{_id:0,_complete:1,_started:1}).forEach(function(err,res){
		if(!res){	//aka search done
			DB[i].statistic = Quest.Statistic(countCompletedAtLeastOnce,countStarted,countCompleted/countCompletedAtLeastOnce);
			return;
		}
		countCompleted += res._complete;
		if(res._complete) countCompletedAtLeastOnce++;
		countStarted += res._started;
	});
}





