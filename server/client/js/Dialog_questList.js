
"use strict";
(function(){ //}
var QueryDb, Main, Command, Actor;
global.onReady(function(){
	QueryDb = rootRequire('shared','QueryDb',true); Main = rootRequire('shared','Main',true); Command = rootRequire('shared','Command',true); Actor = rootRequire('shared','Actor',true);
});
var Dialog = rootRequire('client','Dialog');

var QUEST_CREATOR_VID_URL = 'http://www.youtube.com/embed/LFzRD94RJi0';

Dialog.create('questList','Quest List',Dialog.Size('auto',535),Dialog.Refresh(function(html,variable,param){	// {onlyShow:[]}
	//Quest
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
	
	//comp
	var topButton = $('<div>')
		.css({position:'absolute',fontSize:'1.3em',right:20,top:20});
	html.append(topButton);
	
	if(w.main.questActive && w.main.questActive !== CST.QTUTORIAL){
		var nameQA = QueryDb.get('quest',w.main.questActive).name;
		topButton.append($('<button>')
			.addClass('myButton skinny')
			.html('Abandon')
			.css({marginRight:'5px',background:'#FFCCCC'})
			.attr('title','Abandon active quest ' + nameQA)
			.click(function(){
				Dialog.playSfx('select');
				Main.askQuestion(w.main,function(){
					Command.execute(CST.COMMAND.questAbandon,[w.main.questActive]);
				},'Are you sure you want<br>to abandon the quest ' + nameQA + ' ?','boolean');
			})
		);
	}
	
	topButton.append($('<button>')
		.addClass('myButton skinny')
		.html('Highscore')
		.attr('title','Check highscore')
		.click(function(){
			Dialog.playSfx('select');
			Dialog.close('questList');
			Dialog.open('highscore');
		})
	);
	
	var all = $('<div>').addClass('shadow');
	html.append(all);
	
	var includePartySize = w.main.party.list.length > 1;
	var array = [
		['Quest','Creator','Rating','Chal.']
	];
	if(includePartySize)
		array[0].push('#');
	
	var thumbnail = Dialog.questThumbnail();
	
	var helper = function(i){
		return function(e){
			if(!e.shiftKey){
				Dialog.open('quest',i);
				Dialog.playSfx('select');
			}
			else if(w.main.questActive === i) 
				Command.execute(CST.COMMAND.questAbandon,[i]);
			else 
				Command.execute(CST.COMMAND.questStart,[i]);
		}
	}
	
	var storyQuest = [];
	var normalQuest = [];
	for(var i in w.main.quest){	//BAD, should sort by name, not id
		if(w.main.questActive === i)
			continue;
		var mq = w.main.quest[i];
		var q = QueryDb.get('quest',i);
		if(!q.showInTab) 
			continue;
		if(q.mainStory){
			if(mq.canStart)
				storyQuest.push(i);
		} else if(w.main.questActive !== i)	//added later
			normalQuest.push(i);
	}
	normalQuest.sort();
	for(var i = 0 ; i < storyQuest.length; i++)
		normalQuest.unshift(storyQuest[i]);
	if(w.main.questActive)
		normalQuest.unshift(w.main.questActive);
	
	var playSfx = function(){
		Dialog.playSfx('mouseover');
	}
	for(var num = 0 ; num < normalQuest.length; num++){
		var i = normalQuest[num];
		var q = QueryDb.get('quest',i);
		if(!q.showInTab) continue;
		var mq = w.main.quest[i];
		if(!mq.challengeDone){
			ERROR(3,'mq doesnt have challegeDone',i);
			continue;
		}
		
		var sub = [];
		
		//name
		var color = 'red';
		if(w.main.questActive === i)
			color = 'orange';
		else if(mq.complete) 
			color = 'green';
		
		var glyph = '';
		if(!mq.canStart)
			glyph = Tk.getGlyph('lock',true).css({color:'black'}).attr({title:q.requirement.canStartText});
		if(q.mainStory)
			glyph = Tk.getGlyph('book',true).css({color:'black'}).attr({title:'Main Story Quest'});
		
		
		var name = $('<fakea>')
			.css({color:color,cursor:'pointer'})
			.addClass('shadow')
			.append(glyph,' ' + q.name)
			.click(helper(i))
			.hover(playSfx,null)
			.mouseover(Dialog.questThumbnail.refresh(thumbnail,i));
		sub.push(name);
		sub.push(q.author || '-');
		
		//star
		if(q.rating !== 0){
			sub.push(Dialog.getStar(q.rating));
		} else {
			sub.push(' - ');
		}
		
		//Challenge
		var challengeSpan = Tk.centerDOM($('<span>'));
		sub.push(challengeSpan);
		var count = 1;
		for(var j in mq.challengeDone){
			if(mq.challengeDone[j]){
				challengeSpan.append($('<span>')
					.css({color:'green'})
					.addClass('shadow')
					.html(' ' + CST.CHECKMARK)
					.attr('title','Challenge \'' + q.challenge[j].name + '\' completed')
				);
			} else {
				challengeSpan.append($('<span>')
					.css({color:'red'})
					.addClass('shadow')
					.html(' X')
					.attr('title','Challenge \'' + q.challenge[j].name + '\' never completed')
				);
			}
			count++;
		}
		if(includePartySize){
			var title = 'Max Party Size: ' + q.maxPartySize;
			if(q.maxPartySize !== q.recommendedPartySize)
				title += '. Recommended: ' + q.recommendedPartySize;
			sub.push($('<span>')
				.html(q.maxPartySize)
				.attr('title',title)
			);
		}
		
		array.push(sub);
		if(q.mainStory && normalQuest[num+1] && !QueryDb.get('quest',normalQuest[num+1]).mainStory)
			array.push(['','','','']);
	}
	
	//select random one to display
	var q;
	var limit = 0;
	do {
		q = QueryDb.get('quest',w.main.quest.$randomAttribute());
	} while(!q.showInTab && limit++ < 100);
	
	if(q.showInTab)
		Dialog.questThumbnail.refresh(thumbnail,q.id)();
	
	//add QuestCreator
	array.push([
		$('<a href="/QuestCreator" target="_blank"></a>')
			.html('Your Quest!')
			.css({color:'blue'})
			.hover(Dialog.questThumbnail.refresh(thumbnail,null,{
				description:"Create your own quest with the easy-to-use Quest Creator. "
					+ '<a title="Open in new window." style="color:blue;text-decoration:underline;" href="/QuestCreator" target="_blank">Check it out!</a>',
				author:'',
				isIframe:true,
				name:'Quest Creator',			
			}),function(){}),
		'YOU',
		'-',
		'',
	]);
	
	//var table = Tk.arrayToTable(array,true,false,true);//.css({fontSize:'20px',textAlign:'center'});
	var table = Tk.arrayToTable2(array,true).addClass('table table-hover bigThead');
	//table.fixedHeaderTable();
	//table-hover
	html.css({overflow:'auto'});
	
	var divTable = $('<div>')
		.css({display:'inline-block',verticalAlign:'top',height:'400px',overflowY:'scroll'})
		.append(table);
		//.append(div
		//);
	setTimeout(function(){	//BAD
		divTable[0].scrollTop = 0;
	},100);
	
	thumbnail.css({display:'inline-block',verticalAlign:'top'});
	
	//html.css({whiteSpace: 'nowrap',overflowX:'hidden'});
	html.append(divTable,thumbnail);	
},function(){
	return w.main.questActive;
},10));
//Dialog.open('questList')

var getPctQuestDone = function(){
	var questAndChal = 0;
	var questAndChalDone = 0;
	for(var i in w.main.quest){
		if(!QueryDb.getQuestShowInTab(i)) continue;
		questAndChal++;
		if(w.main.quest[i].complete)
			questAndChalDone++;
		for(var j in w.main.quest[i].challengeDone){
			questAndChal++;
			if(w.main.quest[i].challengeDone[j])
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
	var gem = Actor.getGEM(w.player);
	var maxGem = 1;
	
	for(var i in w.main.quest){
		if(!QueryDb.getQuestShowInTab(i)) continue;
		maxGem += Actor.getGEM.scoreToGEM(10000);	//cuz 10k is max score
		maxGem += 0.02 * 3; //challenge
	}
	maxGem += Actor.getGEM.scoreToGEM(10000);	//cuz tutorial...
	return [gem,maxGem];
}	

Dialog.questThumbnail = function(sizeFactor){
	var sizeFactor = 0.7;
	var imgDiv = $('<div class="imgDiv">')	//class is not real...
		.css({width:400*sizeFactor,height:300*sizeFactor})
		.css({border:'2px solid black'});
	var thumbText = $('<div class="thumbText">') //class is not real...
		.css({fontSize:(1.75*sizeFactor) + 'em',width:400*sizeFactor,background:'white'});
	return $('<div>')
		.css({display:'inline-block',verticalAlign:'top',margin:'10px 10px'})
		.append(imgDiv,'<br>',thumbText);
}

Dialog.questThumbnail.refresh = function(thumbnail,i,questObj){	//q.isIframe
	return function(){
		var q = questObj || QueryDb.get('quest',i);
		var imgDiv = thumbnail.find('div.imgDiv');
		var thumbText = thumbnail.find('div.thumbText');
		
		
		if(q.isIframe)
			imgDiv.html('<iframe style="width:100%; height:100%" src="' + QUEST_CREATOR_VID_URL + '" frameborder="0" allowfullscreen></iframe>');
			//imgDiv.find('iframe').css({width:'100%',height:'100%'});
		else {	
			var img = imgDiv.find('img');
			if(!img[0]){
				img = $('<img>');
				imgDiv.html(img);
			}
			img.attr({src:Dialog.getQuestThumbnail(q),width:'100%',height:'100%'});					
		}
		var auth = q.author ? ' by ' + q.author : '';
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
	if(mod > 0.75)
		span.append(CST.STAR);
	span.attr('title',num.r(3) + '/3');
	return span;
}


})(); //}




