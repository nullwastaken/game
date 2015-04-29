var Quest = require2('Quest'), Actor = require2('Actor'), Main = require2('Main');
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
		if(mq[i]._complete) sum++;
	
	return sum;
});
s.newHighscore('challengeCount',"Challenge Count","Most Challenges Completed",'descending',function(key){
	var mq = Main.get(key).quest;
	var sum = 0;
	for(var i in mq){
		for(var j in mq[i]._challengeDone)
			sum += mq[i]._challengeDone[j] || 0;
	}
	
	return sum;
});
s.newHighscore('level',"Level","Highest Level",'descending',function(key){
	return s.getLevel(key);
});
s.newHighscore('questScoreSum',"Sum Quest Score","Sum of All Quest Scores",'descending',function(key){
	var mq = Main.get(key).quest;
	var sum = 0;
	for(var i in mq)
		sum += Math.min(mq[i]._rewardScore || 0,10000);
		
	return Math.floor(sum);
});






s.exports(exports);