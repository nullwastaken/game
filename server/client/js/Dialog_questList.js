//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var QueryDb = require4('QueryDb'), Command = require4('Command'), Actor = require4('Actor');
var Dialog = require3('Dialog');

Dialog.create('questList','Quest List',Dialog.Size(1200,700),Dialog.Refresh(function(html,variable,param){	// {onlyShow:[]}
	//Daily Task
	/*
	if(!main.dailyTask.$isEmpty()){
		str += '<span style="color:yellow;" title="Huge Bonus Upon Completing Those Tasks">Daily Task: ';
		for(var i in main.dailyTask)
			str += '<span title="' + main.dailyTask[i].date + ': ' + main.dailyTask[i].description + '"> #' + (+i+1) + ' </span>';	
		str += '</span><br>';
	} else {
		str += '<span style="color:' + CST.color.green + ';" title="Good job! Come back tomorrow for another task.">Daily Task: All Done!</span><br>';
	}
	*/
		
	//Quest
	if(!(param && param.onlyShow)){
		var questDone = getPctQuestDone();
		var starHeader = getStarQuestDone(questDone[0]/questDone[1]);
		
		var h2 = $('<h2>');
		if(questDone[0] !== questDone[1]){	//100% complete
			var h2Text = $('<span>')
				.html(Tk.round(questDone[0]/questDone[1]*100,1) + '% Complete')
				.attr('title',questDone[0] + ' Quests and Challenges completed out of ' + questDone[1]);
			h2.append(starHeader,' ',h2Text);
		} else {		
			var gemDone = getPctGemDone();
			var h2Text = $('<span>')
				.html(Tk.round(gemDone[0]/gemDone[1]*100,1) + '% out of Max GEM')
				.attr('title','x' + gemDone[0].r(2) + ' GEM out of the maximum of x' + gemDone[1].r(2) + ' GEM');
			h2.append(starHeader,' ',h2Text);
		}
		html.append(h2);
	}
	
	var competitionBtn = $('<button>')
		.addClass('myButton skinny')
		.html('Competition')
		.attr('title','Check current competition')
		.click(function(){
			Dialog.open('highscore','competition');
		})
		.css({position:'absolute',fontSize:'1.5em',right:20,top:20});
	html.append(competitionBtn);
	
	var all = $('<div>').addClass('shadow');
	html.append(all);
	
	var array = [
		['Quest','Creator','Rating','Chal. 1','Chal. 2','Chal. 3']
	];
	
	var thumbnail = Dialog.questThumbnail();
	
	var helper = function(i){
		return function(e){
			if(!e.shiftKey) 
				Dialog.open('quest',i);
			else if(main.questActive === i) 
				Command.execute('win,quest,abandon',[i]);
			else 
				Command.execute('win,quest,start',[i]);
		}
	}
	
	var listQuest = main.quest.$keys();	//BAD, should sort by name, not id
	listQuest.sort();
	if(main.questActive){
		listQuest.$remove(main.questActive);
		listQuest.unshift(main.questActive);
	}
	
	for(var num = 0 ; num < listQuest.length; num++){
		var i = listQuest[num];
		var q = QueryDb.get('quest',i);
		if(!q.showInTab) continue;
		if(param && param.onlyShow && !param.onlyShow.$contains(i)) continue;
		var mq = main.quest[i];
		if(!mq._challengeDone){
			ERROR(3,'mq doesnt have challegeDone',i);
			continue;
		}
		
		var sub = [];
		
		//name
		var color = 'red';
		if(main.questActive === i)
			color = 'orange';
		else if(mq._rewardScore >= 10000)
			color = CST.color.gold;
		else if(mq._complete) 
			color = 'green';
		
		var glyph = mq.canStart
			? ''
			: Tk.getGlyph('lock',true).css({color:'black'}).attr({title:q.requirement.canStartText})
		
		var name = $('<fakea>')
			.css({color:color,cursor:'pointer'})
			.addClass('shadow')
			.append(glyph,' ' + q.name)
			.click(helper(i))
			.hover(Dialog.questThumbnail.refresh(thumbnail,i),function(){});
		sub.push(name);
		sub.push(q.author || '-');
		
		//star
		if(q.rating !== 0){
			sub.push(Dialog.getStar(q.rating));
		} else {
			sub.push(' - ');
		}
		
		//Challenge
		var count = 1;
		for(var j in mq._challengeDone){
			if(mq._challengeDone[j]){
				sub.push(Tk.centerDOM($('<span>')
					.css({color:'green'})
					.addClass('shadow')
					.html(CST.CHECKMARK)
					.attr('title','Challenge \'' + q.challenge[j].name + '\' completed')
				));
			} else {
				sub.push(Tk.centerDOM($('<span>')
					.css({color:'red'})
					.addClass('shadow')
					.html('X')
					.attr('title','Challenge \'' + q.challenge[j].name + '\' never completed')
				));
			}
			count++;
		}
		for(var j = count; j < 4; j++){
			sub.push(Tk.centerDOM('-'));
		}
		
		array.push(sub);
	}
	
	var q;
	var limit = 0;
	do {
		q = QueryDb.get('quest',main.quest.$randomAttribute());
	} while(!q.showInTab && limit++ < 100);
	
	if(q.showInTab)
		Dialog.questThumbnail.refresh(thumbnail,q.id)();
	
	array.push([
		$('<a href="http://rainingchain.com/contribution" target="_blank"></a>')
			.html('Your Quest!')
			.css({color:'blue'})
			.hover(Dialog.questThumbnail.refresh(thumbnail,null,{
				description:"Create your own quest with the easy-to-use Quest Creator. "
					+ '<a title="Open in new window." style="color:blue;text-decoration:underline;" href="/contribution" target="_blank">Check it out</a>',
				author:'',
				thumbnail:'../img/ui/questCreator.png',
				name:'Quest Creator',			
			}),function(){}),
		player.name,
		'-',
		Tk.centerDOM('-'),
		Tk.centerDOM('-'),
		Tk.centerDOM('-')
	]);
	
	//var table = Tk.arrayToTable(array,true,false,true);//.css({fontSize:'20px',textAlign:'center'});
	var table = Tk.arrayToTable2(array,true).addClass('table table-hover bigThead');
	//table.fixedHeaderTable();
	//table-hover
	html.css({overflow:'auto'});
	
	var divTable = $('<div>')
		.css({height:'500px',overflowY:'scroll'})
		.append(table);
		//.append(div
		//);
	setTimeout(function(){	//BAD
		divTable[0].scrollTop = 0;
	},100);
	
	var tableCreate = $('<div>')
		.css({display:'inline-block',verticalAlign:'top'})
		.append(divTable,'<br>',$('')
			.html('Create your own quest using the Quest Creator')
			.addClass('u')
		);
	
	//html.append(tableCreate,thumbnail);	
	html.append(tableCreate,thumbnail);	
},function(){
	return main.questActive;
},10));
//Dialog.open('questList')

var getPctQuestDone = function(){
	var questAndChal = 0;
	var questAndChalDone = 0;
	for(var i in main.quest){
		if(!QueryDb.getQuestShowInTab(i)) continue;
		questAndChal++;
		if(main.quest[i]._complete)
			questAndChalDone++;
		for(var j in main.quest[i]._challengeDone){
			questAndChal++;
			if(main.quest[i]._challengeDone[j])
				questAndChalDone++;
		}
	}
	return [questAndChalDone,questAndChal];
}	

var getStarQuestDone = function(pct){
	var sp = $('<span>')
		.addClass('shadow')
		.html(CST.STAR)
		
	if(pct < 0.125)
		return sp.css({color:CST.color.bronze})	//bronze
	if(pct < 0.25)
		return sp.css({color:CST.color.silver}) //silver
	if(pct < 0.5)
		return sp.css({color:CST.color.gold}) //gold
	if(pct < 0.75)
		return sp.css({color:CST.color.gold}).html('★★')
	if(pct <= 1)
		return sp.css({color:CST.color.gold}).html('★★★').attr('title','YOU ARE AMAZING!!!');
	return sp;	//if error?
}
var getPctGemDone = function(){
	var gem = Actor.getGEM(player);
	var maxGem = 1;
	
	for(var i in main.quest){
		if(!QueryDb.getQuestShowInTab(i)) continue;
		maxGem += Actor.getGEM.scoreToGEM(10000);	//cuz 10k is max score
		maxGem += 0.02 * 3; //challenge
	}
	maxGem += Actor.getGEM.scoreToGEM(10000);	//cuz tutorial...
	return [gem,maxGem];
}	


Dialog.questThumbnail = function(sizeFactor){
	sizeFactor = sizeFactor || 1;
	var thumbnail = $('<div>');
	var obj = $('<img>')
		.attr({width:500*sizeFactor,height:380*sizeFactor})
		.css({border:'2px solid black'});
		
	var thumbText = $('<div>')
		.css({fontSize:(1.75*sizeFactor) + 'em',width:500*sizeFactor,background:'white'});
	thumbnail.append(obj,'<br>',thumbText);
	thumbnail.css({display:'inline-block',verticalAlign:'top',margin:'10px 10px'});
	return thumbnail;
}
Dialog.questThumbnail.refresh = function(thumbnail,i,questObj){
	return function(e){
		var q = questObj || QueryDb.get('quest',i);
		var obj = thumbnail.find('img');
		var thumbText = thumbnail.find('div');
		if(!(!obj.attr('src') && !q.thumbnail))						
			obj.attr({src:q.thumbnail});
		var auth = q.author ? ' (by ' + q.author + ') ' : '';
		thumbText.html('<u>' + q.name + '</u>' + auth + ':<br><span style="font-size:0.85em">' + q.description + '<span>');
	}
}


Dialog.getStar = function(num){
	var span = $('<span>').css({color:'yellow'}).addClass('shadow360');
	for(var j = 1 ; j <= num; j++){
		span.append(CST.STAR);
	}
	var mod = num % 1;
	if(mod >= 0.25 && mod <= 0.75)
		span.append('+');
	if(mod >= 0.75)
		span.append('+');
	span.attr('title',num.r(3) + '/3');
	return span;
}


})(); //}




