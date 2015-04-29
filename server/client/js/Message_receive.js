//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Dialog = require4('Dialog'), Input = require4('Input'), Command = require4('Command'), Main = require4('Main'), Sfx = require4('Sfx');
var Message = require3('Message');

var ADMIN_USERNAME = 'rc';

Message.receive = function(msg){
	msg.text = Message.receive.parseInput(msg.text);
	if(Main.isIgnoringPlayer(main,msg.from)) 
		return;
	
	if(msg.type === 'game')	Dialog.chat.addText(msg.text,msg.timer || 25*60); 
	else if(msg.type === 'public') Message.receive.public(msg);
	else if(msg.type === 'input')	Dialog.chat.setInput(msg.text,undefined,msg.add);
	else if(msg.type === 'signNotification') Message.receive.signNotification(msg);
	else if(msg.type === 'pm')	Message.receive.pm(msg);
	else if(msg.type === 'contribution') Dialog.contribution.log(msg);
	else if(msg.type === 'questPopup') Dialog.displayQuestPopup(msg);
	else 
		return ERROR(3,'invalid msg type',msg);
	/*
	else if(msg.type === 'clan') 	Message.receive.clan(msg);
	*/
}

Message.receive.parseInput = function(text){	//replace [$1] with Input 1 keycode
	if(!text || !text.$contains('[$')) return text;
	for(var i = 0 ; i <= 6; i++){
		var str = '[$' + i + ']';
		while(text.$contains(str))
			text = text.replace(str,Input.getKeyName('ability',i,true));	//replaceall with $ is pain
	}
	return text;
}	

Message.receive.public = function(msg){
	var text = $('<span>')
		.append($('<span>')
			.html(
				(msg.symbol || '')
				+ msg.from + ': '
			)
			.attr('title',player.name !== msg.from ? 'Shift-Right to mute' : '')
			.bind('contextmenu',function(ev){
				if(player.name !== msg.from && ev.shiftKey)
					Command.execute('mute',[msg.from]);
			})
		)
		.append($('<span>')
			.css({color:msg.color || 'yellow'})
			.html(msg.text)
		);
	
	Dialog.chat.addText(text); 
}

Message.receive.public.puush = function(pack){
	var friend = false;
	for(var i in main.social.friendList) if(i === pack.from) friend = true;
	if(pack.from === player.name) friend = true;
	
	var puush = Main.getPref(main,'puush');
	if(pack.from !== ADMIN_USERNAME && puush === 0 || (puush === 1 && friend === false)){
		return pack.text.$replaceAll('a href','span href').$replaceAll('</a>','</span>');
	}
	return pack.text;
}

//#######

Message.receive.pm = function(msg){
	var text;
	if(msg.from === player.name){	//AKA you just sent a pm to someone
		text = $('<span>')
			.html('To ' + msg.to + ': ' +  msg.text);
	} else {
		var from = msg.symbol + msg.from;
		text = $('<span>')
			.html('From ' + from + ': ' +  msg.text)
			.attr('title','Click to reply')
			.click(function(e){
				e.preventDefault();
				Dialog.chat.setInput('@' + msg.from + ',',true);
				//Message.clickUsername(msg.from);
				return false;
			});
		Message.reply.HISTORY.unshift(msg);
	}

	Dialog.pm.addText(text,25*60*5);
}

Message.receive.signNotification = function(msg){
	if(Main.getPref(main,'signNotification') === 0) 
		return;
	Message.receive(Message.Game(msg.text));	
	if(Main.getPref(main,'signNotification') === 2) 
		Sfx.play('train');
}



Message.clickUsername = function(name){	//in public chat
	/*
	use Message.setInputForPM(key,i);
	Main.setOpti onList(main,OptionList.create(name,[
		OptionList.Option(Dialog.chat.setInput,['@' + name + ','],'Send Message'),
		OptionList.Option(Command.execute,['fl,add',[name]],'Add Friend'),
		OptionList.Option(Command.execute,['mute',[name]],'Mute Player'),
	]));
	*/
}

})(); //{
