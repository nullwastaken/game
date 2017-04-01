
"use strict";
(function(){ //}
var Dialog, Command, Socket;
global.onReady(function(){
	Dialog = rootRequire('client','Dialog',true); Command = rootRequire('shared','Command',true); Socket = rootRequire('private','Socket',true);
});
var Message = rootRequire('shared','Message');


Message.sendChatToServer = function(text){
	if(!text.trim()) return;
	
	Dialog.chat.setInput('',false);

	Message.sendToServer(Message.sendChatToServer.textToMessage(text));
}

Message.sendChatToServer.textToMessage = function(txt){
	//Strict Pm
	if(txt.indexOf('@@') === 0){ 
		txt = txt.slice(2); 
		
		var to = txt.slice(0,txt.indexOf(','));
		var text = txt.slice(txt.indexOf(',') + 1);
		
		return Message.Pm(text,w.player.name,to);
	}
	
	//Pm with possible nickname
	if(txt.indexOf('@') === 0){ 
		txt = txt.slice(1);
		
		//Check for Nickname
		var comma = txt.indexOf(',');
		
		if(comma !== -1){
			var to = txt.slice(0,comma);
			var text = txt.slice(comma + 1);
					
			return Message.Pm(text,w.player.name,to);
		}
	}
	
	//Public
	return Message.Public(txt,w.player.name);
}

Message.sendToServer = function(msg){
	Socket.emit(CST.SOCKET.message,msg);
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
