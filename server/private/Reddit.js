//ts("require('./../private/Reddit').init('')")
var PARENT = {
	general:'t3_34dhzi',	//CST.GENERAL_FEEDBACK
	QlureKill:'t3_34ddox',
	QbaseDefence: 't3_34fmcb',
	Qbtt000: 't3_34fmch',
	QbulletHeaven: 't3_34fmcn',
	QcatchThemAll: 't3_34fmcr',
	QcollectFight: 't3_34fmcy',
	Qdarkness: 't3_34fmd4',
	QduelLeague: 't3_34fmdc',
	Qfifteen: 't3_34fmdg',
	QkingOfTheHill: 't3_34fmdo',
	Qminesweeper: 't3_34fme2',
	QprotectFirstTown: 't3_34fme6',
	QpuzzleBridge: 't3_34fmeh',
	QpuzzleSwitch: 't3_34fmer',
	Qrgb: 't3_34fmeu',
	QsadTree: 't3_34fmey',
	Qsoccer: 't3_34fmf2',
	QtowerDefence: 't3_34fmfb',
	Qtutorial: 't3_34fmfj',
	QlockedMemento:'t3_36567h',
	
	QbadLuck:'t3_37wrwu',
	Qbtt001:'t3_37ws1c',
	Qspawner:'t3_37ws4v',
	QflipTile:'t3_37ws70',
	QbossBattle:'t3_381dxi',
}
var CREDENTIALS = {
	username: "RainingChainBot",
	password: ""
};
var STATE = "RainingChain app by RainingChainBot";
var reddit;

var INIT = false;

var Submission = function(title,text){
	return {
		title: title,
		text: text,
		r: "rainingchain",
		inboxReplies: false,
		save: false,
	};
}

var CB = function(err, id) {
	if(err && err !== 503) 
		return ERROR(2,"Unable to submit post: " + err);
};

var WAIT_LIST = [];

var auth = function(cb){
	if(!INIT)
		return ERROR(3,'reddit isnt init');
	WAIT_LIST.push(cb);
}

auth.real = function(cb){
	reddit.auth(CREDENTIALS, function(err, response) {
		if (err){
			if(err !== 503) 
				return ERROR(2,"Unable to authenticate reddit user: " + err);
			return
		}
		reddit.captchaNeeded(function(err, required) {
			if (err) 
				return ERROR(2,"captchaNeeded failed: " + err);
			if (required)
				return ERROR(2,"can not submit because captcha is needed");
			cb();
		});
	});
}


var Reddit = exports.Reddit = {};
Reddit.comment = function(p,text,cb){
	var parent = PARENT[p];
	if(!parent) 
		return ERROR(3,'invalid parent reddit',p);
	
	auth(function(){
		reddit.comment(parent,text,cb || CB); 
	});
	
}
Reddit.isInit = function(){
	return INIT;
}


Reddit.submit = function(title,text,cb){
	var submisson = Submission(title,text);
	
	auth(function(){
		reddit.submit(submisson,cb || CB); 
	});
}

Reddit.isValidParent = function(id){
	return !!PARENT[id];
}

Reddit.loop = function(){
	if(WAIT_LIST[0]){
		auth.real(WAIT_LIST[0]);
		WAIT_LIST.shift();
	}
}

Reddit.getUrlParent = function(id){
	var str = PARENT[id];
	if(!str) return null;
	return 'http://redd.it/' + str.slice(3);
}	

exports.init = function(pass){
	return; //TODO
	CREDENTIALS.password = pass;
	var rawjs = require('raw.js');
	reddit = new rawjs(STATE);	
	//
	INIT = true;
	setInterval(Reddit.loop,2000);
	
}
/*
exports.init2 = function(){
	var tmp = {
		"Base Defence": "Kill waves of monsters before they reach your base using the right ability. Play for free at http://rainingchain.com/.",
		"Break Targets": "Find the fastest way to break 10 targets. Play for free at http://rainingchain.com/.",
		"Bullet Heaven": "Survive as long as you can in a cave filled with deadly towers. Play for free at http://rainingchain.com/.",
		"Catch Them All": "Catch monsters by first weakening them. When the time runs out, use them to kill the boss. Play for free at http://rainingchain.com/.",
		"Collect & Fight": "In a parallel universe, you're a pumpking harvesting resources to become stronger in preparation for an epic battle. Play for free at http://rainingchain.com/.",
		"Darkness": "Retrieve a precious object lost in a mysterious cave haunted by ghosts. Play for free at http://rainingchain.com/.",
		"Duel League": "Kill enemies in your zone to send enemies in your rivals' zone until they die. Play for free at http://rainingchain.com/.",
		"15-Puzzle": "Place 15 blocks in the right order by pushing them. Play for free at http://rainingchain.com/.",
		"King of the Hill": "Stay on the hill as long as possible while killing rivals. Play for free at http://rainingchain.com/.",
		"Minesweeper": "Play the puzzle game minesweeper. Play for free at http://rainingchain.com/.",
		"Protect Town": "Protect villagers from waves of monsters. Play for free at http://rainingchain.com/.",
		"Puzzle & Bridge": "Puzzle where you need to move blocks to form a bridge. Play for free at http://rainingchain.com/.",
		"Puzzle & Switch": "Activate switches and push blocks to complete 5 puzzles. Play for free at http://rainingchain.com/.",
		"RGB": "You must restore the RGB setting by activating 2 switches guarded by enemies. Play for free at http://rainingchain.com/.",
		"Sad Tree": "A NPC that has been transformed into a tree sends you in a quest to retrieve its normal form. Play for free at http://rainingchain.com/.",
		"Soccer": "Play soccer against your friends! Push the ball in the goal to score. Play for free at http://rainingchain.com/.",
		"Tower Defence": "Place towers to kill waves of enemies trying to reach the bottom of the screen. Play for free at http://rainingchain.com/.",
		"GPS Tutorial": "Teaches you the basic of GAME_NAME. Play for free at http://rainingchain.com/."
	};
	var res = {};
	for(var i in tmp){
		Reddit.submit('Quest: ' + i,tmp[i],(function(i){
			return function(err,id){
				if(err) throw err;
				res[i] = 't3_' + id;
			}
		})(i));
	}
}
*/
/*
exports.init3 = function(pass){
	var list = [
		{"quest" : "Qtutorial", "text" : "There is no difference between a bow, mace and staff? Maybe I was doing something wrong", "username" : "yunaSummoner" },
	];
	for(var i = 0 ; i < list.length; i++){
		var str = list[i].username + ' says: ' + list[i].text;
		Reddit.comment(list[i].quest,str);
	}
}
*/