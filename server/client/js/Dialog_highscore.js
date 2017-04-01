
"use strict";
(function(){ //}
var QueryDb;
global.onReady(function(){
	QueryDb = rootRequire('shared','QueryDb',true);
});
var Dialog = rootRequire('client','Dialog');


Dialog.create('highscore','Highscore',Dialog.Size(400,700),Dialog.Refresh(function(){
	return Dialog.highscore.apply(this,arguments);
}));
//Dialog.open('highscore')
//QueryDb.get('highscore','QlureKill-_score')

Dialog.highscore = function(html,variable,param){	//param: quest, noRefresh, category
	var isCompetition = param === 'competition' || (param && param.quest === 'competition');
	
	if(isCompetition){
		var competition = QueryDb.getCompetition();
		Dialog.highscore.top(html,variable,competition,true);
		Dialog.highscore.table(html,variable,competition);
		return;
	}
	
	if(typeof param === 'string')
		param = {quest:Tk.getSplit0(param,'-'),category:param};
	param = param || {};
	param.quest = param.quest || QueryDb.getHighscoreQuestList().$random();
	param.category = param.category || QueryDb.getHighscoreForQuest(param.quest).$randomAttribute();
	
	variable.param = param;
	
	//Select Quest
	var highscore = QueryDb.get('highscore',param.category,function(){
		Dialog.refresh('highscore',param);
	});
	if(!highscore) 
		return Dialog.close('highscore');
	
	if(param.noRefresh !== true)
		refresh(highscore)();
	
	Dialog.highscore.top(html,variable,highscore);
	Dialog.highscore.table(html,variable,highscore);
	
	return;
}

var refresh = function(highscore){
	return function(){
		QueryDb.get('highscore',highscore.id,function(){
			Dialog.playSfx('select');
			Dialog.refresh('highscore',{quest:highscore.quest,category:highscore.id,noRefresh:true});
		},true);
	}
}

Dialog.highscore.top = function(html,variable,highscore,isCompetition){
	var sel = $('<select>');
	
	sel.append('<option value="competition">Competition</option>');
	
	var list = QueryDb.getHighscoreQuestList();
	for(var i = 0; i < list.length; i++){
		sel.append('<option value="' + list[i] + '">' + QueryDb.getQuestName(list[i]) + '</option>');
	}
	sel.change(function(){
		Dialog.open('highscore',{quest:sel.val()});
	});
	sel.val(isCompetition ? 'competition' : highscore.quest);	//set selected option to the right spot
	html.append('Quest: ',sel);
	
	//#########
	if(isCompetition)
		html.append('<br>Ends on ' + (new Date(highscore.endTime)).toDateString());
	else {
		var sel2 = $('<select>');
		var list = QueryDb.getHighscoreForQuest(highscore.quest);
		for(var i in list){
			sel2.append('<option value="' + i + '">' + QueryDb.getHighscoreName(i) + '</option>');
		}
		sel2.change(function(){
			Dialog.refresh('highscore',{quest:sel.val(),category:sel2.val()});
		});
		sel2.val(highscore.id);
		html.append('<br>Category: ',sel2);
		
		//#########
		html.append('<br>',$('<button>')
			.html('Refresh')
			.css({margin:'10px'})
			.addClass('myButton skinny')
			.click(refresh(highscore))
		);
	}
	
	html.append('<br>');
	var div = $('<div>').css({width:'auto',height:'auto'});
	if(!isCompetition){
		div.html(QueryDb.getHighscoreDescription(highscore.id));
	} else {
		div.append($('<fakea>')
			.click(function(){
				Dialog.open('quest',highscore.quest);
			})
			.html(highscore.questName)
		);
		div.append(': ' + highscore.name + '<br>' + highscore.description);
	}
	
	html.append(div);
	
}

Dialog.highscore.table = function(html,variable,highscore){
	var array = [];
	array.push([
		'Rank',
		'Name',
		'Score',
	]);
	
	if(highscore.score){ //highscore.score can be null if first time opening
		for(var i = 0 ;  i < highscore.score.length; i++){	
			array.push([
				i + 1,
				highscore.score[i].name,
				highscore.score[i].value === null ? '---' : Math.floor(highscore.score[i].value)
			]);
		}
	}
	
	html.append(Tk.arrayToTable(array,true,false,true).css({marginLeft:'auto',marginTop:'10px',marginRight:'auto'}));
}


})();