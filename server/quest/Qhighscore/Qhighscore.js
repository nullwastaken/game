var Quest, Actor, Main;
global.onReady(function(){
	Quest = rootRequire('server','Quest'); Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main');
});


//11/27/2014 11:14 AM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

var s = loadAPI('v1.0','Qhighscore',{
	name:'Global Highscore',
	author:'rc',
	showInTab:false,
	dailyTask:false,
	completable:false,
	globalHighscore:true,
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:

*/

s.newVariable({
});

s.newHighscore('questCount',"Quest Count","Most Quests Completed",'descending',function(key){
	var mq = Main.get(key).quest;
	var sum = 0;
	for(var i in mq)
		if(mq[i].complete) 
			sum++;
	if(sum > 0)
		return sum;
});
s.newHighscore('challengeCount',"Challenge Count","Most Challenges Completed",'descending',function(key){
	var mq = Main.get(key).quest;
	var sum = 0;
	for(var i in mq){
		for(var j in mq[i].challengeDone)
			sum += mq[i].challengeDone[j] || 0;
	}
	if(sum > 0)
		return sum;
});
s.newHighscore('level',"Level","Highest Level",'descending',function(key){
	var lvl = s.getLevel(key);
	if(lvl > 0)
		return lvl;
});
s.newHighscore('questScoreSum',"Sum Quest Score","Sum of All Quest Scores",'descending',function(key){
	var mq = Main.get(key).quest;
	var sum = 0;
	for(var i in mq)
		sum += Math.min(mq[i].rewardScore || 0,10000);
	if(sum > 0)
		return Math.floor(sum);
});
s.newHighscore('achievementCount',"Achievement Count","Most Achievements Completed",'descending',function(key){
	var count = Main.getCompletedAchievementCount(Main.get(key));
	if(count > 0)
		return count;
});

s.exports(exports);