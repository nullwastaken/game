//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var QueryDb = require4('QueryDb'), Command = require4('Command'), Actor = require4('Actor');
var Dialog = require3('Dialog');

Dialog.create('quest','Quest',Dialog.Size(950,600),Dialog.Refresh(function(){
	return Dialog.quest.apply(this,arguments);
},function(html,variable){
	return Tk.stringify(main.quest[variable.quest]) + variable.quest + main.questActive;
}),{
	quest:null,
});
//Dialog.open('quest')

Dialog.quest = function (html,variable,param){
	var q = QueryDb.get('quest',param,function(){
		Dialog.open('quest',param);
	});
	if(!q) return false;
	var mq = main.quest[param];
	variable.quest = param;
	
	var chalDiv = Dialog.quest.challenge(q,mq);
	var expectedDiv = Dialog.quest.expectedReward(q,mq);
	var startDiv = Dialog.quest.start(q,mq);
	var nailDiv = Dialog.quest.thumbnail(q,mq);
	var statusDiv = Dialog.quest.status(q,mq);
	var highStatDiv = $("<div>").append(Dialog.quest.statistic(q,mq),'<br>',Dialog.quest.highscore(q,mq));
	
	var array = [
		[expectedDiv,startDiv,nailDiv],
		[chalDiv,statusDiv,highStatDiv]	
	];
	
	html.append('<span class="u" style="font-size:30px;width:100%">' + q.name + '</span>');
	html.append(' by ' + q.author);
	if(q.rating !== 0)
		html.append(' ',Dialog.getStar(q.rating));
	var table = Tk.arrayToTable(array,null,null,null,'20px 5px');
	table.find('td').css({verticalAlign:'text-top'});
	table.find('td div').css({textAlign:'left'}); //to align image
	html.append(table);	
}

var helperChal = function(i){
	return function(){
		Command.execute('win,quest,toggleChallenge',[i]);
	}
}

Dialog.quest.challenge = function(q,mq){
	var el = $('<div>');
	
	el.append('<h3 class="u">Challenges</h3>');
	
	var star = $('<span>')
		.html(CST.STAR)
		.addClass('shadow360')
		.attr('title',mq._complete ? 'Completed this quest at least once' : 'Never completed this quest')
		.css({color:mq._complete ? 'yellow' : 'gray'});
		
	el.append(star);
	el.append(' - ');
		
	var chalActive = ''; for(var i in mq._challenge) if(mq._challenge[i]) chalActive = i;
	
	
	var text = $('<span>No Challenge</span>')
		.addClass('shadow')
		.css({cursor:'pointer',color:chalActive ? 'red' : 'green'})
		.attr('title','Click if you want to do the quest normally.')
		.click(function(){
			if(chalActive)
				Command.execute('win,quest,toggleChallenge',[chalActive]);
		});
	el.append(text);
	el.append('<br>');
		
	
	for(var i in q.challenge){
		var c = q.challenge[i];
		
		var star = $('<span>')
			.html(CST.STAR)
			.addClass('shadow360')
			.attr('title',mq._challengeDone[i] ? 'Completed this challenge at least once' : 'Never completed this challenge')
			.css({color:mq._challengeDone[i] ? 'yellow' : 'gray'});
		el.append(star);
		el.append(' - ');
		
		var text = $('<span>' + c.name + '</span>')
			.addClass('shadow')
			.css({cursor:'pointer',color:chalActive === i ? 'green' : 'red'})
			.attr('title','Click to toggle challenge: ' + c.description)
			.click(helperChal(i));
		el.append(text);
		el.append('<br>');
		
	}
	return el;
}

Dialog.quest.thumbnail = function(q,mq){
	var small = $("<div>");
	small.css({textAlign:'center',position:'relative',top:30});
	small.append($("<img>")
		.attr({width:500/4,height:380/4})
		.css({border:'2px solid black'})
		.attr({src:q.thumbnail,title:'need to set title for tooltip to work for w/e reason'})
		,'<br>',
		$('<div>')
			.html('Overview')
			.css({marginLeft:'20px',marginRight:'20px',display:'block'})
	);
	
	var popup = Dialog.questThumbnail(0.5);
	Dialog.questThumbnail.refresh(popup,q.id)();
	
	small.tooltip({
		content:popup.html()
	});
	return small;
		
	
	/*small.hover(function(){
		popup.show();
	},function(){
		popup.hide();
	});*/
	
	/*var popup = Dialog.questThumbnail();
	Dialog.questThumbnail.refresh(popup,q.id)();
	popup.css({border:'4px solid black',position:'absolute',left:50,top:20});
	popup.hide();
	
	div.append(popup);
	
	*/
}

Dialog.quest.start = function(q,mq){
	var div = $("<div>").css({textAlign:'center'});
	
	var chalActive = ''; 
	for(var i in mq._challenge) 
		if(mq._challenge[i]) 
			chalActive = i;
	
	var btn = $('<button>')
		.css({position:'relative',top:'20px',fontSize:'25px',display:'inline-block'})	//padding is bad... vertical doesnt work
		.addClass((!main.questActive && mq.canStart) ? 'myButtonGreen' : 'myButtonRed');
	div.append(btn);
	
	if(!main.questActive){
		if(mq.canStart){
			btn.attr('title','Start this quest');
			btn.click(function(){
				Command.execute('win,quest,start',[q.id]);
			});
			btn.append('Start Quest<br>');
			btn.append($('<span>')
				.html(chalActive ? 'with Challenge<br>' + q.challenge[chalActive].name.q() : 'without<br>challenge')
				.css({fontSize:'0.7em'})
			);
		} else {
			btn.attr('title',q.requirement.canStartText);
			btn.click(function(){
				Command.execute('win,quest,start',[q.id]);
			});
			btn.append(Tk.getGlyph('lock'),'LOCKED').css({width:'100%'});
		}
	}
	else if(main.questActive === q.id){
		btn.attr('title','Abandon quest');
		btn.click(function(){
			Command.execute('win,quest,abandon',[q.id]);
		});
		btn.html('Abandon<br>This Quest');		
	}
	else if(main.questActive && main.questActive !== q.id){
		var activeQuestName = QueryDb.getQuestName(main.questActive);
		
		btn.attr('title','Abandon Active Quest (' + activeQuestName + ')');
		btn.click(function(){
			Command.execute('win,quest,abandon',[main.questActive]);
		});
		btn.html('Abandon<br>' + activeQuestName.q());
	}
		
	if(main.questActive && main.questActive !== q.id)
		div.append($('<span>')
			.addClass('shadow')
			.css({fontSize:'0.9em',color:'red'})
			.html('<br><br>Warning! You need to abandon your<br>active quest to start a new one.')
		);
	
	return div;
}	

Dialog.quest.expectedReward = function(q,mq){
	var div = $('<div>');
	div.append('<u style="font-size:24px">Expected Reward:</u><br>');
	
	//check Quest_status for values
	
	var chalActive = false;
	for(var i in mq._challenge)
		if(mq._challenge[i]) chalActive = true;
	
	var scoreBase = q.reward.reputation.mod;
	if(chalActive)
		scoreBase *= 2;
	if(mq._complete === 0)
		scoreBase += 100;
	scoreBase = Math.round(scoreBase);
	
	var expBase = 100 * q.reward.exp;	//hardcoded, check Quest_status
	if(chalActive)
		expBase *= 2;
	expBase = Math.round(expBase);
	
	var item = 5 * q.reward.item;	//hardcoded, check Quest_status
	if(chalActive)
		item *= 2;
	item = Math.ceil(item);
	
	if(mq._completeToday >= 5){
		expBase = 0;
		item = 0;		
	}
		
	
	div.append($('<span>')
		.html(' &nbsp;+' + scoreBase + ' Score<br>')
	);
	div.append($('<span>')
		.html(' &nbsp;+' + expBase + ' Exp<br>')
		.attr('title',mq._completeToday >= 5 ? 'No Exp because you have completed the quest 5+ times already today.' : '')
	);
	div.append($('<span>')
		.html(' &nbsp;+' + item + ' Items<br>')
		.attr('title',mq._completeToday >= 5 ? 'No Item because you have completed the quest 5+ times already today.' : '')
	);
	
	return div;
}

//##################

var helperHigh = function(i){
	return function(){
		Dialog.open('highscore',i);
	}
}

Dialog.quest.statistic = function(q,mq){
	var div = $("<div>");
	div.append('<span class="u h3">Statistic</span>');
	
	var div2 = $("<div>");
	div.append(' ',$('<button>')
		.addClass('myButton skinny')
		.html('Expands')
		.click(function(){
			div2.toggle();
		})
	);
	
	div2.append('Completed by ' + q.statistic.countComplete + ' players.<br>');
	div2.append(((q.statistic.countComplete/q.statistic.countStarted*100) || 0).r(1) + '% players who started the quest finished it.<br>');
	div2.append('In average, players repeat this quest ' + q.statistic.averageRepeat.r(2) + ' times.<br>');
	div2.hide();
	div.append(div2);
	return div;	
}

Dialog.quest.highscore = function(q,mq){
	var div = $("<div>");
	div.append('<span class="u h3">Highscores</span>');
	
	div.append(' ',$('<button>')
		.addClass('myButton skinny')
		.html('Expands')
		.click(function(){
			div2.toggle();
		})
	);
	var refresh = function(id){
		return function(){
			Dialog.refresh('quest',id);
		}
	}
	
	var div2 = $("<div>");
	for(var i in q.highscore){
		div2.append(' - ');
		var highscore = QueryDb.get('highscore',i,refresh(q.id));
		if(!highscore) return;
		var high = $('<a>')
			.html(highscore.name + ' : ' + (mq._highscore[i] || '---'))
			.attr('title',highscore.description)
			.click(helperHigh(i))
			.css({cursor:'pointer'});
			
		div2.append(high);
		div2.append('<br>');
	}
	div2.hide();
	
	div.append(div2);
	return div;	
}

Dialog.quest.status = function(q,mq){
	var div = $("<div>");
	div.append('<h3 class="u">Status</h3>');
	div.append(' &nbsp;Completion: ' + mq._complete + ' times<br>');
	
	var gemRewardScore = Actor.getGEM.scoreToGEM(mq._rewardScore);
	
	var span = Dialog.getCumulativeScoreSpan(mq);
	div.append(' &nbsp;',span,'<br>');
	
	var chalCount = 0;
	for(var i in mq._challengeDone)
		if(mq._challengeDone[i])
			chalCount++;
	var gem = gemRewardScore + chalCount * 0.02;
	
	div.append($("<span>")
		.html(' &nbsp;GEM: +' + gem + '<br>')
		.attr('title','+0.02 * ' + chalCount + ' (# Challenge Done) & +' +  gemRewardScore + ' (Score)')
	);
	return div;	
}

Dialog.getCumulativeScoreSpan = function(mq){
	var title;
	var gemRewardScore = Actor.getGEM.scoreToGEM(mq._rewardScore);
	if(gemRewardScore === 0)
		title = '+' + gemRewardScore + ' GEM';
	if(gemRewardScore === 0.01)
		title = 'Score 10-99 => +' + gemRewardScore + ' GEM';
	if(gemRewardScore === 0.02)
		title = 'Score 100-999 => +' + gemRewardScore + ' GEM';	
	if(gemRewardScore === 0.03)
		title = 'Score 1000-9999 => +' + gemRewardScore + ' GEM';
	if(gemRewardScore === 0.04)
		title = '+' + gemRewardScore + ' GEM';
	
	return $('<span>')
		.html('Cumulative Score: ' + mq._rewardScore.r(0) + '/10000')
		.attr('title',title)
}

/*
Dialog.quest.playerInfo = function(bottom,q,mq){
	var el = $('<div>').addClass('inline');
	bottom.append(el);
	
	//reward
	el.append('<h2 class="u">Personal Score</h2>');
	el.append('Quest completed: ' + mq._complete + ' times<br>');
	el.append($('<span>')
		.html('Cumulative Quest Score: ' + mq._rewardScore.r(0) + ' / 10000')
		.attr('title',"Impact GEM. Everytime you beat a quest, you get a Quest Score that depends on performance and Score Bonus.")
	);
	el.append('<br>');
	
	el.append($('<button>')
		.html('Open Reputation Grid')
		.addClass('myButton')
		.attr('title',"Click here to open the Reputation Grid")
		.click(function(){
			Dialog.open('reputation');
		})
	);
	el.append('<br>');
	//#########################	
		
	
}
*/






//exports.Dialog.open('questStart','QlureKill')
Dialog.create('questStart','Quest',Dialog.Size('auto','auto'),Dialog.Refresh(function(html,variable,param){
	var q = QueryDb.get('quest',param,function(){
		Dialog.open('questStart',param);
	});
	if(!q) return false;
	var mq = main.quest[param];
	variable.quest = param;
	
	var el = Dialog.quest.challenge(q,mq);
	var el2 = Dialog.quest.start(q,mq);
	html.append(el,el2);
	html.css({overflowY:'hidden'});
	
	html.dialog('option', 'title', q.name);
	
	html.append($('<fakea>')
		.html('<br>Check complete description.')
		.click(function(){
			Dialog.close('questStart');
			Dialog.open('quest',param);
		})
	);
},function(html,variable){
	return Tk.stringify(main.quest[variable.quest]) + variable.quest + main.questActive;
}),{
	quest:null,
});



})();








