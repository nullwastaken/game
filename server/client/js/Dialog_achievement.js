//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Achievement = require4('Achievement');
var Dialog = require3('Dialog');

Dialog.create('achievement','Achievement',Dialog.Size(700,700),Dialog.Refresh(function(){
	return Dialog.achievement.apply(this,arguments);
}),function(html,variable,param){
	return Tk.stringify(main.achievement);
});

Dialog.achievement = function(html,variable,param){
	html.html('Work in progress...');
	return;	//TEMP

	var arrayDone = [];
	var arrayNotDone = [];
	for(var i in main.achievement)
		if(main.achievement[i].complete)
			arrayDone.push(Achievement.get(i));
		else 
			arrayNotDone.push(Achievement.get(i));

	var done = arrayDone.length;
	var sum = arrayDone.length + arrayNotDone.length;
	html.append('<h3>Achievements: ' + done + '/' + sum + ' (' + Math.round(done/sum*100) + '%)</h3>');
	
	var scrollSection = $('<div>').css({width:'100%',height:'90%',overflowY:'scroll'});
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
		var ma = main.achievement[a.id];
		
		var firstCol = $('<span>').html(a.name);
		if(a.name !== a.description)
			firstCol.attr('title',a.description);
		firstCol.css({color:ma.complete ? 'green' : 'red'});
		firstCol.addClass('shadow');
		
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

