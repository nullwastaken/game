
"use strict";
(function(){ //}
var IconModel, Main;
global.onReady(function(){
	IconModel = rootRequire('shared','IconModel'); Main = rootRequire('shared','Main',true);
	
	if(!SERVER)
		Main.onChange('message',Message.onMainChange);
});
var Message = exports.Message = {};
//BAD weird constructor
Message.create = function(msg){
	if(!msg || !Message.TYPE.$contains(msg.type)) 
		return ERROR(3,'invalid msg',msg);
	return msg;	
}
Message.SERVER = '$server';
Message.TYPE = [ //{
	'game',	//appear in chatbox
	'public', //appear in chatbox
	//'clan', //appear in chatbox with clan name
	'pm', //appear in pmbox
	//'report',	//logged in db
	'questionAnswer', //when client answers
	'input',	//overwrite chat input
	'contribution',	//appear in contribution box
	'questPopup',
	'signNotification',	//appear chatbox. called when player logs in game
]; //}

Message.Pm = function(text,from,to,symbol){
	return Message.create({
		type:'pm',
		text:text,
		from:from,
		to:to,
		symbol:symbol || '',
	});
}

//#############

Message.Contribution = function(text,scroll){
	return Message.create({
		type:'contribution',
		text:text || '',
		scroll:scroll || false,
	});
}
Message.SignNotification = function(text){
	return Message.create({
		type:'signNotification',
		text:text,
	});
}
Message.QuestionAnswer = function(id,text){
	return Message.create({
		id:id,
		type:'questionAnswer',
		text:text,
	});
}
Message.Input = function(text,add){
	return Message.create({
		type:'input',
		text:text,
		add:add||false,
	});
}
Message.Game = function(text,from){
	return Message.create({
		type:'game',
		text:text,
		from:from || Message.SERVER,
	})
}

Message.Public = function(text,from,color,symbol){
	return Message.create({
		type:'public',
		text:text,
		from:from,
		color:color || 'yellow',
		symbol:symbol || '',
	})
}

Message.QuestPopup = function(text){
	return Message.create({
		type:'questPopup',
		text:text,
	});
}

Message.uncompressClient = function(msg){
	if(typeof msg === 'string') 
		return Message.Game(msg,Message.SERVER);	//for compression
	return msg;
}

Message.onMainChange = function(main,list){
	for(var i = 0 ; i < list.length; i++)
		list[i] = Message.uncompressClient(list[i]);
	
	var str = '';
	for(var i = 0 ; i < list.length; i++){
		if(list[i].type === 'questPopup')
			str += list[i].text + "<br><br>";
		else 
			Message.receive(list[i]);
	}
	if(str)
		Message.receive(Message.QuestPopup(str.slice(0,-8)));	//-8 to remove <br><br>
}
	
Message.iconToText = function(id,extra){
	return IconModel.toText(id,null,null,extra);
}	

Message.funcToText = function(func,content){	//similar to Message.generateTextLink
	if(func.$contains('"'))
		ERROR(3,'func contains "');
	return '<span style="cursor:pointer" onclick="' + func + '">' + content + '</span>';
}	

//###############

})(); //{



