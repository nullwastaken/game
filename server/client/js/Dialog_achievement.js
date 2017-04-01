
"use strict";
(function(){ //}
var Achievement;
global.onReady(function(){
	Achievement = rootRequire('shared','Achievement',true);
});
var Dialog = rootRequire('client','Dialog');

var SHOW_ALL = false;

var shouldDisplay = function(a){
	if(SHOW_ALL)
		return true;
	if(w.main.achievement[a.id].complete)
		return false;
	
	for(var i = 0 ; i < a.preReq.length; i++){
		if(!w.main.achievement[a.preReq[i]].complete)
			return false;
	}
	return true;
}

Dialog.create('achievement','Achievement',Dialog.Size(700,600),Dialog.Refresh(function(){
	Dialog.achievement.apply(this,arguments);
},function(){
	return Tk.stringify(w.main.achievement) + SHOW_ALL;
}));

Dialog.achievement = function(html,variable,param){
	var arrayDone = [];
	var arrayNotDone = [];
	for(var i in w.main.achievement)
		if(w.main.achievement[i].complete)
			arrayDone.push(Achievement.get(i));
		else 
			arrayNotDone.push(Achievement.get(i));

	var done = arrayDone.length;
	var sum = arrayDone.length + arrayNotDone.length;
	html.append('<h3>Achievements: ' + done + '/' + sum + ' (' + Math.round(done/sum*100) + '%)</h3>');
	
	var topRight = $('<div>')
		.css({position:'absolute',right:'20px',top:'0px'})
		.append(
			$('<div>')
			.addClass('checkbox')
			.append($('<label>')
				.append($('<input>')
					.attr('type','checkbox')
					.change(function(){
						SHOW_ALL = $(this)[0].checked;
					})
					.prop('checked', SHOW_ALL)
					,' Show All'
				)
			)
		);
	html.append(topRight);
	/*<div class="checkbox">
		<label>
			<input type="checkbox" onchange="change();" id="showAdvanced"> Show Advanced
		</label>
	</div>*/
	
	var scrollSection = $('<div>').css({width:'100%',height:'85%',overflowY:'scroll'});
	html.append(scrollSection);
	
	var array = [];
	array.push([
		'Name',
		'Progress',
		'Reward',
	]);
		
	
	arrayDone.sort(function(a,b){
		return a.displayIndex - b.displayIndex;
	});
	arrayNotDone.sort(function(a,b){
		return a.displayIndex - b.displayIndex;
	})
	var list = arrayNotDone.concat(arrayDone);
	
	for(var i = 0 ; i < list.length ; i++){
		var a = list[i];
		var ma = w.main.achievement[a.id];
		
		var firstCol = $('<span>').html(a.name);
		if(a.name !== a.description)
			firstCol.attr('title',a.description);
		firstCol.css({color:ma.complete ? 'green' : 'red'});
		firstCol.addClass('shadow');
		
		if(shouldDisplay(a))
			array.push([
				firstCol,
				ma.complete ? 'Complete' : (ma.progressText || 'Incomplete'),
				Achievement.getRewardText(a),
			]);
	}
	var table = Tk.arrayToTable2(array,true)
		.addClass('table table-hover bigThead')
		.css({width:'100%'});
	scrollSection.append(table);
	html.append(scrollSection);
}


})();

