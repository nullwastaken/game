
//DEV_MESSAGE
"use strict";
(function(){ //}
var Party, SideQuest, MapGraph, Metrics, Achievement, Competition, Equip, ItemModel, OfflineAction, QuestVar, Highscore, Socket, Save, Actor, Server, Main, Account, Debug, MapModel, Quest;
global.onReady(function(initPack){
	Party = rootRequire('server','Party'); SideQuest = rootRequire('shared','SideQuest'); MapGraph = rootRequire('shared','MapGraph'); Metrics = rootRequire('server','Metrics'); Achievement = rootRequire('shared','Achievement'); Competition = rootRequire('server','Competition'); Equip = rootRequire('server','Equip'); ItemModel = rootRequire('shared','ItemModel'); OfflineAction = rootRequire('server','OfflineAction'); QuestVar = rootRequire('server','QuestVar'); Highscore = rootRequire('server','Highscore'); Socket = rootRequire('private','Socket'); Save = rootRequire('private','Save'); Actor = rootRequire('shared','Actor'); Server = rootRequire('private','Server'); Main = rootRequire('shared','Main'); Account = rootRequire('private','Account'); Debug = rootRequire('server','Debug'); MapModel = rootRequire('server','MapModel'); Quest = rootRequire('server','Quest');

	db = initPack.db;
	USE_SIGN_IN_PACK_STATIC = initPack.processArgv.useSignInPack;
	Socket.on(CST.SOCKET.signIn,Sign.in.handleSocket,1,1000,false,true);
	Socket.on(CST.SOCKET.disconnect,Sign.off.handleSocketDisconnect,1,1000,false);
	Socket.on(CST.SOCKET.signUp,Sign.up,1,1000,false);
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.signOff,Command.KEY,[ //{
	],Sign.off.onCommand); //}
	
},{db:['account','main','mainQuest','player','questVar','achievement','sideQuest'],processArgv:true});
var Sign = exports.Sign = {};

var db = null;
var SEND_ACTIVATION_KEY = false;
//var BISON = require('./../client/js/shared/BISON');
var EMAIL_REQUIRED = false;

var ACCEPT_SIGN_IN = true;
var USE_SIGN_IN_PACK_STATIC; //set up
var ERR = new Error();
var PATH_SIGN_IN_PACK_STATIC = require('path').resolve(__dirname, '../client/js/SIGN_IN_PACK_STATIC.js');

var UP = CST.SOCKET.signUpAnswer;
var IN = CST.SOCKET.signInAnswer;
var OFF = CST.SOCKET.signOffAnswer;

Sign.setAcceptSignIn = function(bool){
	ACCEPT_SIGN_IN = bool;
}

Sign.respond = function(socket,type,message,success){
	if(success !== null)
		message = '<font color="' + (success ? 'green' : 'red') + '">' + message + '</font>';
	Socket.emit(socket,type, {
		success:success,
		message:message
	});
}

Sign.up = function(socket,d){	
	if(!ACCEPT_SIGN_IN)
		return Sign.respond(socket,UP,'The server is currently under a lot of pressure and is blocking new connections. Try again later.');
	
	d.email = escape.email(d.email || '');
	d.password = d.password || '';
	d.randomlyGenerated = !!d.randomlyGenerated;
	
	if(EMAIL_REQUIRED && NODEJITSU && !d.email) 
		return Sign.respond(socket,UP,'Invalid Email.');
		
	var res = Account.isValidUsername(d.username);
	if(res !== true)
		return Sign.respond(socket,UP,res);
		
	var res = Account.isValidPassword(d.password);
	if(res !== true)
		return Sign.respond(socket,UP,res);	
		
	db.account.findOne({$or:[{username:d.username},{name:d.username}]},{},function(err, res) { 		
		if(res) 
			return Sign.respond(socket,UP,'This username is already taken.');
		Account.encryptString(d.password,null,function(data){
			Sign.up.create(d,data,socket);
		});
	});
}

Sign.up.create = function(signInfo,passInfo,socket){
	db.account.findOne({username:signInfo.username},{},function(err, res) { 	
		if(res) 
			return Sign.respond(socket,UP,'This username is already taken.');
		
		Metrics.onSignUp(signInfo.username);
		
		var key = Math.randomId();	//not important
		var player = Actor.create('player',{ 
			id:key,
			name:signInfo.username, 
			username:signInfo.username, 
			context:signInfo.username,
		});
		
		var main = Main.create(key,{
			name:signInfo.username, 
			username:signInfo.username, 
		});
				
		var emailActivationKey = Math.random().toString().slice(2);
		var account = Account.create({
			username:signInfo.username, 
			name:signInfo.username, 
			password:passInfo.password,
			salt:passInfo.salt,
			email:signInfo.email,
			randomlyGeneratedUsername:signInfo.randomlyGenerated,
			randomlyGeneratedPassword:signInfo.randomlyGenerated,
			emailActivationKey:emailActivationKey,
			geoLocation:signInfo.geoLocation || '',
		});
		
		
		Account.insertInDb(account,function(err) { if (err) throw err;	
			Save.player(player,function(err) { 	if (err) throw err;
				Save.main(main,function(err) { 	if (err) throw err;
					Sign.respond(socket,UP,'New Account Created.<br>You can now Sign In.',true);
					if(SEND_ACTIVATION_KEY)
						Account.sendActivationKey(account);
				});
			});
		});
	});
}

Sign.up.handleSocket = function(socket,d){
	if(!Server || !Server.isReady()) 
		return Sign.respond(socket,IN,CST.SERVER_DOWN,null);
	Sign.respond(socket,UP,'Creating account...',null);
	Sign.up(socket,d); 
}

//#################

Sign.off = function(key,message){
	var socket = Socket.get(key);
	if(!socket) 
		return ERROR(2,'no socket');
	if(socket.beingRemoved) 
		return;	//prevent Sign.off from being called mutiple times
	
	socket.beingRemoved = true;
	
	setTimeout(function(){ //in case saving didnt work for w/e reason...
		if(Socket.get(key)){	//aka online
			Socket.get(key).beingRemoved = false;
			Sign.off(key,message);
		}
	},1000*30);	
	
	Socket.addPingDataToDb(socket,db);
	
	if(message){
		if(typeof message === 'string')
			message = {message:'<span>You have been disconnected.</span><br>' + message,backgroundColor:'red'};
		Socket.emit(socket,OFF, message);
	}
	
	
	Save.onSignOff(key,function(err){
		if(err) 
			ERROR.err(3,err);
		var main = Main.get(key);
		Metrics.onSignOff(key);
		Equip.onSignOff(main.invList.data,main.bankList.data,Actor.getEquip(Actor.get(key)).piece);	//BAD
		Main.onSignOff(main);
		Server.onSignOff(key);
		Sign.off.remove(socket);
	});
}

Sign.off.remove = function(socket){	//after save
	var key = socket.key;
	var act = Actor.get(key);
	Actor.remove(act);
	Socket.removeFromList(key);
	Main.removeFromList(key);
	Actor.removeFromList(key);
	Account.removeFromListToKey(act);
	socket.disconnect();
}

Sign.off.onError = function(key,socket){	//try my best to limit damage
	ERROR(2,'Sign.off.onError. no act with key ' + key);
	socket = socket || Socket.get(key);
	if(socket)
		socket.disconnect();
	var act = Actor.get(key);
	if(act){
		Actor.remove(act);
		Account.removeFromListToKey(act);
	} else {
		var main = Main.get(key);
		if(main)
			Account.removeFromListToKey(main);
	}
	
	Socket.removeFromList(key);
	Main.removeFromList(key);
	Actor.removeFromList(key);
	
}

Sign.off.onCommand = function(key){
	Sign.off(key,{message:"You safely quit the game.",backgroundColor:'green'});
}
	
Sign.off.handleSocketDisconnect = function(socket,d){
	if(!socket.key) return;		//wasnt even logged in
	if(!socket.beingRemoved)	//cuz Sign.off calls socket.disconnect
		Sign.off(socket.key);
}

//#################

Sign.in = function(socket,d,cb){	//sends name, not username
	var displayName = d.username;
	
	if(displayName !== 'rc' && !ACCEPT_SIGN_IN)
		return Sign.respond(socket,IN,'The server is currently under a lot of pressure and is blocking new connections. Try again later.');
	
	cb = cb || CST.func;
	if(socket.corruptedDb)
		return Sign.respond(socket,IN,'The server is unable to load your account. Sorry. An admin is looking into it.');
	if(socket.passwordAcceptedSigninIn)
		return Sign.respond(socket,IN,'The server is trying to log you in.<br>Wait 30 seconds and refresh the page if nothing is happening.');
		
	db.account.findOne({name:displayName},{},function(err, account) { 
		if(!account) 
			return Sign.respond(socket,IN,'Wrong Password or Username.');
		if(account.banned) 
			return Sign.respond(socket,IN,'This account is banned.');
		
		Account.encryptString(d.password,account.salt,function(data){
			if(data.password !== account.password) 
				return Sign.respond(socket,IN,'Wrong Password or Username.');
			
			var act = Actor.getViaUsername(account.username);
			if(account.online || act){
				if(act) 
					Sign.off(act.id);
				//else ERROR(2,'actor dont exist with username',d.username);	//if spamming sign in and actor not in LIST yet 
				Account.setOfflineInDb(account.username);
				return Sign.respond(socket,IN,'This account was online.<br>We just logged it off.<br>Try connecting again.');
			}
			
			//Success!
			db.account.update({username:account.username},{$set:{online:true}},function(err,res){
				
				Sign.respond(socket,IN,'Loading account...',true);
						
				var key = "P" + Math.randomId();
				Sign.in.load(key,account,socket,function(err){
					if(err === ERR){
						socket.corruptedDb = true;
						Account.setOfflineInDb(account.username);
						cb(ERR);
					} else
						cb();
				});
				socket.passwordAcceptedSigninIn = true;
			});
		});
	});
}

Sign.in.load = function (key,account,socket,cb){
	Sign.in.loadPlayer(key,account,function(player){
		if(!player || player === ERR)
			return cb(ERR);
		Sign.in.loadMain(key,account,function(main,questVar){
			if(!main || main === ERR)
				return cb(ERR);
			Sign.in.addToGame(key,account,main,questVar,player,socket,cb);
		});	
	});	
}

Sign.in.addToGame = function(key,account,main,questVar,player,socket,cb){	//BAD Sign.onSignIn = newPubSub
	var firstSignIn = Account.isFirstSignIn(account);
	
	Main.addToList(main);
	QuestVar.onSignIn(questVar,main);
	Party.onSignIn(main); //should be in Main.onSignIn... but need to be b4 teleport map
	
	Actor.onSignIn(player,firstSignIn);
	
	//Init Socket
	socket.key = key;
	socket.username = account.username;
	socket.online = true;
	socket.geoLocation = account.geoLocation;
	
	Socket.addToList(socket);
	
	//Cycle	
	Debug.onSignIn(key,account.username,socket);
		
	Server.onSignIn(key);
	
	Account.onSignIn(account,key);
	Main.onSignIn(main);
	Metrics.onSignIn(key);
	Achievement.onSignIn(main,account.timePlayedTotal);
	
	Quest.onSignIn(main,questVar,account);	//after cuz might teleport elsewhere
	OfflineAction.onSignIn(main.username);
	//Competition.onSignIn(main,firstSignIn);
	var pack = Sign.in.getSignInPack(key,player,main,account);
	
	Socket.emit(socket,CST.SOCKET.signInAnswer,{ 
		success:true,
		data:pack,
		//message done via LOADING_HTML process bar
	});
	//before:takes 5 ms and 218288 length
	//with static: 3 ms 38908 length
	if(cb)
		cb();
}

Sign.in.loadMain = function(key,account,cb){
	db.main.findOne({username:account.username},{_id:0},function(err, data) { if(err) ERROR.err(3,err);
		var main = Main.uncompressDb(data,key);
		if(!main || main === ERR)
			return cb(ERR);
		var equipList = (main.invList.data.$keys()).concat(main.bankList.data.$keys());	//BAD
		Equip.fetchList(equipList,main.username,function(){
			Main.ItemList.checkIntegrity(main.invList);
			Main.ItemList.checkIntegrity(main.bankList);
			
			Sign.in.loadMainQuest(main,function(quest){
				main.quest = quest;
				Sign.in.loadQuestVar(main,function(questVar){
					Sign.in.loadMainAchievement(main,function(achievement){
						main.achievement = achievement;
						Sign.in.loadMainSideQuest(main,function(sideQuest){
							main.sideQuest = sideQuest;
							cb(main,questVar);
						});
					});
				});
			});
		});
	});
}

Sign.in.loadQuestVar = function(main,cb){
	if(!main.questActive) 
		return cb(null);	//not an error
	db.questVar.findOne({username:main.username,quest:main.questActive},{_id:0},function(err, questVar) { if(err) ERROR.err(3,err);
		questVar = QuestVar.uncompressDb(questVar,main);
		cb(questVar);	
	});
}	

Sign.in.loadPlayer = function(key,account,cb){
	db.player.findOne({username:account.username},{_id:0},function(err, data) { if(err) ERROR.err(3,err);
		Actor.Equip.fetch(data.equip,data.username,function(){
			var extra = Actor.uncompressDb(data,key);
			if(!extra || extra === ERR)
				return cb(ERR);
			var player = Actor.create('player',extra);
			cb(player);
		});
	});
}

Sign.in.getSignInPack = function(key,player,main,account){	//exports.Sign.onGameStart
	var data = {
        player:Actor.getSignInPack(player),
        main:Main.getSignInPack(main),
		item:ItemModel.getSignInPack(key),
		equip:Equip.getSignInPack(key),
		firstSignIn:Account.isFirstSignIn(account),
		randomlyGeneratedPassword:account.randomlyGeneratedPassword,
		randomlyGeneratedUsername:account.randomlyGeneratedUsername,
		
		questRating:Quest.getRatingSignInPack(),
		streamingTwitch:Server.getStreamingTwitch(),	
		updateMessage:Server.getUpdateMessage(account.lastSignIn),
		competition:Competition.getCurrent(),
		TIMESTAMP_OFFSET:""+CST.TIMESTAMP_OFFSET,	//bigger than BISON int
		currentTime:""+Date.now(),	//bigger than BISON int
	};
	if(!USE_SIGN_IN_PACK_STATIC){	//need to provide it
		var sta = Sign.in.getSignInPackStatic();
		for(var i in sta)
			data[i] = sta[i];
	}
	return data;
}

Sign.in.getSignInPackStatic = function(){
	return {
		quest:Quest.getSignInPack(),	
		highscore:Highscore.getSignInPack(),
		sideQuest:SideQuest.getSignInPack(),
		mapGraph:MapGraph.getSignInPack(),
		map:MapModel.getSignInPack(),
	}
}

Sign.in.saveSignInPackStatic = function(){
	INFO("saveSignInPackStatic init, waiting for Quest Rating");
	setTimeout(function(){
		var fs = require('fs');
		var content = 'window[\'' + CST.SIGN_IN_PACK_STATIC_VAR + '\'] = ' + JSON.stringify(Sign.in.getSignInPackStatic()) + ';';
		fs.writeFile(PATH_SIGN_IN_PACK_STATIC,content, function(err) {
			if(err) 
				throw err;

			INFO("saveSignInPackStatic good");
		}); 
	},20*1000);
}

Sign.in.loadMainQuest = function(main,cb){
	db.mainQuest.find({username:main.username},{_id:0},function(err, data) { 
		var tmp = {};
		for(var i = 0; i < data.length; i++){
			var quest = data[i].quest;
			var good = Main.Quest.uncompressDb(data[i]);
			if(good)
				tmp[quest] = good;
		}
		tmp = Main.Quest(tmp);
		cb(tmp);
	});
}

Sign.in.loadMainAchievement = function(main,cb){
	db.achievement.find({username:main.username},{_id:0},function(err, data) { 
		var tmp = {};
		for(var i = 0; i < data.length; i++){
			var achievementId = data[i].id;
			var good = Main.Achievement.uncompressDb(data[i]);
			if(good)
				tmp[achievementId] = good;
		}
		tmp = Main.Achievement(tmp);
		cb(tmp);
	});
}

Sign.in.loadMainSideQuest = function(main,cb){
	db.sideQuest.find({username:main.username},{_id:0},function(err, data) { 
		var tmp = {};
		for(var i = 0; i < data.length; i++){
			var achievementId = data[i].id;
			var good = Main.SideQuest.uncompressDb(data[i]);
			if(good)
				tmp[achievementId] = good;
		}
		tmp = Main.SideQuest(tmp);
		cb(tmp);
	});
}

var isReadyAt = NODEJITSU ? Date.now() + 15*1000 : -10000;	//case ppl spam click to sign in
Sign.in.handleSocket = function(socket,d){
	if(!Server || !Server.isReady() || (Date.now() < isReadyAt))
		return Sign.respond(socket,IN,CST.SERVER_DOWN,null);
	Socket.emit(socket,CST.SOCKET.signInAnswer, {load:true,message:'Verifying password...' }); 
	Sign.in(socket,d,function(err){
		if(err)
			Sign.respond(socket,IN,'The server was unable to load your account. Sorry. An admin is looking into it.',false);
	}); 
}

})(); //{



