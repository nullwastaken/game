//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Main = require4('Main');

var Song = exports.Song = {};
var BEING_PLAYED = null;
Song.create = function(id,src,author,link,name,volume){
	var tmp = {
		id:id,
		src:'music/song/' + src,
		audio:new Audio(),
		name:name || id.$replaceAll('_',' ').$capitalize() ,
		link:link || '',
		author:author || '',
	}
	tmp.audio.src = tmp.src;
	tmp.audio.volume = volume || 1;
	tmp.audio.addEventListener("ended", Song.ended);
	DB[id] = tmp;
};
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
	if(typeof songInfo === 'string')
		songInfo = {id:songInfo,volume:1};
	volumeMod = volumeMod === undefined ? songInfo.volume : volumeMod;
	
	var song = DB[songInfo.id];
	if(!song)
		return ERROR(3,'invalid song id',songInfo.id);
		
	if(song.audio.readyState !== 4){
		song.audio.oncanplay = function(){
			Song.play(songInfo,volumeMod);
		}
		return;	
	}
	
	var vol = volumeMod;
	vol *= Main.getPref(main,'volumeSong')/100 * Main.getPref(main,'volumeMaster')/100;
	
	song.audio.volume = vol;
	
	if(BEING_PLAYED) 
		BEING_PLAYED.audio.pause();
	BEING_PLAYED = song;
	song.audio.play();
	//$(audio).animate({volume: vol}, 2000);
}


Song.ended = function(){
	var next;
	do { 
		next = Object.keys(DB).$random();
	} while(next === BEING_PLAYED.id)
	Song.play(next);	
}
Song.getSongBeingPlayed = function(){
	return BEING_PLAYED;
}

Song.updateVolume = function(){
	if(BEING_PLAYED)
		BEING_PLAYED.audio.volume = Main.getPref(main,'volumeSong')/100 * Main.getPref(main,'volumeMaster')/100;
}
Song.getCurrentSongInfo = function(){
	if(!BEING_PLAYED) return 'No song being played...';
	return '<a class="message" target="_blank" href="' + BEING_PLAYED.link + '">\"' + BEING_PLAYED.name + '\"</a> by ' + BEING_PLAYED.author;
}

Song.playRandom = function(){
	Song.play(Object.keys(DB).$random());
}

})();


