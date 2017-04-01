//Note: Sfx files were not included in this github version.
"use strict";
(function(){ //}

var Main;
global.onReady(function(){
	Main = rootRequire('shared','Main',true);
	global.onLoop(Sfx.loop);
});
var Sfx = exports.Sfx = function(extra){
	this.id = '';
	this.src = '';
	this.baseVolume = 1;
	this.list = [];	//Audio[]
	Tk.fillExtra(this,extra);
};

var DUPLICATE_SFX = 7;

Sfx.create = function(id,src,baseVolume){
	return; //TODO
	var tmp = new Sfx({
		id:id,
		src:'/audio/sfx/' + src,
		baseVolume:baseVolume,
	});
	try {
		for(var j = 0 ; j < DUPLICATE_SFX ; j++){	//cant only use 1 copy otherwise impossible to play 2 times same sfx same time	
			var aud = new Audio();
			aud.src = tmp.src;
			tmp.list.push(aud);
			//tmp.list.push(null);	//list of Audio, set when play
		}	
	}catch(err){}
	DB[id] = tmp;
}
var DB = Sfx.DB = {};


Sfx.create('error','error.ogg',0.2);
Sfx.create('close','close.ogg');		
Sfx.create('explosion','explosion.mp3');//SoundBible.com-1777900486
Sfx.create('swoosh','swoosh.mp3');//SoundBible.com-231145780
Sfx.create('sword','sword.ogg'); //SoundBible.com-912903192

Sfx.create('select','select.ogg',0.2); //Yume Freebie Vol. 1, by plasterbrain
Sfx.create('levelUp_long','levelUp_long.ogg'); //Yume Freebie Vol. 1, by plasterbrain
Sfx.create('levelUp','levelUp.ogg',0.8); //Yume Freebie Vol. 1, by plasterbrain
Sfx.create('mouseover','mouseover.ogg',0.4); //Yume Freebie Vol. 1, by plasterbrain

//
Sfx.create('chop','rpg/chop.mp3'); 
Sfx.create('chest','rpg/chest.mp3'); 
Sfx.create('death','rpg/death.mp3');
Sfx.create('mine','rpg/mine.mp3'); 
Sfx.create('push','rpg/push.mp3'); 
Sfx.create('teleport','rpg/teleport.mp3'); 
Sfx.create('switch','rpg/switch.mp3'); 

//
Sfx.create('arrowHit','rpg/arrowHit.mp3'); 
Sfx.create('bind','rpg/bind.mp3'); 
Sfx.create('boost','rpg/boost.mp3');
Sfx.create('coldBomb','rpg/coldBomb.mp3'); 
Sfx.create('coldHit','rpg/coldHit.mp3'); 
Sfx.create('curse','rpg/curse.mp3'); 
Sfx.create('earthBomb','rpg/earthBomb.mp3'); 
Sfx.create('earthHit','rpg/earthHit.mp3'); 
Sfx.create('fireBomb2','rpg/fireBomb2.mp3'); 
Sfx.create('fireHit','fireHit_short.mp3');
Sfx.create('heal','rpg/heal.mp3'); 
Sfx.create('lightningBomb','rpg/lightningBomb.mp3'); 
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

var PLAYED_THIS_FRAME = {};
Sfx.play = function(sfxInfo,volumeMod){
	return; //TODO
	try {
		if(typeof sfxInfo === 'object'){
			var vol = sfxInfo.volume;
			if(volumeMod !== undefined)
				vol *= volumeMod;
			return Sfx.play(sfxInfo.id,vol);
		}
		if(PLAYED_THIS_FRAME[sfxInfo])
			return;
		PLAYED_THIS_FRAME[sfxInfo] = true;
		
		
		var id = sfxInfo;
		var volumeMod = volumeMod === undefined ? 1 : volumeMod;
		
		var sfxModel = DB[id];
		if(!sfxModel) 
			return ERROR(3,'no sfx with that id',id);
		
		var vol = volumeMod;
		vol *= sfxModel.baseVolume;
		vol *= Main.getPref(w.main,'volumeSfx')/100 * Main.getPref(w.main,'volumeMaster')/100;
		if(vol === 0) 
			return;
		
		for(var i = 0 ; i < sfxModel.list.length; i++){
			if(!sfxModel.list[i]){
				sfxModel.list[i] = new Audio();
				sfxModel.list[i].src = sfxModel.src;
			}
			var s = sfxModel.list[i];		
			if(s.readyState === 4 && (s.ended || s.currentTime === 0)){	//ended or never started
				s.volume = Math.max(0,Math.min(1,Tk.round(vol,2)));
				//INFO(sfxInfo,s.volume);
				s.play();
				return;
			}
		}
	} catch(err){
		ERROR.err(3,err);
	}
}
Sfx.loop = function(){
	PLAYED_THIS_FRAME = {};
}
Sfx.Base = function(id,volume){	//used by AnimModel
	return {
		id:id,
		volume:volume || 1,	
	}
}

})(); //{


