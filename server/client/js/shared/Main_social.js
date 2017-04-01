
"use strict";
(function(){ //}
var Actor, Account, Main, Message;
global.onReady(function(){
	Actor = rootRequire('shared','Actor'); Account = rootRequire('private','Account'); Main = rootRequire('shared','Main'); Message = rootRequire('shared','Message');
	
	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.mute,Command.MAIN,[ //{
		Command.Param('string','Username',false),
	],Main.mutePlayer.onCommand); //}
	Command.create(CST.COMMAND.unmute,Command.MAIN,[ //{
		Command.Param('string','Username',false),
	],Main.unmutePlayer); //}

});
var Main = rootRequire('shared','Main');


Main.Social = function(social){
	var a = {
		message:[],
		friendList:{},
		muteList:{},
		clanList:[],
		status:'on',
		muted:false,
	};
	for(var i in social)
		a[i] = social[i];
	return a;
}

Main.Social.compressDb = function(social){
	return social;
}
Main.Social.uncompressDb = function(social){	//bad should use constructor
	return Main.Social(social);
}

//##################

Main.social = {};

Main.social.update = function(main){	//should only be for safety, Main.onSignInOff should in theory handle everything
	if(!Main.testInterval(main,25*60)) return;
	/*
	var key = main.id;
	var fl = Main.get(key).social.friendList;
    
	for(var i in fl){
		var bool = Main.canSendMessage(Actor.get(key).name,i) || false;
		if(fl[i].online !== bool) 
			Main.s etFlag(main,'social,friendList');
		fl[i].online = bool;
	}*/
}

Main.social.IN = 'in';
Main.social.OFF = 'off';

Main.social.onSignInOff = function(main,direction){
	var name = main.name;
	var text = '"' + name + '" just logged ' + direction + '.';
	var msg = Message.SignNotification(text);
	for(var i in Main.LIST){
		var otherMain = Main.LIST[i];
		if(otherMain.name === name) 
			continue;
		Main.addMessage(otherMain,msg);
		
		/*if(otherMain.social.friendList[n  ame]){	//bad username vs name
			otherMain.social.friendList[na  me].online = direction === Main.social.IN;
			Main.s etFlag(otherMain,'social,friendList');
		}*/
	}
}

Main.addFriend = function(main,user,nick,comment){
	/* name vs username
	nick = nick || user;
	comment = comment || '';
	if(user === main.name) 
		return Main.addMessage(main,"You are either bored or very lonely for trying this.");
	
	var social = main.social;
	if(social.friendList[user]) return Main.addMessage(main,"This player is already in your Friend List."); 
	if(social.muteList[user]) return Main.addMessage(main,"This player is in your Mute List.");
	
	social.friendList[user] = Friend(user,nick,comment);
	Main.addMessage(main,"Friend added.");
	Main.se tFlag(main,'social,friendList');
	*/
}

Main.removeFriend = function(main,user){
	/* name vs username
	var social = main.social;
	if(!social.friendList[user]) return Main.addMessage(main,'This player is not in your Friend List.');
	delete social.friendList[user]
	Main.addMessage(main,'Friend deleted.');
	Main.s etFlag(main,'social,friendList');
	*/
}


Main.changeStatus = function(main,setting){
	main.social.status = setting;
	Main.addMessage(main,"Private Setting changed to " + setting + '.');
}
Main.changeStatus.ON = 'on';
Main.changeStatus.OFF = 'off';
Main.changeStatus.FRIEND_ONLY = 'friend';

Main.isIgnoringPlayer = function(main,user){
	return !!main.social.muteList[user];
}

Main.mutePlayer = function(main,user){
	if(user === main.name) 
		return Main.addMessage(main,"-.- Seriously?");
	if(main.social.friendList[user]) 
		return Main.addMessage(main,"This player is in your Friend List.");
	if(main.social.muteList[user]) 
		return Main.addMessage(main,"This player is already in your Mute List.");

	main.social.muteList[user] = true;
	Main.addMessage(main,"Player muted.");
	Main.setChange(main,'social,muteList',main.social.muteList);
}

Main.mutePlayer.onCommand = function(main,user){
	Main.askQuestion(main,function(){
		Main.mutePlayer(main,user);
	},'Are you sure you want to mute "' + user + '"?','boolean');
}


Main.unmutePlayer = function(main,user){
	var social = main.social;
	if(!social.muteList[user]) Main.addMessage(main,'This player was not in your Mute List.');
	delete social.muteList[user];
	Main.addMessage(main,'Player unmuted.');
	Main.setChange(main,'social,muteList',main.social.muteList);
}

Main.canSendMessage = function(from,to){
	var mainReceiver = Main.LIST[Account.getKeyViaName(to)];
	if(!mainReceiver) 
		return null;
	if(mainReceiver.social.status === Main.changeStatus.OFF) 
		return false;
	if(mainReceiver.social.status === Main.changeStatus.FRIEND_ONLY && !mainReceiver.social.friendList[from]) 
		return false;
	return true;
}

//##################
/*
var Friend = function(name,nick,comment){
	return {
		name:name,
		nick:nick,
		comment:comment,	
	}
}
*/
})(); //{

