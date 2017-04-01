
"use strict";
var Party, Account, Server, ItemModel, Actor, Main, Socket;
global.onReady(function(){
	Socket = rootRequire('private','Socket'); Party = rootRequire('server','Party'); Account = rootRequire('private','Account'); Server = rootRequire('private','Server'); ItemModel = rootRequire('shared','ItemModel'); Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main');
	Socket.on(CST.SOCKET.message,Message.receive,60,500,true);
});
var Message = rootRequire('shared','Message');

var BROADCAST_PUBLIC = true;
var ALLOW_LINK = true;

Message.add = function(key,textOrMsg,color){
	Main.addMessage(Main.get(key),textOrMsg,color);
}

Message.addPopup = function(key,text){
	Message.add(key,Message.QuestPopup(text));
}
		
Message.broadcast = function(text){
	Main.forEach(function(main){
		Main.addMessage(main,text);
	});		
}

//##################

Message.receive = function(socket,msg){
	if(msg.to === CST.LORD_DOTEX)
		return handleLordDotexPm(socket,msg);
	var key = socket.key;
	msg.from = Main.get(key).name;
	if(!Message.receive.test(key,msg)) 
		return;
	var admin = Server.isAdmin(key);
	
	var parse = Message.parseText(msg.text,admin,Main.get(key).username);	//username for privilege
	msg.hasItem = parse.hasItem;
	msg.hasLink = parse.hasLink;
	msg.text = parse.text;
	
	
	if(msg.type === 'public') 
		Message.receive.public(key,msg);
	else if(msg.type === 'pm') 
		Message.receive.pm(key,msg); 
	else if(msg.type === 'questionAnswer')
		Message.receive.question(key,msg); 

};
var handleLordDotexPm = function(socket,msg){
	var text = "01001110 01010000 01000011 00100000 01010010 01100101 01110110 01101111 01101100 01110101 01110100 01101001 01101111 01101110";
	Message.add(socket.key,Message.Pm(text,CST.LORD_DOTEX,socket.key))
}


Message.receive.test = function(key,msg){
	if(!msg.type || !msg.text || typeof msg.text !== 'string') 
		return false;
	if(msg.to === msg.from) 
		Message.add(key,"Ever heard of thinking in your head?");//no return cuz used for testing
	if(msg.type !== 'feedback' && msg.text.length > 200) 
		return false;	//text too long
	if(Message.receive.ZALGO_ACTIVE && Message.receive.ZALGO_REGEX.test(msg.text)) 
		return false;
	if(Main.get(key).social.muted) 
		return false;				//player is muted
	return true;
}

Message.receive.ZALGO_ACTIVE = false;	//prevent é
Message.receive.ZALGO_REGEX = /[^\x20-\x7E]/;

Message.receive.public = function(key,msg){
	var act = Actor.get(key);
	var main = Main.get(key);
	
    if(!msg.hasItem && !msg.hasLink)
		act.chatHead = Actor.ChatHead(msg.text);
		
	var custom = Main.contribution.getChat(main);
	var newMsg = Message.Public(msg.text,msg.from,custom.color,custom.symbol);
	
	//Send info
	if(BROADCAST_PUBLIC)
		Message.broadcast(newMsg);
	else {
		Message.add(key,newMsg);
		var alreadySentTo = [key];
		for(var i in act.activeList){
			if(!Actor.isPlayer(i)) 
				continue;	//aka non player
			alreadySentTo.push(i);
			Message.add(i,newMsg);
		}
		Party.addMessage(Main.getParty(Main.get(key)),msg,alreadySentTo);
	}	
}

Message.receive.pm = function(key,msg){
	if(!Main.canSendMessage(msg.from,msg.to))
		return Message.add(key,"This player is offline.");
		
	var newMsg = Message.Pm(msg.text,msg.from,msg.to,Main.contribution.getChat(Main.get(key)).symbol);
	Message.add(Account.getKeyViaName(msg.to),newMsg);
	Message.add(key,newMsg);
}

Message.receive.question = function(key,msg){
	Main.handleQuestionAnswer(Main.get(key),msg);
}

Message.parseText = function(data,admin,username){
	var linkGood = ALLOW_LINK || Server.isModerator(null,username) || admin;
	if(linkGood && data.indexOf('http') === 0 && !data.$contains('>')){	//> to prevent injection
		return {
			text:'<a class=message href="' + data + '" target="_blank">' + data + '</a>',
			hasItem:false,
			hasLink:true,
		}
	}
	if(!admin)
		data = escape.html(data);
	var rawData = data;
	
	data = Tk.replaceBracketPattern(data,Message.parseText.item);
	
	return {
		text:data,
		hasItem:rawData !== data,
		hasLink:false,
	};
}

Message.parseText.item = function(id){
	var item = ItemModel.get(id,true);
	if(!item) return '[[' + id + ']]';
	if(item.type !== 'equip') 
		return '[' + item.name + ']';
	
	return '<fakea class="message" onclick="exports.Dialog.open(\'equipPopup\',exports.Dialog.EquipPopup(\'' + item.id + '\',false));">[' + item.name + ']</fakea>';
}

Message.generateTextLink = function(onclick,text){
	return '<fakea onclick="' + onclick + '">' + text + '</fakea>';
}


/*
Message.parseText = function(data){
	data = escape.html(data);
	var puush = data;
	data = Tk.replaceCustomPattern(data,'http://puu.sh/','.png',Message.parseText.puush);
	data = Tk.replaceCustomPattern(data,'http://puu.sh/','.jpg',Message.parseText.puush);
	data = Tk.replaceCustomPattern(data,'http://puu.sh/','.txt',Message.parseText.puush);
	var item = data;
	
	return {text:data,item:data !== item,puush:puush !== item};
}


Message.parseText.puush = function(link){
	return	'<a style="color:cyan" href="' + link + '" target="_blank">[' + link.slice(-9,-4) + ']</a>';
}
 

//'http://puu.sh/8H2H1.png'.slice(-9,-4)

*/













