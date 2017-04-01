
"use strict";
(function(){ //}
var Pref, Command;
global.onReady(function(){
	Pref = rootRequire('client','Pref',true); Command = rootRequire('shared','Command',true);
});
var Dialog = rootRequire('client','Dialog');

Dialog.create('setting','Settings',Dialog.Size(450,550),Dialog.Refresh(function(){
	Dialog.setting.apply(this,arguments);
}));
//Dialog.open('setting')
Dialog.onPrefChange = function(what,prefValue,rawValue){
	if(!Dialog.isActive('setting'))
		return;
	if(rawValue === prefValue)	//input already did the job
		return;
	
	var div = settingVariable.list[what][0];
	var pref = Pref.get(what);
	
	if(pref.type === 'boolean')
		div.checked = !!prefValue;
	else if(pref.type === 'string')
		div.value = pref.displayType.option[prefValue];
	else 
		div.value = prefValue;
}
var settingVariable = null;

//Draw.openSetting
Dialog.setting = function(html,variable){
	settingVariable = variable;
	var list = Pref.get();
	var divTop = $('<div>').css({textAlign:'center'});
	html.append(divTop);
	
	divTop.append($('<button>')
		.addClass('myButton')
		.click(function(){
			Dialog.close('setting');
			Dialog.open('account',true);
		})
		.html('Account')
		.attr('title','Open Account Management Window')
	);
	divTop.append('<br>');
	divTop.append($('<button>')
		.addClass('myButton')
		.click(function(){
			Dialog.close('setting');
			Dialog.open('binding');
		})
		.html('Key Bindings')
		.attr('title','Change Key Bindings')
	);
	divTop.append('<br>');
	divTop.append('<br>');
	
	//quality
	var qualityDiv = $('<div>');
	qualityDiv.append($('<span>')
		.html('Quality: ')
	);
	qualityDiv.append($("<button>")
		.click(function(){
			Pref.set('mapRatio',7);
			Pref.set('minimizeChat',1);
			Pref.set('maxParticleMod',0);
			Pref.set('enableLightingEffect',0);
			Pref.set('enableWeather',0);
			Pref.set('maxWidth',0);	//aka min
		})
		.html('Low')
		.addClass('skinny myButton')
	);
	qualityDiv.append($("<button>")
		.click(function(){
			Pref.set('maxParticleMod',25);
			Pref.set('enableLightingEffect',0);
			Pref.set('enableWeather',1);
			Pref.set('maxWidth',1280);	//aka min
		})
		.html('Medium')
		.addClass('skinny myButton')
	);
	qualityDiv.append($("<button>")
		.click(function(){
			Pref.set('maxParticleMod',100);
			Pref.set('enableLightingEffect',1);
			Pref.set('enableWeather',1);
			Pref.set('maxWidth',99999);	//aka max
		})
		.html('High')
		.addClass('skinny myButton')
	);
	divTop.append(qualityDiv);
	
	
	divTop.append('<br>');
	
	//Regular Pref
	var inputChangeNumber = function(i,input){
		return function(){
			Pref.set(i,input.val());
		}			
	}
	var inputChangeBoolean = function(i,input){
		return function(){
			Pref.set(i,+input.prop("checked"));
		}			
	}
	var inputChangeString = function(i,input){
		return function(){			
			Pref.set(i,+input.val());
		}			
	};
	var inputChangeSlider = function(i,slider,span){
		return function(){
			var val = Math.floor(slider.val());
			Pref.set(i,val);
			span.html(w.main.pref[i] + ' ');
		}
	}
	variable.list = {};
	variable.oldPref = Tk.deepClone(w.main.pref);
	
	var array = [];
	for(var i in list){
		var pref = list[i];
		var text = $('<span>')
			.html(pref.name + ':')
			.attr('title',pref.description + ' (' + pref.min + '-' + pref.max + ')')
		
		var input = null;
		if(pref.displayType.type === 'number'){
			input = $('<input>')
				.val(w.main.pref[i])
				.attr('type','number')
				.attr('max',pref.max)
				.attr('min',pref.min);
			input.change(inputChangeNumber(i,input));
		} else if(pref.displayType.type === 'boolean'){
			input = $('<input>')
				.attr('type','checkbox')
				.prop('checked',!!w.main.pref[i]);

			input.change(inputChangeBoolean(i,input));
				
		} else if(pref.displayType.type === 'string'){
			input = $('<select>');
			for(var j = 0 ; j < pref.displayType.option.length; j++){
				input.append('<option value="' + j + '">' + pref.displayType.option[j] + '</option>');
			}
			input.val("" + w.main.pref[i]);
			input.change(inputChangeString(i,input));
		} else if(pref.displayType.type === 'slider'){
			input = $('<div>');
			var span = $('<span>')
				.html(w.main.pref[i] + ' ');
				
			var slider = $('<input>')
				.attr({type:'range',min:pref.min,max:pref.max,width:100});
			slider.val(w.main.pref[i]);
			slider.change(inputChangeSlider(i,slider,span));
			input.append(span,slider);
		}
		
		variable.list[i] = input;
		
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



