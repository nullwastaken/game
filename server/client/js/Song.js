//Note: Song files were not included in this github version.
"use strict";
(function(){ //}
var Main;
global.onReady(function(){
	Main = rootRequire('shared','Main',true);
},null,'Song',['Main'],function(){
	Song.playRandom();
});
var Song = exports.Song = {};

var BEING_PLAYED = null;
Song.create = function(id,src,author,link,name,volume){
	return; //TODO
	var tmp = {
		id:id,
		src:'/audio/song/' + src,
		defaultVolume:volume || 1,
		audio:null,
		name:name || id.$replaceAll('_',' ').$capitalize() ,
		link:link || '',
		author:author || '',
	}
	
	DB[id] = tmp;
};

Song.getAudio = function(song){
	return; //TODO
	try {
		if(song.audio)
			return song.audio;
		song.audio = new Audio();
		song.audio.src = song.src;
		song.audio.volume = song.defaultVolume;
		song.audio.addEventListener("ended", Song.ended);
		return song.audio;
	} catch(err){
		ERROR.err(3,err);
		return null;
	}
}

	
var DB = Song.DB = {};
Song.create('carol_of_the_balls','carol_of_the_balls.mp3','Evil-Dog','http://www.newgrounds.com/audio/listen/561212');
Song.create('crimson_crisis','crimson_crisis.mp3','Darknessbreaker','http://www.newgrounds.com/audio/listen/556797');
Song.create('digital_insanity','digital_insanity.mp3','DJM4C','http://www.newgrounds.com/audio/listen/517360');
Song.create('final_battle','final_battle.mp3','K-Pone','http://www.newgrounds.com/audio/listen/546497');
Song.create('jur','jur.mp3','3kliksphilip','http://www.newgrounds.com/audio/listen/488195');
Song.create('super_gourmet_race','super_gourmet_race.mp3','MiguelVolkov','http://www.newgrounds.com/audio/listen/540968');
Song.create('game_it_all_day','game_it_all_day.mp3','Getcheffy','http://www.newgrounds.com/audio/listen/476685');

//forest http://www.newgrounds.com/audio/listen/483912
//http://www.newgrounds.com/audio/listen/568699
	
Song.play = function(songInfo,volumeMod){
	return; //TODO
	try {
		if(typeof songInfo === 'string')
			songInfo = {id:songInfo,volume:1};
		volumeMod = volumeMod === undefined ? songInfo.volume : volumeMod;
		
		var song = DB[songInfo.id];
		if(!song)
			return ERROR(3,'invalid song id',songInfo.id);
		var audio = Song.getAudio(song);
		if(!audio)
			return;
		if(audio.readyState !== 4){
			audio.oncanplay = function(){
				Song.play(songInfo,volumeMod);
			}
			return;	
		}
		
		var vol = volumeMod;
		vol *= Main.getPref(w.main,'volumeSong')/100 * Main.getPref(w.main,'volumeMaster')/100;
		
		audio.volume = vol;
		
		if(BEING_PLAYED) 
			Song.getAudio(BEING_PLAYED).pause();
		BEING_PLAYED = song;
		audio.play();
		//$(audio).animate({volume: vol}, 2000);
	} catch(err){
		ERROR.err(3,err);
	}
}


Song.ended = function(){
	return; //TODO
	var next;
	do { 
		next = Object.keys(DB).$random();
	} while(next === (BEING_PLAYED && BEING_PLAYED.id))
	Song.play(next);	
}
Song.getSongBeingPlayed = function(){
	return BEING_PLAYED;
}

Song.updateVolume = function(){
	if(BEING_PLAYED)
		BEING_PLAYED.audio.volume = Main.getPref(w.main,'volumeSong')/100 * Main.getPref(w.main,'volumeMaster')/100;
}
Song.getCurrentSongInfo = function(){
	if(!BEING_PLAYED) 
		return 'No song being played...';
	return '<a class="message" target="_blank" href="' + BEING_PLAYED.link + '">\"' + BEING_PLAYED.name + '\"</a> by ' + BEING_PLAYED.author;
}



Song.playRandom = function(){
	return; //TODO
	Song.play(Object.keys(DB).$random());
}

})();


