
"use strict";
(function(){ //}
var SideQuest, Command, Main;
global.onReady(function(){
	SideQuest = rootRequire('shared','SideQuest',true); Command = rootRequire('shared','Command',true); Main = rootRequire('shared','Main',true);
});
var Dialog = rootRequire('client','Dialog');


Dialog.create('sideQuest','Side Quests',Dialog.Size(550,600),Dialog.Refresh(function(){
	Dialog.sideQuest.apply(this,arguments);
},function(){
	return Tk.stringify(w.main.sideQuest) + Tk.stringify(Main.SideQuest.getSideQuestMarkerList(w.main));
},25));
//exports.Dialog.open('sideQuest')
Dialog.sideQuest = function(html,variable,param){
	var done = Main.SideQuest.getCompleteCount(w.main);
	var sum = w.main.sideQuest.$length();
	html.append('<h3>Side quests: ' + done + '/' + sum + ' (' + Math.round(done/sum*100) + '%)</h3>');
	
	html.append('<p><span title="Capped at x10 completions">Difficulty increases</span> everytime you complete a side quest.</p>');
	
	var scrollSection = $('<div>').css({width:'100%',height:'75%',overflowY:'scroll'});
	html.append(scrollSection);
	
	var array = [];
	array.push([
		'Name',
		'',
		//'Available',
		'Location',
	]);
	
	var sqList = SideQuest.DB;
	var zone = {};
	for(var i in sqList){
		zone[sqList[i].zone] = zone[sqList[i].zone] || [];
		zone[sqList[i].zone].push(sqList[i]);
	}
	var good = [];
	for(var i in zone){
		zone[i].sort(function(a,b){
			return a.name < b.name ? -1 : 1;
		});
		good.push({zone:i,list:zone[i]});
	}
	
	good.sort(function(a,b){
		return a.zone < b.zone ? -1 : 1;
	});
	
	var qmHelper = function(id){
		return function(){
			Command.execute(CST.COMMAND.toggleSQMarker,[id]);
			Dialog.playSfx('select');
		}
	}
	
	var marked = Main.SideQuest.getSideQuestMarkerList(w.main);
	for(var i = 0 ; i < good.length ; i++){
		//var z = good[i].zone;
		for(var j = 0 ; j < good[i].list.length; j++){
			var sq = good[i].list[j];
			var msq = w.main.sideQuest[sq.id];
			var color = msq.complete ? 'green' : 'red';
			var firstCol = $('<span>').html(sq.name)
				.css({color:color})
				.addClass('shadow');
			
			var time = $('<span>')
				.html(msq.complete ? 'x' + msq.complete : '')
				.css({color:color});
			
			
			/*var active = true
				? '<span title="That side quest can be started." style="color:green" class="shadow">' + CST.CHECKMARK + '</span>'
 				: '<span title="That side quest can be started." style="color:red" class="shadow">X</span>'
				*/
				
			var button = $('<button>')
				.html(marked.$contains(sq.id) ? 'Unmark' : 'Mark')
				.attr('title',(marked.$contains(sq.id) ? 'Unmark' : 'Mark') + ' starting location on minimap')
				.addClass('myButton skinny')
				.click(qmHelper(sq.id));
				
			array.push([
				firstCol,
				time,
				button,
			]);
		}
	}
	
	var table = Tk.arrayToTable2(array,true)
		.addClass('table table-hover bigThead')
		.css({width:'100%'});
	scrollSection.append(table);
	html.append(scrollSection);
}






})();

