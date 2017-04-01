
"use strict";
(function(){ //}
var Actor, Waypoint, Maps, Material, Shop, ClientError, Metrics, OfflineAction, Account, Send, Debug, Equip, Socket, Server, Sign, Message, Main, Quest, Dialog, Pref, Song;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Waypoint = rootRequire('shared','Waypoint'); Maps = rootRequire('server','Maps'); Material = rootRequire('server','Material'); Shop = rootRequire('server','Shop'); ClientError = rootRequire('shared','ClientError'); Metrics = rootRequire('server','Metrics'); OfflineAction = rootRequire('server','OfflineAction'); Account = rootRequire('private','Account'); Send = rootRequire('server','Send'); Debug = rootRequire('server','Debug'); Equip = rootRequire('server','Equip'); Socket = rootRequire('private','Socket'); Server = rootRequire('private','Server'); Sign = rootRequire('private','Sign'); Message = rootRequire('shared','Message'); Main = rootRequire('shared','Main'); Quest = rootRequire('server','Quest');
	Dialog = rootRequire('client','Dialog',true); Pref = rootRequire('client','Pref',true); Song = rootRequire('client','Song',true);
	if(SERVER)
		Socket.on(CST.SOCKET.command,Command.receive,30,0,true);
});
var Reddit = SERVER && !MINIFY && rootRequire('private','Reddit');

var Command = exports.Command = function(extra){
	this.id = '';
	this.description = '';
	this.help = false;
	this.param = [];
	this.func = null;	//function(key,[...])
	this.clientSide = false;
	this.adminOnly = false;
	this.firstParam = '';
	Tk.fillExtra(this,extra);
};

Command.create = function(id,firstParam,param,func,clientSide,adminOnly){
	if(DB[id]) 
		return ERROR(2,'id already taken',id);
	
	if(!Tk.enumContains(CST.COMMAND,id))
		ERROR(3,'invalid id. must be in CST.COMMAND',id);
	
	if(!Command.FIRST_PARAM.$contains(firstParam))
		ERROR(3,'invalid firstParam',firstParam);
	if(clientSide && firstParam !== Command.NONE)
		ERROR(3,'invalid firstParam clientSide');
	
	var tmp = new Command({
		id:id || ERROR(3,'id missing'),
		param:param,
		firstParam:firstParam,
		func:func || ERROR(3,'func missing'),
		clientSide:clientSide,
		adminOnly:adminOnly,
	});
	DB[id] = tmp;
};
var DB = Command.DB = {};

var TYPE = ['string','number','boolean'];
Command.Param = function(type,name,optional,extra){
	if(!TYPE.$contains(type))
		ERROR(3,'invalid type',type);
	var tmp = {
		type:type,
		name:name || '',
		optional:!!optional,	
		whiteList:null,	//[]
		default:null,
		min:0,
		max:CST.BIG_INT,
		noEmptyString:true,
	};
	Tk.fillExtra(tmp,extra);
	return tmp;
}

Command.MAIN = 'main';
Command.ACTOR = 'actor';
Command.KEY = 'key';
Command.NONE = 'none';
Command.SOCKET = 'socket';

Command.FIRST_PARAM = [Command.SOCKET,Command.MAIN,Command.ACTOR,Command.KEY,Command.NONE];

Command.Param.mouse = function(){
	return Command.Param('string','Mouse Button',false,{whiteList:['left','right','shiftLeft','shiftRight']});
}

Command.Query = function(func,param){
	return {
		func:func,
		param:param,	
	}
}

//############

Command.receive = function(socket,d){	//server	d=Command.Query
	var input = Command.receive.verifyInput(d);
	if(typeof input === 'string') 
		return Message.add(socket.key,input);	//aka error
	var cmd = DB[input.func];
	
	if(cmd.firstParam === Command.KEY)
		input.param.unshift(socket.key);	
	else if(cmd.firstParam === Command.MAIN)
		input.param.unshift(Main.get(socket.key));
	else if(cmd.firstParam === Command.ACTOR)
		input.param.unshift(Actor.get(socket.key));
	else if(cmd.firstParam === Command.SOCKET)
		input.param.unshift(socket);		
	
	
	if(cmd.adminOnly && !Server.isAdmin(null,socket.username)){
		ERROR(2,'unauthorized access to command adminOnly',socket.username,input.func);
		return Sign.off(socket.key,'You are not authorized to use that.');
	}
	cmd.func.apply(this,input.param);
}

Command.receive.verifyInput = function(d){
	var cmd = DB[d.func];
	if(!cmd) return 'invalid func';
	if(cmd.clientSide) return 'clientside func';
	
	var p = d.param;
	var doc = cmd.param;
	
	for(var i = 0 ; i < p.length && i < doc.length; i++){ 
		if(p[i] !== undefined && doc[i].type === 'number'){
			if(typeof p[i] !== 'number') 
				return 'param' + i + ' is not number'; 
			p[i] = Math.round(Math.min(Math.max(p[i],doc[i].min),doc[i].max));
		}	

		if(p[i] !== undefined && doc[i].type === 'string'){
			if(typeof p[i] !== 'string') return 'param' + i + ' is not string'; 
			
			if(doc[i].whiteList && !doc[i].whiteList.$contains(p[i])) return 'param' + i + ' not part of whiteList';
		}
	}
	for(++i;i < doc.length; i++){
		if(!doc[i].optional) 
			return 'missing non-optional param';
		p[i] = doc[i].default;
	}
	
	return d;
}

Command.execute = function(func,param){	//client side
	if(func.func && func.param){ 
		param = func.param; 
		func = func.func;
	}	//aka if func is Command.Query
	param = param || [];
	if(DB[func] && DB[func].clientSide) 
		return DB[func].func.apply(this,param);
	Socket.emit(CST.SOCKET.command,Command.Query(func,param));
}

//############

//Fl
/*
Comma nd.create('fl,add','Add a new Friend to your Friend List',true,[ //{
	Command.Param('string','Username to add',false),
	Command.Param('string','Nickname',true),
	Command.Param('string','Comment',true),
],function(key,user,nick,comment){
	if(user.length === 0) 
		return;
	Main.addFriend(Main.get(key),user,nick,comment);
}); //}
Comman d.create('fl,remove','Remove a Friend',true,[ //{
	Command.Param('string','Username to remove',false),
],function(key,user){
	Main.removeFriend(Main.get(key),user);
}); //}


Comma nd.create('fl,pm','Change who can PM you right now.',true,[ //{
	Command.Param('string','Option (on,off or friend)',false,{whiteList:['on','off','friend']}),
],function(key,setting){
	Main.changeStatus(Main.get(key),setting);
}); //}
*/

//Tab

Command.create(CST.COMMAND.redditComment,Command.KEY,[ //{
	Command.Param('string','Where',false),
	Command.Param('string','Text',false),
],function(key,where,text){
	var user = Actor.get(key).name;
	if(!text.trim() || text.length > 10000)
		return;
	var str = user + ' says: ' + text;
	Quest.addGeneralFeedback(Main.get(key),str);
	if(!Reddit || !Reddit.isInit() || !Reddit.isValidParent(where)) 
		return;
	Reddit.comment(where,str);
	var url = Reddit.getUrlParent(where);
	Message.add(key,'Thanks for your feedback. <a class="message" href="' + url + '" target="_blank">Check your comment here.</a>');
}); //}

//ADMIN
var usernameHelper = function(key,username,func){
	Account.usernameExists(username,function(res){
		if(res){
			Message.add(key,'Success!');
			func();
		} else
			Message.add(key,'No player with username ' + username);
	});
}	

Command.create(CST.COMMAND.addCPQuestFeedback,Command.KEY,[ //{
	Command.Param('string','Username',false),
	Command.Param('string','Quest',false),
],function(key,username,qname){
	usernameHelper(key,username,function(){
		Main.contribution.addPtOffline(username,2,'questFeedback','CP for useful feedback for the quest ' + qname + '.'); 
	});
},false,true); //}

Command.create(CST.COMMAND.giveCP,Command.KEY,[ //{
	Command.Param('string','Username',false),
	Command.Param('number','CP',false),
	Command.Param('string','Comment',true),
],function(key,username,pt,comment){
	usernameHelper(key,username,function(){
		Main.contribution.addPtOffline(username,pt,'questFeedback',comment || 'You are awesome!');
	});
},false,true); //}

Command.create(CST.COMMAND.activeBotwatch,Command.KEY,[ //{
	Command.Param('string','',false),
],function(key,id){
	if(id && id !== key)
		Send.activateBotwatch(key,id);
	else
		Send.desactivateBotwatch();		
},false,true); //}

Command.create(CST.COMMAND.getQuestRating,Command.KEY,[ //{
	Command.Param('boolean','',false),
],function(key,readToo){
	Quest.getQuestFeedback(key,readToo);
},false,true); //}

Command.create(CST.COMMAND.setQuestRatingAsRead,Command.KEY,[ //{
],function(key){
	Quest.setQuestRatingAsRead(key);
},false,true); //}

Command.create(CST.COMMAND.spyPlayer,Command.KEY,[ //{
],function(key){
	Debug.spyPlayer(key);
},false,true); //}

Command.create(CST.COMMAND.displayLogs,Command.KEY,[ //{
],function(key){
	Message.addPopup(key,'<div style="font-size:0.7em; height:600px; overflow-y:scroll; text-align:left;">' + Metrics.getDisplayText() + '</div>');
},false,true); //}

Command.create(CST.COMMAND.replyReddit,Command.KEY,[ //{
],function(key,username,postUrl,message){
	usernameHelper(key,username,function(){
		var m = 'An admin replied to your <a target="_blank" class="message" href="' + postUrl + '">feedback</a>: ' + message;
		OfflineAction.create(username,'questPopup',OfflineAction.Data.message(m));
	});
},false,true); //}

Command.create(CST.COMMAND.sendMsg,Command.KEY,[ //{
],function(key,username,message,url){
	usernameHelper(key,username,function(){
		OfflineAction.create(username,'questPopup',OfflineAction.Data.message(message));
	});
},false,true); //}

Command.create(CST.COMMAND.addItem,Command.KEY,[ //{
],function(key,itemId,amount){
	Debug.addItem(key,itemId,amount);
},false,true); //}

Command.create(CST.COMMAND.spawnEnemy,Command.KEY,[ //{
],function(key){
	Debug.spawnEnemyViaQuestion(key);
},false,true); //}

Command.create(CST.COMMAND.addAbility,Command.KEY,[ //{
],function(key){
	Debug.addAbilityViaQuestion(key);
},false,true); //}

Command.create(CST.COMMAND.teleportToAdmin,Command.KEY,[ //{
],function(key,where){
	Debug.teleportTo(key,where);
},false,true); //}

Command.create(CST.COMMAND.teleportToSpotAdmin,Command.KEY,[ //{
],function(key,x,y,map){
	Debug.teleportToSpot(key,Actor.Spot(x,y,map,map));
},false,true); //}

Command.create(CST.COMMAND.displayPingData,Command.KEY,[ //{
],function(key){
	Socket.getPingData(function(err,data){
		if(Main.get(key))
			Main.openDialog(Main.get(key),'adminPingData',{data:data});
	});
},false,true); //}

Command.create(CST.COMMAND.displayClientError,Command.KEY,[ //{
],function(key){
	ClientError.getData(function(err,data){
		if(Main.get(key))
			Main.openDialog(Main.get(key),'adminClientError',{data:data});
	});
},false,true); //}

Command.create(CST.COMMAND.deleteClientError,Command.KEY,[ //{
],function(key){
	ClientError.deleteAll();
},false,true); //}

})();
