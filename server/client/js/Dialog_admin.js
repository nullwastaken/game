
"use strict";
(function(){ //}

var Command, Game, Main, MapModel, QueryDb;
global.onReady(function(){
	Command = rootRequire('shared','Command',true); Game = rootRequire('client','Game',true); Main = rootRequire('shared','Main',true); MapModel = rootRequire('server','MapModel',true); QueryDb = rootRequire('shared','QueryDb',true);
});
var Dialog = rootRequire('client','Dialog');

Dialog.create('adminTool','Admin Tool',Dialog.Size(800,200),Dialog.Refresh(function(html,variable,param){
	/*var ts_text = $('<input>').css({width:600});	
	html.append('ts:',ts_text,$('<button>')
		.html('Go')
		.click(function(){
			ts(ts_text.val());
			ts_text.val('');
		})
	);
	html.append('<br>');*/
	
	//###
	html.append($('<button>')
		.html('Spy')
		.click(function(){
			Command.execute(CST.COMMAND.spyPlayer,[]);
			setInterval(function(){
				x.Dialog.close('permPopupMouseover');
			},1000);
			Dialog.close('adminTool');
		})
	);
	html.append($('<button>')
		.html('Quest Feedback')
		.click(function(){
			Command.execute(CST.COMMAND.getQuestRating,[false]);
			Dialog.close('adminTool');
		})
	);
	html.append($('<button>')
		.html('Quest Stats')
		.click(function(){
			Dialog.open('adminQuestStats');
			Dialog.close('adminTool');
		})
	);
	html.append($('<button>')
		.html('Logs')
		.click(function(){
			Command.execute(CST.COMMAND.displayLogs,[]);
			Dialog.close('adminTool');
		})
	);
	html.append($('<button>')
		.html('Ping Data')
		.click(function(){
			Command.execute(CST.COMMAND.displayPingData,[]);
			Dialog.close('adminTool');
		})
	);	
	html.append($('<button>')
		.html('Client Error')
		.click(function(){
			Command.execute(CST.COMMAND.displayClientError,[]);
			Dialog.close('adminTool');
		})
	);
	
	html.append($('<button>')
		.html('Ability')
		.click(function(){
			Command.execute(CST.COMMAND.addAbility,[]);
		})
	);
	html.append($('<button>')
		.html('Enemy')
		.click(function(){
			Command.execute(CST.COMMAND.spawnEnemy,[]);
		})
	);
	html.append('<br>');
	//######
	var reddit_username = $('<input>').attr('placeholder','username');	
	var reddit_post = $('<input>').attr('placeholder','postUrl');
	var reddit_message = $('<input>').attr('placeholder','message');
	html.append('Reddit:',reddit_username,reddit_post,reddit_message,$('<button>')
		.html('Go')
		.click(function(){
			Command.execute(CST.COMMAND.replyReddit,[reddit_username.val(),reddit_post.val(),reddit_message.val()]);
			reddit_username.val('');
			reddit_post.val('');
			reddit_message.val('');
		})
	);
	html.append('<br>');
	//######
	var msg_username = $('<input>').attr('placeholder','username');	
	var msg_message = $('<input>').attr('placeholder','message');
	var msg_url = $('<input>').attr('placeholder','url');
	html.append('Msg:',msg_username,msg_message,msg_url,$('<button>')
		.html('Go')
		.click(function(){
			var msg = msg_message.val();
			if(msg_url.val())
				msg += ' <a href="' + msg_url.val() + '" target="_blank">Link</a>';
			Command.execute(CST.COMMAND.sendMsg,[msg_username.val(),msg]);
			msg_username.val('');
			msg_message.val('');
			msg_url.val('');
		})
	);
	html.append('<br>');
	//######
	var cp_username = $('<input>').attr('placeholder','username');	
	var cp_amount = $('<input>').attr('placeholder','CP amount');	
	html.append('Give CP:',cp_username,cp_amount,$('<button>')
		.html('Go')
		.click(function(){
			Command.execute(CST.COMMAND.giveCP,[cp_username.val(),+cp_amount.val()]);
			cp_username.val('');
			cp_amount.val('');
		})
	);
	html.append('<br>');
	//######
	var item_id = $('<input>').attr('placeholder','item');	
	var item_amount = $('<input>').attr('placeholder','amount');	
	html.append('Add item:',item_id,item_amount,$('<button>')
		.html('Go')
		.click(function(){
			Command.execute(CST.COMMAND.addItem,[item_id.val(),+item_amount.val()]);
			item_id.val('');
			item_amount.val('');
		})
	);
	html.append('<br>');
	//######
	var map_id = $('<select>');	
	for(var i = 0 ; i < param.mapList.length ; i++){
		map_id.append($('<option>')
			.val(param.mapList[i])
			.html(param.mapList[i])
		);		
	}
	for(var i = 0 ; i < MapModel.DB.length ; i++){
		map_id.append($('<option>')
			.val(i + '@MAIN')
			.html(i + '@MAIN')
		);		
	}
	
	html.append('Teleport:',map_id,$('<button>')
		.html('Go')
		.click(function(){
			Command.execute(CST.COMMAND.teleportToAdmin,[map_id.val()]);			
		})
	);
	html.append('<br>');
	//######

}));

Dialog.create('adminQuestFeedback','Quest Rating',Dialog.Size(800,700),Dialog.Refresh(function(html,variable,param){
	if(!param) return false;
	html.html('');
	var questList = {};
	
	for(var i = 0 ; i < param.list.length; i++){
		var q = param.list[i];
		if(!q.text && !q.abandonReason) 
			continue;
		questList[q.quest] = questList[q.quest] || [];
		questList[q.quest].push(q);
	}
	var div = $('<div>').css({height:500,overflowY:'scroll'});
	html.append(div);
	
	var helper = function(q,btn){
		return function(){
			if(q.quest === CST.GENERAL_FEEDBACK)
				Command.execute(CST.COMMAND.giveCP,[q.username,2,'<br>Reason: Helpful general feedback.']);
			else
				Command.execute(CST.COMMAND.addCPQuestFeedback,[q.username,QueryDb.getQuestName(q.quest)]);			
			btn.hide();
		}
	}
	
	for(var i in questList){
		div.append('<h3>' + i + '</h3>');
		for(var j = 0 ; j < questList[i].length; j++){
			var q = questList[i][j];
			var str = q.username + ': ' + q.text;
			
			if(q.hint)
				str += '<br> &nbsp;&nbsp;&nbsp;&nbsp;Hint: ' + q.hint;
			if(q.abandonReason)
				str += '<br> &nbsp;&nbsp;&nbsp;&nbsp;Abandon: ' + q.abandonReason;
			str += '<hr>';
			
			var btn = $("<button>")
				.html('+');
			btn.click(helper(q,btn));
				
			div.append(btn,str);
		}
	}
	html.append('<br>',$('<button>')
		.html('Set as Read')
		.click(function(){
			Command.execute(CST.COMMAND.setQuestRatingAsRead,[]);
		})
	);
}));

Dialog.create('adminQuestStats','Quest Statistics',Dialog.Size(800,700),Dialog.Refresh(function(html,variable,param){
	var array = [
		['Quest','# Complete','% Complete','# Repeat'],
	];
	for(var i in w.main.quest){
		var q = QueryDb.get('quest',i);
		if(!q) 
			continue;
		if(['Qdebug','Qhighscore','Qcontribution'].$contains(i))
			continue;
		array.push([
			i,
			q.statistic.countComplete,
			q.statistic.countStarted === 0 ? ' - ' : Math.floor(q.statistic.countComplete / q.statistic.countStarted * 100) + "%",
			Tk.round(q.statistic.averageRepeat,2)	
		]);		
	}
	html.html(Tk.arrayToTable(array,true,false,true));	
}));

Dialog.create('adminSpyPlayer','Spy Players',Dialog.Size(800,'auto'),Dialog.Refresh(function(html,variable,param){
	html.append($('<button>')
		.html('Refresh')
		.click(function(){
			Command.execute(CST.COMMAND.spyPlayer,[]);
		})
	);
	
	var array = [
		['Username','Name','Key','Map','Quest','Spy'],
	];
	
	param.data.sort(function(a,b){
		return a.username < b.username;
	})
	
	var helper = function(id){
		return function(){
			if(id === w.player.id)
				return Dialog.stopSpy();
			Command.execute(CST.COMMAND.activeBotwatch,[id]);
			Game.setBotWatch(true);
			for(var i = 0; i < param.data.length; i++)
				if(param.data[i].id === id){
					var model = Tk.getSplit0(param.data[i].map,'@');
					w.player.map = model;
					w.player.mapModel = model;
				}
		}
	}
	
	for(var i = 0 ; i < param.data.length; i++){
		array.push([
			param.data[i].username,
			param.data[i].name,
			param.data[i].id,
			param.data[i].map,
			param.data[i].questActive,
			$('<button>')
				.click(helper(param.data[i].id))
				.html('Spy')
		]);
	}
	html.append('<br>',Tk.arrayToTable2(array,true).addClass('table selectable'));	
}));

Dialog.stopSpy = function(){
	Command.execute(CST.COMMAND.activeBotwatch,['']);
	Game.setBotWatch(false);
	Dialog.open('chat');
	Dialog.close('dialogue');
	Dialog.close('permPopupMouseover');
	Main.hudState.restore(w.main);
}

Dialog.create('adminPingData','Ping Data',Dialog.Size(800,400),Dialog.Refresh(function(html,variable,param){
	var data = param.data;
	if(data.length === 0){
		html.html('No data.');
		return;
	}
	data.sort(function(a,b) {
		return a.pingAverage - b.pingAverage;
	});
	
	
	var avg = 0;
	for(var i = 0 ; i < data.length; i++){
		if(data[i].pingAverage)
			avg += data[i].pingAverage;
	}
	
	avg /= data.length;
	var med = data[Math.floor(data.length/2)].pingAverage;
	html.append('Avg=' + Math.round(avg) + ' ms. Med=' + med + ' ms<br><br>');
	
	var places = {};
	for(var i = 0 ; i < data.length; i++){
		var d = data[i];
		places[d.geoLocation] = places[d.geoLocation] || [];
		places[d.geoLocation].push(d.pingAverage);
	}
	
	for(var i in places){
		var total = places[i].reduce(function(a, b) {
			return a + b;
		},0);
		var s = '';
		for(var j = 0 ; j < places[i].length; j++){
			s += places[i][j] + ',';
			if(j % 20 === 19)
				s += '<br>';
		}
		var med = places[i][Math.floor(places[i].length/2)];
		html.append(i + ': Avg=' + Math.round(total / places[i].length) + ' Med=' + med + '<br>' + s + '<br><br>');
	}
}));

Dialog.create('adminClientError','Client Error',Dialog.Size(1000,700),Dialog.Refresh(function(html,variable,param){
	html.append($('<button>')
		.html('Delete')
		.click(function(){
			Command.execute(CST.COMMAND.deleteClientError,[]);
		})
	);
	html.append('<br>');
	for(var i = 0 ; i < param.data.length; i++){
		var d = param.data[i];
		var str = Date.nowDate(d.timestamp) + ' ' + d.file + ':' + d.line + ' ' + d.column + '<br> ==> ' + d.message + '<br><br>';
		html.append(str);		
	}	
	html.addClass('selectable');
}));


})();
