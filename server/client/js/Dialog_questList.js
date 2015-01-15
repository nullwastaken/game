(function(){ //}

Dialog('questList','Quest List',Dialog.Size(900,600),Dialog.Refresh(function(html,variable,param){	//{onlyShow:[]}
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
	var all = $('<div>').addClass('shadow');
	html.append(all);
	
	var array = [
		['Quest','Chal. 1','Chal. 2','Chal. 3']
	];
	var thumbnail = $('<div>');
	var obj = $('<object>')
		.attr({width:500,height:380});
		
	var thumbText = $('<div>')
		.css({fontSize:'1.5em',width:475})
	thumbnail.append(obj,'<br>',thumbText);
	
	for(var i in main.quest){
		if(i === 'Qtutorial') continue;	//BAD hardcoded
		if(!QueryDb.getQuestShowInTab(i)) continue;
		if(param && param.onlyShow && !param.onlyShow.contains(i)) continue;
		var mq = main.quest[i];
		if(!mq._challengeDone){
			ERROR(3,'mq doesnt have challegeDone',i);
			continue;
		}
		
		var sub = [];
		
		//name
		var name = QueryDb.getQuestName(i);
		var color = 'red';
		if(main.questActive === i) color = 'orange';
		else if(mq._complete) color = 'green';
				
		var text = $('<span>')
			.css({color:color})
			.addClass('shadow')
			.attr('title','Check '+ name)
			.html(name)
			.click((function(i){
				return function(event){
					if(!event.shiftKey) Dialog.open('quest',i);
					else if(main.questActive === i) Command.execute('win,quest,abandon',[i]);
					else Command.execute('win,quest,start',[i]);
				}
			})(i))
			.hover((function(i){
				return function(){
					var q = QueryDb.getPartialQuest(i);
					
					if(!(!obj.attr('data') && !q.thumbnail))						
						obj.attr({data:q.thumbnail});
					thumbText.html(q.name + ' (by ' + (q.author || 'Anonymous') + '):<br> ' + q.description);
					
				}
			})(i),function(){});
		sub.push(text);
		
		var count = 1;
		for(var i in mq._challengeDone){
			
			if(mq._challengeDone[i]){
				sub.push($('<span>')
					.css({color:'green'})
					.addClass('shadow')
					.html('✔')
					.attr('title','Challenge #' + count + ' completed')
				);
			} else {
				sub.push($('<span>')
					.css({color:'red'})
					.addClass('shadow')
					.html('X')
					.attr('title','Challenge #' + count + ' never completed')
				);
			}
			count++;
		}
		for(var i = count; i < 4; i++){
			sub.push('-');
		}
		
		array.push(sub);
	}
	var table = Tk.arrayToTable(array,true,false,true).css({fontSize:'20px',textAlign:'center'});
	table.css({float:'left'});
	thumbnail.css({float:'left',margin:'10px 10px'});
	html.css({overflow:'auto'});
	html.append(table,thumbnail);
	//html.append(Tk.arrayToTable(cheat,false,false,false,'10px 10px'));
},function(){
	return main.questActive;
},10));
//Dialog.open('questList')

		
	


})();




