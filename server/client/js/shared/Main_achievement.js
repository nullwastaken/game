//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Achievement = require2('Achievement');
var Main = require3('Main');

Main.Achievement = function(dbData){
	var defaultList = Achievement.getDefaultVariable();	// {id:variable}
	
	var a = {};
	for(var i in defaultList){
		a[i] = (dbData && dbData[i]) || Main.Achievement.Part(false,'',defaultList[i]);
	}
	return a;
}

Main.Achievement.Part = function(complete,progressText,variable){
	return {
		complete:!!complete,
		progressText:progressText || '',
		variable:variable || {},
	}
}

Main.Achievement.compressDb = function(a){
	return a;
}
Main.Achievement.uncompressDb = function(a){
	return Main.Achievement(a);
}

Main.achievement = {};
Main.achievement.onAchievementComplete = function(main,achieve){
	main.achievement[achieve.id].complete = true;
	Main.setFlag(main,'achievement',achieve.id);
	Main.updateCanStartQuest(main);	
}

Main.achievement.onSignIn = function(main){
	for(var i in main.achievement){
		main.achievement[i].progressText = Achievement.get(i).getProgressText(main,main.achievement[i].variable);
	}
}

Main.hasCompletedAchievement = function(main,id){
	return main.achievement[id].complete;
}

Main.getCompletedAchievementCount = function(main){
	var count = 0;
	for(var i in main.achievement)
		if(Main.hasCompletedAchievement(main,i))
			count++;
	return count;	
}	


})(); //{