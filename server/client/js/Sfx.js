//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}

var Main = require4('Main');
var Sfx = exports.Sfx = {};

Sfx.create = function(id,src,volume){
	var tmp = {
		id:id,
		src:'music/sfx/' + src,
		volume:volume || 1,
		list:[],
	};
	for(var j = 0 ; j < 3 ; j++){	//cant only use 1 copy otherwise impossible to play 2 times same sfx same time	
		var audio = new Audio();
		audio.src = tmp.src;
		tmp.list.push(audio);
	}	
	DB[id] = tmp;
}
var DB = Sfx.DB = {};


Sfx.create('error','beep-03.ogg');
Sfx.create('menu','button-3.ogg',0.1);
Sfx.create('close','switch-1.ogg');		
Sfx.create('explosion','explosion.mp3');//SoundBible.com-1777900486
Sfx.create('train','train.mp3');//http://soundbible.com/2070-Railroad-Crossing-Bell.html
Sfx.create('swoosh','swoosh.mp3');//SoundBible.com-231145780
Sfx.create('sword','sword.ogg'); //SoundBible.com-912903192
/*
Sfx.create('boost','boost.mp3'); //http://soundbible.com/2017-End-Fx.html
Sfx.create('lightningHit','lightningHit.ogg'); 	//http://soundbible.com/1320-Short-Circuit.html
Sfx.create('fireBomb','fireBomb.mp3');  //http://soundbible.com/1359-Small-Fireball.html
Sfx.create('slashFire','slashFire.mp3'); //http://soundbible.com/1356-Flame-Arrow.html

Sfx.create('blop','blop.mp3'); //http://soundbible.com/2067-Blop.html
Sfx.create('splashMelee','splashMelee.mp3'); //http://soundbible.com/1773-Strong-Punch.html

Sfx.create('strikeHit','strikeHit.ogg'); //http://soundbible.com/1418-Sharp-Punch.html

Sfx.create('pew','pew.mp3');  //http://soundbible.com/1949-Pew-Pew.html
Sfx.create('sad_trombone','sad_trombone.mp3');  //http://soundbible.com/1830-Sad-Trombone.html

Sfx.create('earthHit','earthHit.mp3');  //http://soundbible.com/2075-RPG-Plus-Shrapnel.html
Sfx.create('earthBomb','earthHit.mp3');  //http://soundbible.com/2075-RPG-Plus-Shrapnel.html

Sfx.create('rangeBomb','rangeBomb.mp3');  //AKA wind //http://soundbible.com/1247-Wind.html
*/

Sfx.create('arrowHit','rpg/arrowHit.mp3'); 
Sfx.create('bind','rpg/bind.mp3'); 
Sfx.create('boost','rpg/boost.mp3');
Sfx.create('boostRed','rpg/boostRed.mp3'); 
Sfx.create('coldBomb','rpg/coldBomb.mp3'); 
Sfx.create('coldHit','rpg/coldHit.mp3'); 
Sfx.create('curse','rpg/curse.mp3'); 
Sfx.create('earthBomb','rpg/earthBomb.mp3'); 
Sfx.create('earthHit','rpg/earthHit.mp3'); 
Sfx.create('fireBomb2','rpg/fireBomb2.mp3'); 
Sfx.create('fireHit','rpg/fireHit.mp3'); 
Sfx.create('fireHit2','rpg/fireHit2.mp3'); 
Sfx.create('heal','rpg/heal.mp3'); 
Sfx.create('lightningBomb','rpg/lightningBomb.mp3'); 
Sfx.create('lightningBomb2','rpg/lightningBomb2.mp3'); 
Sfx.create('lightningHit','rpg/lightningHit.mp3'); 
Sfx.create('magicBomb','rpg/magicBomb.mp3'); 
Sfx.create('magicHit','rpg/magicHit.mp3'); 
Sfx.create('rangeBomb','rpg/rangeBomb.mp3'); 
Sfx.create('scratch','rpg/scratch.mp3');
Sfx.create('slashMelee','rpg/slashMelee.mp3'); 
Sfx.create('slashFire','rpg/slashFire.mp3'); 
Sfx.create('slashCold','rpg/slashCold.mp3'); 
Sfx.create('slashLightning','rpg/slashLightning.mp3'); 
Sfx.create('strikeHit','rpg/strikeHit.mp3');


Sfx.play = function(sfxInfo,volumeMod){
	if(typeof sfxInfo === 'string')
		sfxInfo = {id:sfxInfo,volume:1};
	volumeMod = volumeMod === undefined ? sfxInfo.volume : volumeMod;

	var sfxModel = DB[sfxInfo.id];
	if(!sfxModel) 
		return ERROR(3,'no sfx with that id',sfxInfo.id);
	var vol = volumeMod;
	vol *= sfxModel.volume;
	vol *= Main.getPref(main,'volumeSfx')/100 * Main.getPref(main,'volumeMaster')/100;
	if(vol === 0) 
		return;
	
	for(var i in sfxModel.list){
		var s = sfxModel.list[i];
		if(s.ended || !s.currentTime){	//ended or never started
			s.volume = vol;
			s.play();
			return;
		}
	}
}


Sfx.Base = function(id,volume){	//used by AnimModel
	return {
		id:id,
		volume:volume || 1,	
	}
}

})(); //{


