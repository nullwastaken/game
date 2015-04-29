//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Dialog = require4('Dialog'), Command = require4('Command'), Socket = require4('Socket');
var Message = require3('Message');

Message.sendChatToServer = function(text){
	if(!text.trim()) return;
	
	Dialog.chat.setInput('',false);
	if(text[0] === '$'){
		var cmd = Command.textToCommand(text.slice(1));
		if(cmd)
			Command.execute();
		return;
	}
	
	Message.sendToServer(Message.sendChatToServer.textToMessage(text));
}

Message.sendChatToServer.textToMessage = function(txt){
	//Strict Pm
	if(txt.indexOf('@@') === 0){ 
		txt = txt.slice(2); 
		
		var to = txt.slice(0,txt.indexOf(','));
		var text = txt.slice(txt.indexOf(',') + 1);
		
		return Message.Pm(text,player.name,to);
	}
	
	//Pm with possible nickname
	if(txt.indexOf('@') === 0){ 
		txt = txt.slice(1);
		
		//Check for Nickname
		var nick = txt.slice(0,txt.indexOf(','));
		var to = nick;
		var text = txt.slice(txt.indexOf(',') + 1);
		
		for(var i in main.social.friendList){
			if(nick === main.social.friendList[i].nick) 
				to = i;
		}
				
		return Message.Pm(text,player.name,to);
	}
	
	//Public
	return Message.Public(txt,player.name);
}

Message.sendToServer = function(msg){
	Socket.emit('sendChat',msg);
}


Message.reply = function(){
	if(Message.reply.HISTORY.length){
		Message.setInputForPM(null,Message.reply.HISTORY[0].from);
	}
	if(Message.reply.HISTORY.length > 20){
		Message.reply.HISTORY = Message.reply.HISTORY.slice(0,10);
	}
	
}
Message.reply.HISTORY = [];

Message.setInputForPM = function(key,name){
	Dialog.chat.setInput('@' + name + ',');
}

//###############

Message.add = function(key,msg){
	if(typeof msg === 'string') 
		msg = Message.Game(msg,Message.CLIENT);
	Message.receive(msg);
}
Message.addPopup = function(key,text){
	Message.receive(Message.QuestPopup(text));
}



})(); //{
