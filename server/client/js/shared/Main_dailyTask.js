
"use strict";
(function(){ //}
var Quest;
global.onReady(function(){
	Quest = rootRequire('server','Quest');
});
var Main = rootRequire('shared','Main');


Main.verifyDailyTask = function(main,q,challengeSuccess){	//called when quest complete
	for(var i in main.dailyTask){
		var task = main.dailyTask[i];
		if(task.quest === q.id && (!task.challenge || (challengeSuccess && challengeSuccess.id === task.challenge))){	//no challenge or success
			Main.addMessage(main,'Daily Task #' + (+i+1) +  ' Completed!');
			Main.addMessage(main,'Bonus: x10 Reputation, x5 Exp, x3 Item, and 1 Plan!');	//not actually x10, its +10
			//Main.addItem(main,P lan.quickCreation(key));
			main.dailyTask.splice(i,1);
			Main.setChange(main,'dailyTask',main.dailyTask);
			return true;
		}
	}
	return false;
}

Main.updateDailyTask = function(main){	//DEAD
	return;
	/*if(main.dailyTask.length >= 3)	main.dailyTask.shift();
	
	var task = DailyTask.generateRandom();
	main.dailyTask.push(task);
	
	Main.addMessage(main,'Complete this Daily Challenge for massive rewards: ' + task.description);*/
}


//##########

var DailyTask = exports.DailyTask = function(quest,challenge){
	var tmp = {
		quest:quest,
		challenge:challenge,
		description:'',	
	}
	
	var q = Quest.get(quest);
	if(!q) return ERROR(2,'quest not exist',quest);
	if(challenge) tmp.description = 'Complete the quest ' + q.name + ' with the challenge ' + q.challenge[challenge].name + ' active.';
	else tmp.description = 'Complete the quest ' + q.name + '.';
	return tmp;
}

DailyTask.generateRandom = function(){
	var quest = Quest.getRandomDaily();		
	var challenge = quest.challenge.$randomAttribute() || '';
	return DailyTask(quest.id,challenge);
}





})();



