
"use strict";
(function(){ //}
var Stat, Boost;
global.onReady(function(){
	Stat = rootRequire('shared','Stat'); Boost = rootRequire('shared','Boost');
});
var Actor = rootRequire('shared','Actor');


var INTERVAL = {fast:2,reg:5,slow:25}; //fast = 2, no idea if good

Actor.Boost = function(type){
	return {          //timer aka needs to be updated every frame
		fast:{},
		reg:{},
		slow:{},
		toUpdate:{},
		list:Actor.Boost.list(type || CST.ENTITY.player),	//bad...
	};
}
Actor.Boost.list = function(type){
	return Stat.actorBoostList(type || CST.ENTITY.player);
}

//#################

Actor.addBoost = function(act, boost){
	//Add a boost to a actor

	//list[i]: i = stat
	//toUpdate[i]: i = stat
	//fast[i]: i = stat@source
	
	if(Array.isArray(boost)){
		for(var i = 0; i < boost.length; i++)
			Actor.addBoost(act,boost[i]); 
		return;
	}
	
	act.boost[boost.spd][boost.id] = boost;
	act.boost.list[boost.stat].name[boost.id] = boost;
	act.boost.toUpdate[boost.stat] = 1;
	
}

Actor.boost = {};

Actor.boost.remove = function(act, boost){
	var stat = boost.stat;
	if(boost.name === Boost.FROM_ABILITY){ 
		delete act.curseClient[stat];	
		Actor.setChange(act,'curseClient',act.curseClient);
	}
	delete act.boost.list[stat].name[boost.id]
	delete act.boost[boost.spd][boost.id];
	Actor.boost.update(act,stat);
}

Actor.boost.removeById = function(act,stat,name){
	var id = stat + Boost.SEPARATOR + name;
	var blist = act.boost.list[stat];
	if(blist && blist.name[id]){
		Actor.boost.remove(act,blist.name[id]);
	}
}

Actor.boost.removeAll = function(act,stringToMatch){
	stringToMatch = stringToMatch || '';	//'' = match all
	for(var i in act.boost.list){
		for(var j in act.boost.list[i].name){
			if(act.boost.list[i].name[j].name.$contains(stringToMatch))
				Actor.boost.remove(act,act.boost.list[i].name[j]);
		}
	}
}

Actor.boost.loop = function(act){
	for(var spd in INTERVAL){
		if(!Actor.testInterval(act,INTERVAL[spd])) 
			continue;
		
		for(var j in act.boost[spd]){	//j = boost id
			act.boost[spd][j].time -= INTERVAL[spd];
			if(act.boost[spd][j].time < 0)
				Actor.boost.remove(act,act.boost[spd][j],spd,j);
		}
	}
	
	for(var i in act.boost.toUpdate){
		Actor.boost.update(act,i);
		delete act.boost.toUpdate[i];
	}
}

Actor.boost.getBase = function(act,stat){
	if(!act.boost.list[stat])
		return ERROR(3,'stat dont exist',stat);
	return act.boost.list[stat].base;
}

Actor.boost.update = function(act,statName){	// !statName means all
	if(!statName){ //aka update all
		for(var i in act.boost.list) 
			Actor.boost.update(act,i); 
		return; 
	}	
	
	var stat = act.boost.list[statName];
	var sum = stat.base;
	
	var globalMod = 1;
	for(var i in stat.name){
		var boost = stat.name[i];
		if(boost.type === CST.BOOST_PLUS) 
			sum += boost.value;
		else if(boost.type === CST.BOOST_X)
			sum += (boost.value-1)*stat.base;
		else if(boost.type === CST.BOOST_XXX)
			globalMod *= boost.value;
	}
	sum *= globalMod;
		
	Stat.setValue(act,statName,sum);
}

Actor.setBoostListBase = function(act){	//could be optimzed to only test things that could be changed via s.newNpc
	act.boost = Actor.Boost(act.type);
	for(var i in act.boost.list){
		act.boost.list[i].base = act.boost.list[i].permBase = Stat.getValue(act,i);	
	}
	if(act.type === CST.ENTITY.player) 	//QUICKFIX
		act.boost.list[i].base = act.boost.list['bullet-spd'].permBase *= 3;
}

Actor.addPermBoost = function(act,source,boost){
	//remove permBoost if boost undefined
	if(boost)	
		act.permBoost[source] = Tk.arrayfy(boost);
	else 
		delete act.permBoost[source];
	
	Actor.permBoost.update(act);
}

Actor.permBoost = {};
Actor.permBoost.update = function(act){
	var pb = act.boost.list;
	//Reset to PermBase
	var tmp = {};
	for(var i in pb){
		tmp[i] = {
			base:pb[i].permBase,
			max:Stat.get(i).value.max,
			min:Stat.get(i).value.min,
			x:1,xxx:1,
			p:0
		}
	}
	
	//Update Value
	for(var i in act.permBoost){	//i = Source (item)	
		for(var j in act.permBoost[i]){	//each indidual boost boost
			var b = act.permBoost[i][j];
			if(b.type === CST.BOOST_PLUS || b.type === 'base')
				tmp[b.stat].p += b.value;
			else if(b.type === CST.BOOST_X)
				tmp[b.stat].x += b.value;
			else if(b.type === CST.BOOST_XXX)
				tmp[b.stat].xxx *= b.value;		//used for very global things (map mod)
			else if(b.type === 'min')
				tmp[b.stat].min = Math.max(tmp[b.stat].min,b.value);
			else if(b.type === 'max')
				tmp[b.stat].max = Math.min(tmp[b.stat].max,b.value);		
		}
	}
	
	//Max and min
	for(var i in tmp){
		var t = tmp[i];
		var sum = ((t.base * t.x) + t.p) * t.xxx;
		sum = Math.min(Math.max(sum,t.min),t.max);
		
		pb[i].base = sum;
	}
	
	for(var i in pb){
		var stat = Stat.get(i);
		if(!stat.custom) 
			continue;
		if(pb[i].base)
			stat.customFunc(act.boost.list,pb[i].base,act);
	}
	
	Actor.boost.update(act);
	if(act.type === CST.ENTITY.player)
		Actor.setPrivateChange(act,'permBoost',act.permBoost);
}

})(); //{








