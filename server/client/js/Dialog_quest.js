
"use strict";
(function(){ //}
var QueryDb, Main, Command, Actor;
global.onReady(function(){
	QueryDb = rootRequire('shared','QueryDb',true); Main = rootRequire('shared','Main',true); Command = rootRequire('shared','Command',true); Actor = rootRequire('shared','Actor',true);
});
var Dialog = rootRequire('client','Dialog');

var EXP_BASE = 150; //hardcoded, check Quest_status
var ITEM_BASE = 5;
var SCORE_BASE = 50;
var DEFAULT_THUMBNAIL = '/img/ui/defaultQuestThumbnail.png';

Dialog.create('quest','Quest',Dialog.Size(700,420),Dialog.Refresh(function(){
	return Dialog.quest.apply(this,arguments);
},function(html,variable){
	return Tk.stringify(w.main.quest[variable.quest]) + variable.quest + w.main.questActive;
}));
//Dialog.open('quest')

Dialog.quest = function (html,variable,param){
	var q = QueryDb.get('quest',param,function(){
		Dialog.open('quest',param);
	});
	if(!q) return false;
	var mq = w.main.quest[param];
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
	
	var title = $('<span>')
		.css({fontSize:'1.3em'})
		.html('<u style="font-size:1.2em">' + q.name + '</u>')
		.append(' by ' + q.author);
	if(q.rating !== 0)
		title.append(' ',Dialog.getStar(q.rating));
	html.append(title);	
	
	var table = Tk.arrayToTable(array,null,null,null,'20px 20px');
	table.css({marginTop:'-30px'});
	table.find('td').css({verticalAlign:'text-top'});
	table.find('td div').css({textAlign:'left'}); //to align image
	html.append(table);	
}

var helperChal = function(quest,i){
	return function(){
		Command.execute(CST.COMMAND.questSetChallenge,[quest,i]);
	}
}

Dialog.quest.challenge = function(q,mq){
	var el = $('<div>');
	
	el.append('<h3 class="u">Challenges</h3>');
	
	var canDoChallenge = mq.complete;
	
	
	var star = $('<span>')
		.html(CST.STAR)
		.addClass('shadow360')
		.attr('title',mq.complete ? 'Completed this quest at least once' : 'Never completed this quest')
		.css({color:mq.complete ? 'yellow' : 'gray'});
		
	el.append(star);
	el.append(' - ');
		
	var chalActive = mq.challenge; 
	
	var text = $('<span>No Challenge</span>')
		.addClass('shadow')
		.css({cursor:'pointer',color:chalActive ? 'red' : 'green'})
		.attr('title','Click if you want to do the quest normally.')
		.click(function(){
			if(chalActive)
				Command.execute(CST.COMMAND.questSetChallenge,[q.id,'']);
		});
	el.append(text);
	el.append('<br>');
		
	
	for(var i in q.challenge){
		var c = q.challenge[i];
		
		var star = $('<span>')
			.html(CST.STAR)
			.addClass('shadow360')
			.attr('title',mq.challengeDone[i] ? 'Completed this challenge at least once' : 'Never completed this challenge')
			.css({color:mq.challengeDone[i] ? 'yellow' : 'gray'});
		el.append(star);
		el.append(' - ');
		
		var text = $('<span>' + c.name + '</span>')
			.addClass('shadow')
			.css({cursor:'pointer',color:chalActive === i ? 'green' : 'red'})
			.click(helperChal(q.id,i));	//there even if cant for sfx
		if(canDoChallenge){
			text.attr('title','Click to activate challenge: ' + c.description)
		} else {
			text.attr('title','Complete the quest at least once to unlock that challenge.');
		}	
		
		el.append(text);
		el.append('<br>');
		
	}
	return el;
}

Dialog.quest.thumbnail = function(q,mq){	//only in quest, not in questList
	var small = $("<div>");
	small.css({textAlign:'center',position:'relative',top:30});
	small.append($("<img>")
		.attr({width:500/4,height:380/4})
		.css({border:'2px solid black'})
		.attr({src:Dialog.getQuestThumbnail(q),title:'need to set title for tooltip to work for w/e reason'})
		,'<br>',
		$('<div>')
			.html('Overview')
			.css({marginLeft:'20px',marginRight:'20px',display:'block'})
	);
	
	var popup = Dialog.questThumbnail(0.7);
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
	
	var chalActive = mq.challenge;
	
	var btn = $('<button>')
		.css({position:'relative',top:'20px',fontSize:'12px',display:'inline-block'})	//padding is bad... vertical doesnt work
		.addClass((!w.main.questActive && mq.canStart) ? 'myButtonGreen' : 'myButtonRed');
	div.append(btn);
	
	if(!w.main.questActive){
		if(mq.canStart){
			btn.attr('title','Start this quest');
			btn.click(function(){
				Command.execute(CST.COMMAND.questStart,[q.id]);
			});
			btn.append($('<span>')
				.css({fontSize:'2em'})
				.html('Start Quest<br>')
			);
			btn.append($('<span>')
				.html(chalActive ? 'With challenge<br>"' + q.challenge[chalActive].name + '"' : 'No challenge')
			);
		} else {
			btn.attr('title',q.requirement.canStartText);
			btn.click(function(){
				Command.execute(CST.COMMAND.questStart,[q.id]);
			});
			btn.append(Tk.getGlyph('lock'),' LOCKED').css({width:'100%'});
		}
	}
	else if(w.main.questActive === q.id){
		btn.attr('title','Abandon quest');
		btn.click(function(){
			Command.execute(CST.COMMAND.questAbandon,[q.id]);
		});
		btn.html('Abandon<br>This Quest');		
	}
	else if(w.main.questActive && w.main.questActive !== q.id){
		var activeQuestName = QueryDb.getQuestName(w.main.questActive);
		
		btn.attr('title','Abandon Active Quest (' + activeQuestName + ')');
		btn.click(function(){
			Command.execute(CST.COMMAND.questAbandon,[w.main.questActive]);
		});
		btn.html('Abandon<br>"' + activeQuestName + '"');
	}
		
	if(w.main.questActive && w.main.questActive !== q.id)
		div.append($('<span>')
			.addClass('shadow')
			.css({fontSize:'0.9em',color:'red'})
			.html('<br><br>Warning! You must<br>abandon your active<br>quest to start a new one.')
		);
	
	return div;
}	

Dialog.quest.expectedReward = function(q,mq){	//TODO
	var div = $('<div>');
	div.append('<u style="font-size:24px">Reward:</u><br>');
	
	//check Quest_status for values
	
	var chalActive = !!mq.challenge;
	
	var scoreBase = SCORE_BASE * q.reward.score;
	if(chalActive)
		scoreBase *= 2;
	if(mq.complete === 0 && q.reward.score !== 0)
		scoreBase += 100;
	scoreBase = Math.round(scoreBase);
	
	var expBase = EXP_BASE * q.reward.completion;	
	if(chalActive)
		expBase *= 2;
	expBase = Math.round(expBase);
	
	var item = ITEM_BASE * q.reward.completion;
	if(chalActive)
		item *= 2;
	item = Math.ceil(item);
	
	var cappedDaily = Main.quest.haveCompletedMaxDaily(w.main,q.id);
	
	
	if(cappedDaily){
		expBase = 0;
		item = 0;		
	}
	
	div.append($('<span>')
		.html(' &nbsp;+' + scoreBase + ' Score<br>')
	);
	
	var expLine = !cappedDaily && q.reward.monster !== 0
		? ' &nbsp;+' + expBase + ' Exp (+Kills)<br>'
		: ' &nbsp;+' + expBase + ' Exp<br>';
	
	div.append($('<span>')
		.html(expLine)
		.attr('title',cappedDaily ? 'No Exp because you have completed the quest enough times today.' : '')
	);
	div.append($('<span>')
		.html(' &nbsp;+' + item + ' Materials<br>')
		.attr('title',cappedDaily ? 'No Item because you have completed the quest enough times today.' : '')
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
		.html('Show')
		.click(function(){
			div2.toggle();
		})
	);
	
	div2.append('Completed by ' + q.statistic.countComplete + ' players.<br>');
	var pctDone = ((q.statistic.countComplete/q.statistic.countStarted*100) || 0).r(1);
	div2.append($('<span>')
		.html(pctDone + '% players finished it.<br>')
		.attr('title',pctDone + '% players who started this quests finished it.')
	);
	var rep = q.statistic.averageRepeat.r(2);
	div2.append($('<span>')
		.html('Average repeat: x' + rep + ' times.<br>')
		.attr('title','In average, players repeat this quest x' + rep + ' times.')
	);
	div2.hide();
	div.append(div2);
	return div;	
}

Dialog.quest.highscore = function(q,mq){
	var div = $("<div>");
	div.append('<span class="u h3">Highscores</span>');
	
	div.append(' ',$('<button>')
		.addClass('myButton skinny')
		.html('Show')
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
			.html(highscore.name + ' : ' + (mq.highscore[i] || '---'))
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
	div.append(' &nbsp;Completion: ' + mq.complete + ' times<br>');
	
	var gemRewardScore = Actor.getGEM.scoreToGEM(mq.rewardScore);
	
	var span = Dialog.getCumulativeScoreSpan(mq);
	div.append(' &nbsp;',span,'<br>');
	
	var chalCount = 0;
	for(var i in mq.challengeDone)
		if(mq.challengeDone[i])
			chalCount++;
	var gem = gemRewardScore + chalCount * 0.02;
	
	/*div.append($("<span>")
		.html(' &nbsp;GEM: +' + gem + '<br>')
		.attr('title','+0.02 * ' + chalCount + ' (# Challenge Done) & +' +  gemRewardScore + ' (Score)')
	);*/
	
	div.append($("<div>")
		.css({marginTop:'10px'})
		.html(' &nbsp;GEM: +' + Tk.round(gem,2,true) + '/0.10<br>')
	);
	var BAR_BIG = $("<div>")
		.css({width:'175px',height:'22.5px',margin:'5px 5px 5px 20px',background:'rgba(0,0,0,1)',border:'1px solid black',borderRadius:'2px'})
	var chalWidth = (0.02*chalCount)/0.10*100 + '%';
	var CHAL_FIL = $("<div>")
		.css({verticalAlign:'center',display:'inline-block',marginRight:'0.5px',backgroundColor:'#00DD00',width:chalWidth,height:'20px',borderRadius:'1px'})
		.attr('title','+0.02 * ' + chalCount + ' from Challenge');
	BAR_BIG.append(CHAL_FIL);
	
	var scoreWidth = Math.min(39,gemRewardScore/0.10*100) + '%';	//BAD
	var SCORE_FIL = $("<div>")
		.css({verticalAlign:'center',display:'inline-block',backgroundColor:'#00DD00',width:scoreWidth,height:'20px',borderRadius:'1px'})
		.attr('title','+' + gemRewardScore + ' from Score');
	BAR_BIG.append(SCORE_FIL);
	
	
	
	div.append(BAR_BIG);
	
	return div;	
}

Dialog.getCumulativeScoreSpan = function(mq){
	var title;
	var gemRewardScore = Actor.getGEM.scoreToGEM(mq.rewardScore);
	if(gemRewardScore === 0)
		title = '+' + gemRewardScore + ' GEM';
	if(gemRewardScore === 0.01)
		title = 'Score 10-99 => +' + gemRewardScore + ' GEM';
	if(gemRewardScore === 0.02)
		title = 'Score 100-999 => +' + gemRewardScore + ' GEM';	
	if(gemRewardScore === 0.03)
		title = 'Score 1000-9999 => +' + gemRewardScore + ' GEM';
	if(gemRewardScore === 0.04)
		title = 'Score 10000+ => +' + gemRewardScore + ' GEM';
	
	return $('<span>')
		.html('Cumulative Score: ' + mq.rewardScore.r(0) + '/10000')
		.attr('title',title)
}

/*
Dialog.quest.playerInfo = function(bottom,q,mq){
	var el = $('<div>').addClass('inline');
	bottom.append(el);
	
	//reward
	el.append('<h2 class="u">Personal Score</h2>');
	el.append('Quest completed: ' + mq.complete + ' times<br>');
	el.append($('<span>')
		.html('Cumulative Quest Score: ' + mq.rewardScore.r(0) + ' / 10000')
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


Dialog.getQuestThumbnail = function(q){
	if(q.thumbnail)
		return '/quest/' + q.id + '/' + q.id + '.png';
	else
		return DEFAULT_THUMBNAIL;
}

	


//exports.Dialog.open('questStart','QlureKill')
Dialog.create('questStart','Quest',Dialog.Size('auto','auto'),Dialog.Refresh(function(html,variable,param){
	var q = QueryDb.get('quest',param,function(){
		Dialog.open('questStart',param);
	});
	if(!q) return false;
	var mq = w.main.quest[param];
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
	var at = CST.OFFSET.x >= 0 ? 'center-10%' : 'center+10%';
	html.dialog({position:{my:'right',at:at}});
		
},function(html,variable){
	return Tk.stringify(w.main.quest[variable.quest]) + variable.quest + w.main.questActive;
}));



})();








