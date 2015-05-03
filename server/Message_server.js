//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Party = require2('Party'), Account = require2('Account'), ItemModel = require2('ItemModel'), Actor = require2('Actor'), Main = require2('Main');
var Message = require3('Message');
var db;

Message.init = function(dblink){
	db = dblink;
}

Message.add = function(key,textOrMsg){
	Main.addMessage(Main.get(key),textOrMsg);
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

Message.receive = function(key,msg){
	msg.from = Main.get(key).username;
	if(!Message.receive.test(key,msg)) 
		return;
	
	var parse = Message.parseText(msg.text);     	//text
	msg.hasItem = parse.hasItem;
	msg.hasPuush = parse.hasPuush;
	msg.text = parse.text;
	
	
	if(msg.type === 'public') Message.receive.public(key,msg);
	else if(msg.type === 'pm') Message.receive.pm(key,msg); 
	else if(msg.type === 'questionAnswer') Message.receive.question(key,msg); 
	else if(msg.type === 'report') Message.receive.report(key,msg); 
	
	//else if(msg.type === 'clan') Message.receive.clan(key,msg); 
};

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
	
	msg.text = unescape.html(msg.text);	//allow html. but was parsed earlier
	
    if(!msg.hasItem && !msg.hasPuush)
		act.chatHead = Actor.ChatHead(msg.text);
		
	var custom = Main.contribution.getChat(main);
	var newMsg = Message.Public(msg.text,msg.from,custom.color,custom.symbol);
	Message.add(key,newMsg);
	
	//Send info
	var alreadySentTo = [key];
	for(var i in act.activeList){
		if(!Actor.isPlayer(i)) continue;	//aka non player
		alreadySentTo.push(i);
		Message.add(i,newMsg);
	}
	Party.addMessage(Main.getParty(Main.get(key)),msg,alreadySentTo);

}

Message.receive.pm = function(key,msg){
	if(!Main.canSendMessage(msg.from,msg.to))
		return Message.add(key,"This player is offline.");
		
	var newMsg = Message.Pm(msg.text,msg.from,msg.to,Main.contribution.getChat(Main.get(key)).symbol);
	Message.add(Account.getKeyViaName(msg.to),newMsg);
	Message.add(key,newMsg);
}

Message.receive.clan = function(key,msg){
	return;
}    

Message.receive.report = function(key,d){
	return;
	/*
	if(d.text.length > 1000 && d.title.length > 50) return Message.add(key,'Too long text or title.');
	
	//db.email.report(d.title || '',(d.subcategory || '') + ':' + d.text,name);
	
	return db.report.insert({
		date:new Date().toLocaleString(),
		user:Actor.get(key).username,
		text:d.text,
		title:d.title,
	});
	*/
}

Message.receive.question = function(key,msg){
	Main.handleQuestionAnswer(Main.get(key),msg);
}

Message.parseText = function(data){	//TODO
	var rawData = data;
	data = Tk.replaceBracketPattern(data,Message.parseText.item);
	
	return {
		text:data,
		hasItem:rawData !== data,
	};	
}

Message.parseText.item = function(id){
	var item = ItemModel.get(id,true);
	if(!item) return '[[' + id + ']]';
	if(item.type !== 'equip') 
		return '[' + item.name + ']';
	
	return '<fakea class="message" onclick="exports.Dialog.open(\'equipPopup\',{id:\'' + item.id + '\',notOwning:true});">[' + item.name + ']</span>';
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













