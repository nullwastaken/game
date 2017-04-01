
"use strict";
(function(){ //}
var Actor, Highscore, QuestVar, Socket, Main;
global.onReady(function(initPack){
	Actor = rootRequire('shared','Actor'); Highscore = rootRequire('server','Highscore'); QuestVar = rootRequire('server','QuestVar'); Socket = rootRequire('private','Socket'); Main = rootRequire('shared','Main');
	db = initPack.db;
},{db:['account','main','mainQuest','player','questVar','highscore','achievement','sideQuest']});

var Save = exports.Save = {};

var db = null;

var LOOP_INTERVAL = Math.round(60*1000/40);
var FRAME_COUNT = 0;

//BAD not constructor
Save.create = function(key,accountToo,cb){	//51 ms to save
	try {
		return Save.create.main(key,accountToo,cb);
	}catch(err){ ERROR.err(3,err);}
}
Save.create.main = function(key,accountToo,cb){
	Save.main(Main.get(key),function(err){ if(err) throw err;
		Save.player(Actor.get(key),function(err){ if(err) throw err;
			if(accountToo === false) 
				return cb ? cb() : null;
			Save.account(Socket.get(key),function(err){ if(err) throw err;
				if(cb) 
					cb();
			});				
		});
	})
}	


Save.onSignOff = function(key,cb){
	Save.create(key,true,cb);
}
Save.onServerReset = function(key,cb){
	Save.create(key,true,cb);
}

Save.loop = function(key){
	FRAME_COUNT++;
	if(FRAME_COUNT % LOOP_INTERVAL !== 0) 
		return;
	Save.create(key,false);    		//save progression
}


Save.account = function(socket,cb){
	if(!socket) return ERROR(3,'no socket');
	var username = socket.username;
	
	var time = Socket.getTimePlayedSinceLastCall(socket);
	db.account.update({username:username},{
		'$set':{online:0},
		'$inc':{timePlayedTotal:time,timePlayedThisWeek:time}
	},cb || db.err);
}

Save.player = function(player,cb){
	if(!player) return ERROR(3,'no player?');
	var save = Actor.compressDb(Tk.deepClone(player));
	if(!save) return ERROR(3,'compress result is null');
	
    db.player.upsert({username:player.username},save,cb || db.err);
}

Save.main = function(main,cb){
	if(!main) return ERROR(3,'no main?');
	var save = Main.compressDb(Tk.deepClone(main));	//must keep main intact for other saves
	if(!save) return ERROR(3,'compress result is null');
	
	db.main.upsert({username:main.username},save,function(err){
		Save.main.highscore(main,function(err){
			Save.main.questVar(main,function(err){
				Save.main.achievement(main,function(err){
					Save.main.sideQuest(main,function(err){
						Save.main.mainQuest(main,cb || db.err);	
					});
				});
			});		
		});
	});
}

Save.main.highscore = function(main,cb){
	if(!main) return ERROR(3,'no main?');
	Highscore.saveAllScore(main,cb);
}

Save.main.questVar = function(main,cb){
	if(!main.questActive) return cb();
	var toSave = QuestVar.getViaMain(main);
	if(!toSave){ 
		ERROR(3,'nothing from QuestVar getViaMain',main.questActive,QuestVar.LIST); 
		if(cb) cb(); 
		return;
	}
	db.questVar.upsert({username:main.username,quest:main.questActive},toSave,cb || db.err);
}

Save.main.mainQuest = function(main,cb){
	var countTotal = 0;
	var count = 0;
	
	var dbcb = function(err){ if(err) throw err;
		if(++count === countTotal){
			if(cb) cb();
		}
	};
	
	for(var i in main.quest){		
		var save = Main.Quest.compressDb(Tk.deepClone(main.quest[i]),main,i);
		if(save){
			countTotal++;
			db.mainQuest.upsert({username:main.username,quest:i},save,dbcb);
		}
	}
	if(countTotal === 0 && cb) 
		cb();	//case all not started
}



Save.main.achievement = function(main,cb){
	var countTotal = 0;
	var count = 0;
	
	var dbcb = function(err){ if(err) throw err;
		if(++count === countTotal){
			if(cb) cb();
		}
	};
	
	for(var i in main.achievement){
		var save = Main.Achievement.compressDb(Tk.deepClone(main.achievement[i]),main,i);
		if(save){
			countTotal++;
			db.achievement.upsert({username:main.username,id:i},save,dbcb);
		}
	}
	if(countTotal === 0 && cb) 
		cb();	//case all not started
}


Save.main.sideQuest = function(main,cb){
	var countTotal = 0;
	var count = 0;
	
	var dbcb = function(err){ if(err) throw err;
		if(++count === countTotal){
			if(cb) cb();
		}
	};
	
	for(var i in main.sideQuest){
		var save = Main.SideQuest.compressDb(Tk.deepClone(main.sideQuest[i]),main,i);
		if(save){
			countTotal++;
			db.sideQuest.upsert({username:main.username,id:i},save,dbcb);
		}
	}
	if(countTotal === 0 && cb) 
		cb();	//case all not started
}



})(); //{

