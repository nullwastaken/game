
"use strict";
(function(){ //}
var Dialog, Input, Command, Main, Sfx;
global.onReady(function(){
	Dialog = rootRequire('client','Dialog',true); Input = rootRequire('server','Input',true); Command = rootRequire('shared','Command',true); Main = rootRequire('shared','Main',true); Sfx = rootRequire('client','Sfx',true);
});
var Message = rootRequire('shared','Message');


Message.receive = function(msg){
	msg.text = Message.receive.parseInput(msg.text);
	
	if(msg.type === 'game')
		Dialog.chat.addText(msg.text,msg.timer || 25*60); 
	else if(msg.type === 'public'){
		if(!Main.isIgnoringPlayer(w.main,msg.from))
			Message.receive.public(msg);
	} else if(msg.type === 'input')	
		Dialog.chat.setInput(msg.text,undefined,msg.add);
	else if(msg.type === 'signNotification') 
		Message.receive.signNotification(msg);
	else if(msg.type === 'pm'){
		if(!Main.isIgnoringPlayer(w.main,msg.from))
			Message.receive.pm(msg);
	} else if(msg.type === 'contribution') 
		Dialog.contribution.log(msg);
	else if(msg.type === 'questPopup') 
		Dialog.displayQuestPopup(msg);
	else 
		ERROR(3,'invalid msg type',msg);
}

Message.receive.parseInput = function(text){	//replace [$1] with Input 1 keycode
	if(!text || !text.$contains || !text.$contains('[$')) return text;	//BAD, !text.$contains should be defined?
	for(var i = 0 ; i <= 6; i++){
		var str = '[$' + i + ']';
		while(text.$contains && text.$contains(str))
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
			.attr('title',w.player.name !== msg.from ? 'Shift-Right to mute' : '')
			.bind('contextmenu',function(ev){
				if(w.player.name !== msg.from && ev.shiftKey)
					Command.execute(CST.COMMAND.mute,[msg.from]);
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
	for(var i in w.main.social.friendList) if(i === pack.from) friend = true;
	if(pack.from === w.player.name) friend = true;
	
	var puush = Main.getPref(w.main,'puush');
	if(puush === 0 || (puush === 1 && friend === false)){
		return pack.text.$replaceAll('a href','span href').$replaceAll('</a>','</span>');
	}
	return pack.text;
}

//#######
var PM_FIRST = true;
Message.receive.pm = function(msg){
	var text = null;
	if(msg.from === w.player.name){	//AKA you just sent a pm to someone
		text = $('<span>')
			.html('To ' + msg.to + ': ' +  msg.text);
	} else {
		var from = msg.symbol + msg.from;
		text = $('<span>')
			.html('From ' + from + ': ' +  msg.text)
			.attr('title','Reply')
			.css('cursor','pointer')
			.click(function(e){
				e.preventDefault();
				Dialog.chat.setInput('@' + msg.from + ',',true);
				//Message.clickUsername(msg.from);
				return false;
			});
		Message.reply.HISTORY.unshift(msg);
	}

	Dialog.pm.addText(text,25*60*5);
	
	if(PM_FIRST && msg.from !== w.player.name){
		PM_FIRST = false;
		Dialog.chat.addText('Reply by pressing tab or clicking a username.');
	}
}



Message.receive.signNotification = function(msg){
	if(Main.getPref(w.main,'signNotification') === 0) 
		return;
	Message.receive(Message.Game(msg.text));
	if(Main.getPref(w.main,'signNotification') === 2) 
		Sfx.play('levelUp');
}



Message.clickUsername = function(name){	//in public chat
	/*
	use Message.setInputForPM(key,i);
	Main.setOpti onList(w.main,OptionList.create(name,[
		OptionList.Option(Dialog.chat.setInput,['@' + name + ','],'Send Message'),
		OptionList.Option(Command.execute,['fl,add',[name]],'Add Friend'),
		OptionList.Option(Command.execute,['mute',[name]],'Mute Player'),
	]));
	*/
}

})(); //{
