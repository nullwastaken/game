//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var ClientPrediction = require4('ClientPrediction'), Pref = require4('Pref'), Command = require4('Command');
var Dialog = require3('Dialog');

Dialog.create('setting','Settings',Dialog.Size(450,550),Dialog.Refresh(function(){
	Dialog.setting.apply(this,arguments);
},function(){
	return Tk.stringify(main.pref) + ClientPrediction.getMode();
}));
//Dialog.open('setting')


//Draw.openSetting
Dialog.setting = function(html,variable){
	var list = Pref.get();
	var divTop = $('<div>').css({textAlign:'center'});
	html.append(divTop);
	
	divTop.append($('<button>')
		.addClass('myButton')
		.click(function(){
			Dialog.open('account',true);
		})
		.html('Account Management')
		.attr('title','Open Account Management Window')
	);
	divTop.append('<br>');
	divTop.append($('<button>')
		.addClass('myButton')
		.click(function(){
			Dialog.open('binding');
		})
		.html('Key Bindings')
		.attr('title','Change Key Bindings')
	);
	divTop.append('<br>');
	divTop.append('<br>');
	
	
	//Client Prediction	
	divTop.append('Client Prediction: ');
	divTop.append($('<button>')
		.html('Yes')
		.addClass('myButton skinny')
		.css({background:ClientPrediction.getMode() === ClientPrediction.YES ? '#DDDDDD' : ''})
		.click(function(){
			ClientPrediction.setMode(ClientPrediction.YES);
		})
	);
	divTop.append($('<button>')
		.html('Auto')
		.addClass('myButton skinny')
		.css({background:ClientPrediction.getMode() === ClientPrediction.AUTO ? '#DDDDDD' : ''})
		.click(function(){
			ClientPrediction.setMode(ClientPrediction.AUTO);
		})
	);
	divTop.append($('<button>')
		.html('No')
		.css({background:ClientPrediction.getMode() === ClientPrediction.NO ? '#DDDDDD' : ''})
		.click(function(){
			ClientPrediction.setMode(ClientPrediction.NO);
		})
		.addClass('myButton skinny')
	);
	
	divTop.append('<br>');
	divTop.append('<br>');
	
	//Regular Pref
	var inputChangeNumber = function(i,input){
		return function(){
			Command.execute('pref',[i,input.val()]);
		}			
	}
	var inputChangeNumber = function(i,input){
		return function(){
			var newValue = input.val();
			Command.execute('pref',[i,newValue]);
		}			
	}
	var inputChangeBoolean = function(i,input){
		return function(){
			Command.execute('pref',[i,+input.prop("checked")]);
		}			
	}
	var inputChangeString = function(i,input){
		return function(){
			Command.execute('pref',[i,+input.val()]);
		}			
	};
	var inputChangeSlider = function(i,slider,span){
		return function(){
			var val = Math.floor(slider.val());
			Command.execute('pref',[i,val]);
			span.html(main.pref[i] + ' ');
		}
	}
			
	var array = [];
	for(var i in list){
		var pref = list[i];
		
		var text = $('<span>')
			.html(pref.name + ':')
			.attr('title',pref.description + ' (' + pref.min + '-' + pref.max + ')')
		
		var input;
		if(pref.displayType.type === 'number'){
			input = $('<input>')
				.val(main.pref[i])
				.attr('type','number')
				.attr('max',pref.max)
				.attr('min',pref.min);
			input.change(inputChangeNumber(i,input));
		} else if(pref.displayType.type === 'boolean'){
			input = $('<input>')
				.attr('type','checkbox')
				.prop('checked',!!main.pref[i]);

			input.change(inputChangeBoolean(i,input));
				
		} else if(pref.displayType.type === 'string'){
			input = $('<select>');
			for(var j = 0 ; j < pref.displayType.option.length; j++){
				input.append('<option value="' + j + '">' + pref.displayType.option[j] + '</option>');
			}
			input.val("" + main.pref[i]);
			input.change(inputChangeString(i,input));
		} else if(pref.displayType.type === 'slider'){
			input = $('<div>');
			var span = $('<span>')
				.html(main.pref[i] + ' ');
				
			var slider = $('<input>')
				.attr({type:'range',min:pref.min,max:pref.max,width:100});
			slider.val(main.pref[i]);
			slider.change(inputChangeSlider(i,slider,span));
			input.append(span,slider);
		}
		
		array.push([
			text,
			input		
		]);		
	}
	html.append(Tk.arrayToTable(array,false,false,false,'10px 0'));
	html.append('<br>',$('<button>')
		.html('Reset')
		.addClass('myButton skinny')
		.click(function(){
			Pref.set(Pref.RESET);
		})
	);
	
}




})();



