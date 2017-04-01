
"use strict";
var Server;
global.onReady(function(initPack){
	Server = rootRequire('private','Server');
	db = initPack.db;
},{db:['highscore']});

var Highscore = exports.Highscore = function(extra){
	this.quest = '';
	this.id = '';
	this.name = '';
	this.description = '';
	this.order = CST.HIGHSCORE.descending; 
	this.getScore = null; //function(key):number? 	null is no score
	Tk.fillExtra(this,extra);
};
var db = null;

var SIGN_IN_PACK = {};

//QueryDb.get('highscore','Qbtt000-speedrun')
//Socket.emit(CST.SOCKET.queryDbAnswer, QueryDb.create('highscore','Qbtt000-speedrun'));
//ts("Quest.DB['QlureKill'].highscore['QlureKill-_score'].getScore.toString()")

Highscore.create = function(quest,id,name,description,order,getScore){
	if(order !== CST.HIGHSCORE.ascending && order !== CST.HIGHSCORE.descending)
		ERROR(3,'invalid highscore order',order);
	
	var tmp = new Highscore({
		quest:quest,
		id:id,
		name:name,
		description:description,
		order:order, 
		getScore:getScore,
	});
	
	DB[id] = tmp;
	SIGN_IN_PACK[id] = Highscore.compressClient(tmp);
	return tmp;
}

var DB = Highscore.DB = {};

Highscore.get = function(id){
	return DB[id] || null;
}


Highscore.Score = function(category,rank,value,username,name){
	return {
		category:category,	
		rank:rank,
		value:value,
		username:username,
		name:name,
	}
}

Highscore.fetchTopScore = function(db,category,cb,amount,order){	//return [Highscore.Score]
	amount = amount || 15;
	var req = {category:category,value:{$ne:null}};
	var proj = {username:1,name:1,value:1};
	order = order || DB[category].order; //case for home page, DB isnt defined
	var sort = {value:order === CST.HIGHSCORE.ascending ? 1 : -1};	
	
	db.highscore.find(req,proj).limit(amount).sort(sort,function(err,res){
		if(err)
			return cb([]);
		var tmp = [];
		for(var i = 0; i < res.length; i++){
			tmp.push(Highscore.Score(category,i+1,res[i].value,res[i].username,res[i].name));
		}
		cb(tmp);
	});	
}



Highscore.fetchScore = function(category,username,name,cb){
	Highscore.fetchValue(category,username,function(value){
		var req = {
			value:DB[category].order === CST.HIGHSCORE.ascending ? 
				{$lt: value || CST.BIG_INT,$ne:null} :
				{$gt: value || 0,$ne:null},
			category:category,
		}
		db.highscore.find(req).count(function(err,result){
			cb(Highscore.Score(category,result+1,value,username,name));
		});
	});
}

Highscore.fetchValue = function(category,username,cb){
	db.highscore.findOne({username:username,category:category},{value:1},function(err,res){ if(err) ERROR.err(3,err);
		cb(res ? res.value || null : null);
	});
}

Highscore.fetchTop15AndSelf = function(category,username,name,cb){
	Highscore.fetchTopScore(db,category,function(list){
		for(var i = 0; i < list.length; i++){
			if(list[i].username === username) 
				return cb(list);	//player is part of the list		
		}
		Highscore.fetchScore(category,username,name,function(res){
			list.push(res);
			cb(list);		
		});	
	},15);
}

Highscore.getQuest = function(str){
	return Tk.getSplit0(str,'-');
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

Highscore.compressDb = function(category,value,username,name){
	var tmp = {
		category:category,
		value:value,
		username:username,
		name:name,
	}
	if(!Highscore.getDbSchema()(tmp))
		ERROR(3,'data not following schema',JSON.stringify(Highscore.getDbSchema().errors(tmp)),tmp);
	return tmp;
}

Highscore.uncompressDb = function(tmp){	//unsued
	if(!Highscore.getDbSchema()(tmp))
		ERROR(3,'data not following schema',JSON.stringify(Highscore.getDbSchema().errors(tmp)),tmp);
	return tmp;
}

var schema;
Highscore.getDbSchema = function(){
	schema = schema || require('js-schema')({
		category : String,
        value : Number,
        username : String,
		name:String,
		'*':null
	});
	return schema;
};

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
		
		ret[i] = Highscore.setNewScore.Response(score,mq.highscore[i]);
		
		if(mq.highscore[i] === null
			|| (q.highscore[i].order === CST.HIGHSCORE.ascending && score < mq.highscore[i])
			|| (q.highscore[i].order === CST.HIGHSCORE.descending && score > mq.highscore[i])){
			mq.highscore[i] = score.r(4);
			Highscore.saveScore(i,mq.highscore[i],main.username,main.name);
		}
	}
	return ret;
}

Highscore.setNewScore.Response = function(score,previousBestScore){
	return {
		score:score,
		previousBestScore:previousBestScore
	};
}

Highscore.saveAllScore = function(main,cb){
	var maxcount = 0;
	var count = 0;
	for(var i in main.quest){
		for(var j in main.quest[i].highscore){
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
		for(var j in main.quest[i].highscore){
			Highscore.saveScore(j,main.quest[i].highscore[j],main.username,main.name,func);
		}
	}
	if(maxcount === 0){
		ERROR(3,'highscore count is 0 wtf',main.quest,main.id);
		cb();
	}
}

Highscore.saveScore = function(category,value,username,name,cb){
	if(value === null || Server.isAdmin(null,username,true)){	//BAD
		if(cb) cb();
		return;
	}
	db.highscore.upsert(
		{username:username,category:category},
		Highscore.compressDb(category,value,username,name),
		cb || db.err
	);	
}



//no dependencies
Highscore.getHomePageContent = function(db){
	if(Date.now() - LAST_UPDATE > 60000){
		LAST_UPDATE = Date.now();
		Highscore.fetchTopScore(db,'Qhighscore-questCount',function(list){
			CONTENT = list;
		},5,CST.HIGHSCORE.descending);
	}
	return CONTENT;
}

var CONTENT = {};
var LAST_UPDATE = -1;



