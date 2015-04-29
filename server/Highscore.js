//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Server = require2('Server');

var db = null; //Highscore.init

var SIGN_IN_PACK = {};

//QueryDb.get('highscore','Qbtt000-speedrun')
//Socket.emit('queryDb', QueryDb.create('highscore','Qbtt000-speedrun'));
//ts("Quest.DB['QlureKill'].highscore['QlureKill-_score'].getScore.toString()")
var Highscore = exports.Highscore = {};
Highscore.create = function(quest,id,name,description,order,getScore){	//constructor
	var tmp = {
		quest:quest,
		id:id || '',
		name:name || 'name',
		description:description || 'description',
		order:order || 'ascending', //or descending
		getScore:getScore || function(key){ return null; },	//return number or null is no score
	};
	
	DB[id] = tmp;
	SIGN_IN_PACK[id] = Highscore.compressClient(tmp);
	return tmp;
}

var DB = Highscore.DB = {};

Highscore.get = function(id){
	return DB[id] || null;
}

Highscore.init = function(dbLink,app){
	db = dbLink;
}

Highscore.Score = function(category,rank,value,username){
	return {
		category:category,	
		rank:rank,
		value:value,
		username:username,	
	}
}

Highscore.fetchTopScore = function(category,cb,amount){	//return [Highscore.Score]
	amount = amount || 15;
	var req = {category:category,value:{$ne:null}};
	var proj = {username:1,value:1};
	var sort = {value:DB[category].order === 'ascending' ? 1 : -1};	
	
	db.highscore.find(req,proj).limit(amount).sort(sort,function(err,res){
		var tmp = [];
		for(var i = 0; i < res.length; i++){
			tmp.push(Highscore.Score(category,i+1,res[i].value,res[i].username));
		}
		cb(tmp);
	});	
}

Highscore.fetchScore = function(category,username,cb){
	Highscore.fetchValue(category,username,function(value){
		var req = {
			value:DB[category].order === 'ascending' ? 
				{$lt: value || CST.bigInt,$ne:null} :
				{$gt: value || 0,$ne:null},
			category:category,
		}
		db.highscore.find(req).count(function(err,result){
			cb(Highscore.Score(category,result+1,value,username));
		});
	});
}

Highscore.fetchValue = function(category,username,cb){
	db.highscore.findOne({username:username,category:category},{value:1},function(err,res){ if(err) ERROR.err(3,err);
		cb(res ? res.value || null : null);
	});
}

Highscore.fetchTop15AndUser = function(category,username,cb){
	Highscore.fetchTopScore(category,function(list){
		for(var i in list){
			if(list[i].username === username) return cb(list);	//player is part of the list		
		}
		Highscore.fetchScore(category,username,function(res){
			list.push(res);
			cb(list);		
		});	
	},15);
}

Highscore.getQuest = function(str){
	return str.split('-')[0];
}

Highscore.getCategory = function(str){
	return str.split('-')[1];
}

Highscore.getSignInPack = function(){
	return SIGN_IN_PACK;
}

Highscore.compressClient = function(highscore,score){	//score == null for SignInPack
	return [
		highscore.name,
		highscore.description,
		highscore.quest,
		highscore.id,
		score || null,
		score === null,
		Date.now(),
	];
}

Highscore.compressDb = function(category,value,username){
	return {
		category:category,
		value:value,
		username:username,
	}
}

Highscore.setNewScore = function(q,main,mq){
	/*var ret = {
		fastestTime:{score:2,previousBestScore:2312},
	};*/
	var ret = {};
	if(main.username === Server.ADMIN_RC) 	//BADDDD
		return ret;
	for(var i in q.highscore){
		var score = q.highscore[i].getScore(main.id);
		if(typeof score !== 'number' || isNaN(score)) 
			continue;
		
		ret[i] = Highscore.setNewScore.response(score,mq._highscore[i]);
		
		if(mq._highscore[i] === null
			|| (q.highscore[i].order === 'ascending' && score < mq._highscore[i])
			|| (q.highscore[i].order === 'descending' && score > mq._highscore[i])){
			mq._highscore[i] = score.r(4);
			Highscore.saveScore(i,mq._highscore[i],main.username);
		}
	}
	return ret;
}
Highscore.setNewScore.response = function(score,previousBestScore){
	return {
		score:score,
		previousBestScore:previousBestScore
	};
}


Highscore.saveAllScore = function(main,cb){
	var maxcount = 0;
	var count = 0;
	for(var i in main.quest){
		for(var j in main.quest[i]._highscore){
			maxcount++;	//need own loop otherwise fuck ++count === maxcount cuz cb can be sync if value === null
		}
	}
	var func = function(err){
		if(err) ERROR.err(3,err);
		if(++count === maxcount){
			if(cb) cb();
		}
	};
	for(var i in main.quest){
		for(var j in main.quest[i]._highscore){
			Highscore.saveScore(j,main.quest[i]._highscore[j],main.username,func);
		}
	}
	if(maxcount === 0){
		ERROR(3,'highscore count is 0 wtf',main.quest,main.id);
		cb();
	}
}

Highscore.saveScore = function(category,value,username,cb){
	if(value === null || Server.isAdmin(null,username,true)){	//BAD
		if(cb) cb();
		return;
	}
	db.highscore.upsert(
		{username:username,category:category},
		Highscore.compressDb(category,value,username),
		cb || db.err
	);	
}

Highscore.getHomePageRank = function(){
	if(Date.now() - Highscore.getHomePageRank.LAST_UPDATE > CST.MIN*5)
		Highscore.getHomePageRank.update();
	return Highscore.getHomePageRank.INFO;
}

Highscore.getHomePageRank.update = function(){
	Highscore.fetchTopScore('Qhighscore-questCount',function(list){
		Highscore.getHomePageRank.INFO = list;
	},5);
}

Highscore.getHomePageRank.INFO = {};

Highscore.getHomePageRank.LAST_UPDATE = -1;



