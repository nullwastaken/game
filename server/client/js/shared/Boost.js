
"use strict";
(function(){ //}
var Stat;
global.onReady(function(){
	Stat = rootRequire('shared','Stat');
});
var Boost = exports.Boost = function(extra){
	this.id = '';
	this.stat = '';
	this.name = '';
	this.value = 1;
	this.type = '';
	this.time = 0;
	this.spd = SPD.reg;
	Tk.fillExtra(this,extra);
};
var SPD = {	//SOSO based on Actor.Boost
	reg:'reg',
	slow:'slow',
	fast:'fast',
}
var TYPE = [CST.BOOST_PLUS,CST.BOOST_X,CST.BOOST_XXX];

Boost.create = function(name,stat,value,time,type){
	time = time || CST.BIG_INT;
	var spd = SPD.reg;
	if(time < 25) 
		spd = SPD.fast;
	else if(time >= 250) 
		spd = SPD.slow;
	type = type || CST.BOOST_X;
	if(!TYPE.$contains(type))
		return ERROR(3,'invalid TYPE',type);
		
	if(!Stat.get(stat)) 
		return ERROR(3,'invalid stat',stat);
		
	return new Boost({
		id:stat + Boost.SEPARATOR + name,
		stat:stat || ERROR(3,'stat needed'),
		name:name || ERROR(3,'name needed'),
		value:value,
		type:type,
		time:time,
		spd:spd
	})
}

Boost.Perm = function(stat,value,type){
	if(!Stat.get(stat)) 
		return ERROR(3,'invalid stat',stat);
	type = type || CST.BOOST_X;
	if(!TYPE.$contains(type))
		return ERROR(3,'invalid TYPE',type);
	
	return {
		stat:stat,
		value:value,
		type:type,	
	}
}

Boost.stackSimilarPerm = function(list){	//if boost same thing, add values
	var tmp = {};	
	for(var i in list){
		var name = list[i].type + list[i].stat;
		if(!tmp[name]) 
			tmp[name] = list[i];
		else 
			tmp[name].value += list[i].value;
	}
	var array = [];
	for(var i in tmp) 
		array.push(tmp[i]);
	return array;
}

Boost.FROM_ABILITY = 'fromAbility';
Boost.SEPARATOR = '@';	//separator

})(); //{

