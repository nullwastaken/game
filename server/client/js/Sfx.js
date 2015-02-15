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

Sfx.create('arrowHit','rpg/arrowHit.ogg'); 
Sfx.create('aura','rpg/aura.ogg'); 
Sfx.create('bind','rpg/bind.ogg'); 
Sfx.create('boost','rpg/boost.ogg'); 
Sfx.create('boostRed','rpg/boostRed.ogg'); 
Sfx.create('coldBomb','rpg/coldBomb.ogg'); 
Sfx.create('coldHit','rpg/coldHit.ogg'); 
Sfx.create('curse','rpg/curse.ogg'); 
Sfx.create('earthBomb','rpg/earthBomb.ogg'); 
Sfx.create('earthHit','rpg/earthHit.ogg'); 
Sfx.create('fireBomb','rpg/fireBomb.ogg'); 
Sfx.create('fireBomb2','rpg/fireBomb2.ogg'); 
Sfx.create('fireHit','rpg/fireHit.ogg'); 
Sfx.create('fireHit2','rpg/fireHit2.ogg'); 
Sfx.create('heal','rpg/heal.ogg'); 
Sfx.create('lightningBomb','rpg/lightningBomb.ogg'); 
Sfx.create('lightningBomb2','rpg/lightningBomb2.ogg'); 
Sfx.create('lightningHit','rpg/lightningHit.ogg'); 
Sfx.create('magicBomb','rpg/magicBomb.ogg'); 
Sfx.create('magicHit','rpg/magicHit.ogg'); 
Sfx.create('rangeBomb','rpg/rangeBomb.ogg'); 
Sfx.create('scratch','rpg/scratch.ogg'); 
Sfx.create('scratch2','rpg/scratch2.ogg'); 
Sfx.create('slashMelee','rpg/slashMelee.ogg'); 
Sfx.create('slashFire','rpg/slashFire.mp3'); 
Sfx.create('slashCold','rpg/slashCold.mp3'); 
Sfx.create('slashLightning','rpg/slashLightning.mp3'); 
Sfx.create('strikeHit','rpg/strikeHit.ogg'); 
Sfx.create('waterBomb','rpg/waterBomb.ogg'); 
Sfx.create('windBomb','rpg/windBomb.ogg'); 





/*
"boostWhite":2,
"boostPink":2,
"boostRed":6,
"slashMelee":3,
"strikeHit":13,
"splashMelee":2,
"lightningHit":15,
"magicBomb":2,
"fireHit":19,
"fireBomb":3,
"coldHit":8,
"lightningBomb":2,
"aura":1,
"earthBomb":3,
"rangeBomb":1,
"coldBomb":1,
"scratch":2,
"scratch2":2,
"bind":4,
"curseGreen":1,
"cursePink":4,
"slashLightning":1,
"slashFire":2,
"magicHit":1,
"earthHit":2,
"slashCold":1}
*/

Sfx.play = function(id,volume){
	var sfx = DB[id];
	if(!sfx) return ERROR(3,'no sfx with that id',id);
	var vol = volume === undefined ? 1 : volume;
	vol *= sfx.volume;
	vol *= Main.getPref(main,'volumeSfx')/100 * Main.getPref(main,'volumeMaster')/100;
	if(vol === 0) return;
	
	for(var i in sfx.list){
		if(sfx.list[i].ended || !sfx.list[i].currentTime){	//ended or never started
			var s = sfx.list[i];
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


