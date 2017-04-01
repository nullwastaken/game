
"use strict";
(function(){ //}
var Quest, Sfx, Song, Dialog;
global.onReady(function(){
	Quest = rootRequire('server','Quest');
	Sfx = rootRequire('client','Sfx',true); Song = rootRequire('client','Song',true); Dialog = rootRequire('client','Dialog',true);
});
var Main = rootRequire('shared','Main');

Main.setTemp = function(main,what,param,array){	//openDialog doesnt use that
	if(array){
		main.temp[what] = main.temp[what] || [];
		main.temp[what].push(param);
	} else 
		main.temp[what] = param;
}

Main.playSfx = function(main,sfx,volume){
	if(SERVER)
		Main.setTemp(main,'sfx',sfx,true);
	else
		Sfx.play(sfx,volume);
}

Main.playSong = function(main,song){
	if(SERVER)
		Main.setTemp(main,'song',song,true);
	else
		Song.play(song);
}

Main.openDialog = function(main,what,param){	//param = false => close
	main.temp.dialog = main.temp.dialog || {};
	main.temp.dialog[what] = main.temp.dialog[what] || [];
	
	param = param === undefined ? true : param;
	main.temp.dialog[what].push(param);
}

Main.closeDialog = function(main,what){
	Main.openDialog(main,what,false);
}

Main.closeDialogAll = function(main){
	Main.openDialog(main,Main.closeDialogAll.ALL,false);
}
Main.closeDialogAll.ALL = 'ALL';

Main.displayQuestFeedback = function(main,questToRate,abandon,hint){
	Main.canRateQuest(main,questToRate,function(res){
		Main.setTemp(main,'questFeedback',Main.QuestFeedbackParam(questToRate,abandon,res,abandon ? hint : ''));
	});
}

Main.QuestFeedbackParam = function(quest,abandon,displayStar,hint,embed){	//bad
	return {
		quest:quest || '',
		abandon:abandon || false,
		displayStar:displayStar || false,
		hint:hint || '',	
		embed:embed || false
	}
}



Main.canRateQuest = function(main,quest,cb){
	if(main.quest[quest].complete > 1)
		return cb(false);
	Quest.canRate(main.username,quest,cb);
}

Main.updatePlayerOnline = function(main,playerOnline){
	main.temp.playerOnline = playerOnline;
}

Main.onChange('dialog',function(main,data){
	for(var i in data){
		if(i === Main.closeDialogAll.ALL){
			Dialog.closeAll();
			break;
		}
		for(var j = 0 ; j < data[i].length; j++){
			if(data[i][j] === false)
				Dialog.close(i);
			else
				Dialog.open(i,data[i][j]);
		}
	}
});

Main.onChange('playerOnline',function(main,data){
	Dialog.open('playerOnline',data);
});

Main.onChange('questFeedback',function(main,data){
	Dialog.open('questFeedback',data);
});
	
Main.onChange('song',function(main,data){
	for(var i = 0 ; i < data.length; i++)
		Song.play(data[i]);
});

Main.onChange('sfx',function(main,data){
	for(var i = 0 ; i < data.length; i++)
		Sfx.play(data[i]);
});

Main.onChange('name',function(main,name){
	main.name = name;
	w.player.name = name;
	localStorage.setItem('username',name);
});	

Main.onChange('removePassword',function(main,data){
	localStorage.setItem('password','');
	Dialog.refresh('account');
});






})(); //{
