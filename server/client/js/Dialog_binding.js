//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Input = require4('Input');
var Dialog = require3('Dialog');

Dialog.create('binding','Key Binding',Dialog.Size(550,550),Dialog.Refresh(function(){
	Dialog.binding.apply(this,arguments);
},function(){
	return Tk.stringify(Input.getBinding()) + Tk.stringify(Input.getSetting());
}));
//Dialog.open('binding')

Dialog.binding = function(html,variable){
	var array = [];
	array.push([
		'Action',
		'Key Name'
	]);
	
	var list = [
		{'id':'move','name':'Move','list':['Right','Down','Left','Up']},
		{'id':'ability','name':'Ability','list':[0,1,2,3,4,5]}
	];
	
	for(var j in list){
		var info = list[j];
		for(var i = 0; i < Input.getState(info.id).length; i++){
			var name = Input.getKeyName(info.id,i,true);
			
			if(Input.getBinding()[info.id] === i)
				name = '***';
			
			var el = $('<span>');
			el.html(name);
			el[0].title = 'Change Key Binding for ' + info.name + ' ' + info.list[i];
			el[0].onclick = (function(id,i){
				return function(){
					Input.setBinding(id,i);
				}
			})(info.id,i);
			
			array.push([
				info.name + ' ' + info.list[i],
				el
			]);
		}
	}
	var el = $('<div>').addClass('inline');
	el.append(Tk.arrayToTable(array,true,false,true));
	html.append(el);
		
	//Template
	var el = $('<div>').addClass('inline');
	el.append('<h3>Default Bindings</h3>');
	var array = ['QWERTY','AZERTY','NUMBER'];
	
	var helper = function(i){
		return function(){
			Input.usePreset(array[i].toLowerCase());
		}
	};
	
	for(var i = 0; i < array.length; i++){
		var btn = $('<button>').addClass('myButton');
		btn.html(array[i]);
		btn.attr('title','Change for ' + array[i]);
		btn.click(helper(i));
		el.append(btn);
		el.append('<br>');
	}
	html.append(el);
	
};



})();