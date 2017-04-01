
"use strict";
(function(){ //}
var Achievement;
global.onReady(function(){
	Achievement = rootRequire('shared','Achievement');
});
var Main = rootRequire('shared','Main');


Main.Achievement = function(dbData){	//verify global integrity
	dbData = dbData || {};
	var defaultList = Achievement.getDefaultVariable();	// {id:variable}
	
	var a = {};
	for(var i in defaultList){
		a[i] = dbData[i] || Main.Achievement.Part(false,'',defaultList[i]);
	}
	return a;
}

Main.Achievement.Part = function(complete,progressText,variable){
	return {
		//username and id added in compressDb
		complete:!!complete,
		progressText:progressText || '',
		variable:variable || {},
	}
}

Main.Achievement.compressDb = function(ma,main,id){	
	if(ma.complete)
		ma.variable = null;
	else if(ma.variable.$isEmpty())	//dont save if no done and nothing to track
		return null;
	ma.username = main.username;
	delete ma.progressText;
	ma.id = id;
	return ma;
}
Main.Achievement.uncompressDb = function(ma){	//integrity too
	var achievement = Achievement.get(ma.id);
	if(!achievement) 
		return null;
	ma.variable = ma.variable || {};
	ma.progressText = ma.progressText || "";
	
	//add new/remove unsued
	for(var i in achievement.variable){
		if(ma.variable[i] === undefined)
			ma.variable[i] =  Tk.deepClone(achievement.variable[i]);
		if(achievement.variable[i] === undefined)
			delete ma.variable[i];
	}
	ma.progressText = "";	//set in onSignIn
	delete ma.username;
	delete ma.id;
	return ma;
}

Main.achievement = {};
Main.achievement.onAchievementComplete = function(main,achieve){
	main.achievement[achieve.id].complete = true;
	Main.setChange(main,'achievement,' + achieve.id,main.achievement[achieve.id]);
	Main.contribution.onAchievementComplete(main,achieve.name);
	Main.updateCanStartQuest(main);	
}

Main.achievement.onSignIn = function(main){
	for(var i in main.achievement){	//cant full update cuz some require param0,param1
		Achievement.update.progressText(main,Achievement.get(i));	
	}
}

Main.haveCompletedAchievement = function(main,id){
	return main.achievement[id].complete;
}

Main.getCompletedAchievementCount = function(main){
	var count = 0;
	for(var i in main.achievement)
		if(Main.haveCompletedAchievement(main,i))
			count++;
	return count;	
}	


})(); //{