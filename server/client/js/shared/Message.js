//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
eval(loadDependency(['Server','Save','ItemList','Main','Contribution'],['Message']));

var Message = exports.Message = function(type,text,from,extra){	//extra comes from Message._something
	if(!Message.TYPE.contains(type)) return ERROR(3,'invalid type',type);
	var msg = {
		type:type,
		text:text,
		from:from || Message.SERVER,
	}
	for(var i in extra) msg[i] = extra[i];
	return msg;	
}
Message.SERVER = '$server';
Message.TYPE = [ //{
	'game',	//appear in chatbox
	'public', //appear in chatbox
	'clan', //appear in chatbox with clan name
	'pm', //appear in pmbox
	'report',	//logged in db
	'questionAnswer', //when client answers
	'input',	//overwrite chat input
	'contribution',	//appear in contribution box
	'signNotification',	//appear chatbox. called when player logs in game
]; //}


Message.Clan = function(clan){
	return {
		clan:clan
	}
}
Message.Pm = function(to){
	return {
		to:to,
	}
}

//#############

Message.Public = function(customChat){
	return {
		symbol:customChat.symbol,
		color:customChat.color,
	}
}


Message.Report = function(title){
	return {
		title:title || '',
	};
}

Message.uncompressClient = function(msg){
	if(typeof msg === 'string') return Message('game',msg,Message.SERVER);	//for compression
	return msg;
}
	
//###############




