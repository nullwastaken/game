(function(){ //}
Dialog('setting','Settings',Dialog.Size(450,550),Dialog.Refresh(function(){
	Dialog.setting.apply(this,arguments);
},function(){
	return Tk.stringify(main.pref) + ClientPrediction.MODE;
}));
//Dialog.open('setting')


//Draw.openSetting
Dialog.setting = function(html,variable){
	var list = Pref.get();
	html.append('<h2>Preferences</h2>');
	
	var divTop = $('<div>');
	html.append(divTop);
	
	divTop.append($('<button>')
		.addClass('myButton')
		.click(function(){
			Dialog.open('binding');
		})
		.html('Key Bindings')
		.attr('title','Change Key Bindings')
	);
	divTop.append('<br>');
	divTop.append($('<button>')
		.addClass('myButton')
		.click(function(){
			Dialog.open('account',true);
		})
		.html('Account Management')
		.attr('title','Open Account Management Window')
	);
	divTop.append('<br>');
	
	//Volume
	divTop.append('Volume:');
	divTop.append($('<button>')
		.click(function(){
			Command.execute('pref',['volumeMaster',(Main.getPref(main,'volumeMaster+10')).mm(0,100)]);
			Command.execute('pref',['volumeSong',(Main.getPref(main,'volumeSong')+10).mm(0,100)]);
			Command.execute('pref',['volumeSfx',(Main.getPref(main,'volumeSfx')+10).mm(0,100)]);
		})
		.html('+')
		.attr('title','Increase volume')
	);
	divTop.append($('<button>')
		.click(function(){
			Command.execute('pref',['volumeMaster',(Main.getPref(main,'volumeMaster')-10).mm(0,100)]);
			Command.execute('pref',['volumeSong',(Main.getPref(main,'volumeSong')-10).mm(0,100)]);
			Command.execute('pref',['volumeSfx',(Main.getPref(main,'volumeSfx')-10).mm(0,100)]);
		})
		.html('-')
		.attr('title','Decrease volume')
	);
	divTop.append($('<button>')
		.click(function(){
			Command.execute('pref',['volumeMaster',0]);
		})
		.html('Mute')
		.attr('title','Mute volume')
	);
	divTop.append('<br>');
	
	//Client Prediction	
	divTop.append('Client Prediction: ');
	divTop.append($('<button>')
		.html('Yes')
		.addClass('myButton skinny')
		.css({border:ClientPrediction.MODE === ClientPrediction.YES ? '4px solid black' : ''})
		.click(function(){
			ClientPrediction.MODE = ClientPrediction.YES;
			ClientPrediction.activate();
		})
	);
	divTop.append($('<button>')
		.html('Auto')
		.addClass('myButton skinny')
		.css({border:ClientPrediction.MODE === ClientPrediction.AUTO ? '4px solid black' : ''})
		.click(function(){
			ClientPrediction.MODE = ClientPrediction.AUTO;
		})
	);
	divTop.append($('<button>')
		.html('No')
		.addClass('myButton skinny')
		.css({border:ClientPrediction.MODE === ClientPrediction.NO ? '4px solid black' : ''})
		.click(function(){
			ClientPrediction.MODE = ClientPrediction.NO;
			ClientPrediction.deactivate();
		})
	);
	divTop.append('<br>');
	divTop.append('<br>');
	
	
	
	//Regular Pref
	var array = [];
	for(var i in list){
		var pref = list[i];
		
		var text = $('<span>')
			.html(pref.name + ':')
			.attr('title',pref.description + ' (' + pref.min + '-' + pref.max + ')')
		
		var input = $('<input>')
			.val(main.pref[i])
			.attr('type','number')
			.attr('max',pref.max)
			.attr('min',pref.min);
		input.change((function(i,input){
			return function(e){
				var newValue = input.val();
				Command.execute('pref',[i,newValue]);
			}			
		})(i,input));
		
		array.push([
			text,
			input		
		]);		
	}
	html.append(Tk.arrayToTable(array,false,false,false,'10px 0'));
}




})();



