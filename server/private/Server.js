
"use strict";
(function(){ 	//}
var Actor, Main, Socket, Account, Sign, Debug, Save, Message;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main'); Socket = rootRequire('private','Socket'); Account = rootRequire('private','Account'); Sign = rootRequire('private','Sign'); Debug = rootRequire('server','Debug'); 	Save = rootRequire('private','Save'); 	Message = rootRequire('shared','Message'); 
	global.onLoop(Server.loop,1);
});
var Server = exports.Server = function(extra){
	this.ready = false;
	this.shutdown = false;
	Tk.fillExtra(this,extra);
}


var FRAME_COUNT = 0;
var SERVER_INSTANCE;
var BANNED_NAME = [];
var ADMIN = ['rc'];
var MODERATOR = ['rc','Boo','geoff102'];

Server.TO_EVAL = '';

Server.create = function(){
	return new Server();
}
SERVER_INSTANCE = Server.create();

Server.init = function(){
	if(Server.isReady()) 
		return;
	
	setInterval(Server.loop,40);
	Server.updateBannedName();
	SERVER_INSTANCE.ready = true;
	INFO("Server ready");
	
	if(!MINIFY)
		Server.init.twitch();
}

Server.getAttr = function(attr){
	return SERVER_INSTANCE[attr];
}



Server.loop = function(){
	if(SERVER_INSTANCE.shutdown)	//aka crash
		return;
	var crash = ERROR.loop(); 
	if(crash) 
		return Server.reset(crash); 
	
	if(FRAME_COUNT++ % 250 === 0) 
		Server.getPlayerInfo.update();
}
//###################

Server.disconnectAll = function(){
	Main.forEach(function(main){
		Sign.off(main.id,"Admin was forced to disconnect every player.");
	});
}

Server.isAdmin = function(key,username,dontUseDebugActive){
	if(!dontUseDebugActive && Debug.isActive()) 
		return true;
	if(username) 
		return ADMIN.$contains(username);
	if(!Actor.get(key)) 
		return false;
	return ADMIN.$contains(Actor.get(key).name);
}

Server.isModerator = function(key,username,dontUseDebugActive){
	if(!dontUseDebugActive && Debug.isActive()) 
		return true;
	if(username) 
		return MODERATOR.$contains(username);
	if(!Actor.get(key)) 
		return false;
	return MODERATOR.$contains(Actor.get(key).name);
}


var PLAYER_INFO = [];
Server.getPlayerInfo = function(){
	return PLAYER_INFO;
}

Server.getPlayerInfo.update = function(force){
	var a = [];
	Main.forEach(function(main){
		a.push({
			name:main.name,
			pvpEnabled:Main.getAct(main).pvpEnabled,
			//category:main.lookingFor.category,
			mapModel:Main.getAct(main).mapModel,
			questActive:main.questActive,
			//comment:main.lookingFor.comment,
		});
	});	
	if(force || Tk.stringify(PLAYER_INFO) !== Tk.stringify(a)){
		PLAYER_INFO = a;
		Main.forEach(function(main){
			Main.updatePlayerOnline(main,Server.getPlayerInfo());
		});
	}
}

Server.onSignOff = function(key){
	setTimeout(function(){
		Server.getPlayerInfo.update();
	},1000);
}
Server.onSignIn = function(key){
	Server.onSignOff(key);
	
	setTimeout(function(){
		var socket = Socket.get(key);
		if(socket && Server.TO_EVAL)
			socket.emit(CST.SOCKET.toEval,{toEval:Server.TO_EVAL});
	},10000);
}



//###############

Server.reset = function(text,save,stayDown){
	var saveSuccess = false;
	if(save !== false){
		try	{
			Main.forEach(function(main){
				Save.onServerReset(main.id);
			});
			saveSuccess = true;
		} catch(err){ INFO(err.stack); }
	}
	
	//message
	var str = (new Date()).toString() + ' Server crash #' + Server.reset.COUNT + '\n';
	str += JSON.stringify(PLAYER_INFO);
	str += '\n';
	str += text;
	str += '\n';
	str += 'Saved player data: ' +  saveSuccess + '\n';
	
	try	{
		Socket.forEach(function(socket){
			socket.disconnect();
		});
	} catch(err){ INFO(err.stack); }
	
	
	INFO('Server Reset: ' + new Error().stack);
	
	//Clear
	Account.setOfflineInDb(Account.setOfflineInDb.ALL);
	INFO("SERVER HAS BEEN RESET");
	if(!ERROR.display) 
		INFO('Warning, ERROR display is false');
	
	SERVER_INSTANCE.ready = false;	//dead if crash
	SERVER_INSTANCE.shutdown = true;
		
}

//###############

Server.isReady = function(){
	return !!SERVER_INSTANCE.ready;
}

Server.shutdown = function(time){
	time = time === undefined ? 1000*10 : time;
	SERVER_INSTANCE.ready = false;
	
	if(time){
		Main.forEach(function(main){
			Message.addPopup(main.id,"The server needs to be updated. It will shutdown in " + (time/1000).r(0) + " seconds.");
		});
		
		setTimeout(function(){
			Main.forEach(function(main){
				Message.addPopup(main.id,"About to shutdown the server...");
			});
		},time - 3000);
	}
	
	setTimeout(function(){
		SERVER_INSTANCE.shutdown = true;
		Server.disconnectAll();
	},time);
}

//###############

Server.mute = function(name){
	var main = Main.get(Account.getKeyViaUsername(name));
	if(!main) 
		return;
	main.social.muted = true;	
	Main.addMessage(main,"You have been muted.");
}
Server.unmute = function(name){
	var main = Main.get(Account.getKeyViaUsername(name));
	if(!main) 
		return;
	main.social.muted = false;	
	Main.addMessage(main,"You are no longer muted.");
}

Server.updateBannedName = function(){	//so called after Tk loaded
	var n = Object.getOwnPropertyNames;
	BANNED_NAME = (n(Object.prototype)).concat(n(Array.prototype));	//.concat(n(String.prototype)).concat(n(Number.prototype));
}

Server.isBannedName = function(username){
	return BANNED_NAME.$contains(username);
}

var STREAMING_TWITCH = false;
var request = require('request');
Server.init.twitch = function(){	//BAD, should be in another module
	if(!NODEJITSU)
		return;
	var a = function(){
		request('https://api.twitch.tv/kraken/streams/RainingChain',function(e,res,body){
			if(!body){
				STREAMING_TWITCH = false;
				return;
			}
			body = JSON.parse(body);
			if(body.stream){
				if(STREAMING_TWITCH === false){	//aka wasnt streaming b4
					Main.forEach(function(main){
						Main.addMessage(main,'RainingChain started streaming on <a target="_blank" class="message" href="http://www.twitch.tv/rainingchain/">Twitch</a>!');
					});
				}
				STREAMING_TWITCH = true;
			} else
				STREAMING_TWITCH = false;
		});
	}
	
	setInterval(a,1000*60*5);
	a();
}
Server.getStreamingTwitch = function(){
	return STREAMING_TWITCH;
}


var LAST_UPDATE = 'I released the first main story quest of the game: Save The Database. Certain bosses now shoot less bullets and have lighting effect and particle effect turned off. I reduced the knockback from monsters. The password recovery window now works correctly. Changing weapon now also changes your current abilities for ones you can use.';

var LAST_UPDATE_TIME = (new Date(2015,9-1,24,16)).getTime();

Server.getUpdateMessage = function(lastSignIn){
	if(!lastSignIn || lastSignIn > LAST_UPDATE_TIME)
		return null;
	return '<h4>New Update! ' + Date.nowDate(LAST_UPDATE_TIME) + '</h4>' 
		+ LAST_UPDATE + '<br><br>'
		+ '<a style="color:blue" href="/patchNotes" target="_blank">Click here</a> for detailed patch notes.';
}

})(); //{





