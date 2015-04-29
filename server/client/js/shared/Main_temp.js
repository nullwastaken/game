//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Message = require2('Message');
var Sfx = require4('Sfx'), Song = require4('Song'), Dialog = require4('Dialog');
var Main = require3('Main');

//##################

//############

Main.playSfx = function(main,sfx){
	main.temp.sfx = main.temp.sfx || [];
	main.temp.sfx.push(sfx);
}

Main.playSong = function(main,song){
	main.temp.song = main.temp.song || [];
	main.temp.song.push(song);
}


//################

Main.openDialog = function(main,what,param){	//param = false => close
	main.temp.dialog = main.temp.dialog || {};	
	main.temp.dialog[what] = param === undefined ? 0 : param;
}

Main.closeDialog = function(main,what){
	Main.openDialog(main,what,false);
}

Main.closeDialogAll = function(main){
	Main.openDialog(main,'ALL',false);
}

Main.displayQuestRating = function(main,questRating,abandon,hint){
	main.temp.questRating = {
		quest:questRating,
		abandon:!!abandon,
		hint:abandon ? hint : ''
	};
}

Main.updatePlayerOnline = function(main,playerOnline){
	main.temp.playerOnline = playerOnline;
}

Main.applyTempChange = function(main,temp){	//on client when receive
	if(!temp) return;
	main.popupList = temp.popupList || main.popupList;
	if(temp.message)
		Message.applyTempChange(temp.message);
	if(temp.sfx)
		for(var i = 0 ; i < temp.sfx.length; i++)
			Sfx.play(temp.sfx[i]);
	if(temp.song)
		for(var i = 0 ; i < temp.song.length; i++)
			Song.play(temp.song[i]);
	
	for(var i in temp.dialog){
		if(i === 'ALL'){
			Dialog.closeAll();
			break;
		}
		if(temp.dialog[i] === false)
			Dialog.close(i);
		else
			Dialog.open(i,temp.dialog[i]);
	}
	if(temp.playerOnline){
		Dialog.open('playerOnline',temp);
	}
	
	if(temp.questRating)
		Dialog.open('questRating',temp.questRating);
	
	
	for(var i in temp.screenEffectRemove)
		Main.removeScreenEffect(main,temp.screenEffectRemove[i]);	
	for(var i in temp.screenEffectAdd)
		Main.addScreenEffect(main,temp.screenEffectAdd[i]);
}

})(); //{
