
"use strict";
(function(){ //}
var Actor, Command;
global.onReady(function(){
	Actor = rootRequire('shared','Actor');
	Command = rootRequire('shared','Command',true);
});
var OptionList = exports.OptionList = function(extra){
	this.name = '';
	this.option = []; //[OptionList.Option];
	Tk.fillExtra(this,extra);
};

OptionList.create = function(name,option){
	return new OptionList({
		name:name ,
		option:option,	//[OptionList.Option]
	});
}

OptionList.Option = function(func,param,name,description){
	param = param || [];
	if(!Array.isArray(param)) return ERROR(2,'param is not an array',param);
	return {
		func:func,
		param:param,
		name:name,
		description:description || name,
	};
}

OptionList.executeOption = function(main,option){	//actorOptionList
	var param = option.param;
	if(param[0] === OptionList.MAIN)
		return option.func.apply(this,[main].concat(param.slice(1)));
	if(param[0] === OptionList.ACTOR) 
		return option.func.apply(this,[SERVER ? Actor.get(main.id) : w.player].concat(param.slice(1)));
	if(param[0] === OptionList.NOKEY) 
		return option.func.apply(this,param.slice(1));
	
	return SERVER ? option.func.apply(this,[main.id].concat(param)) : option.func.apply(this,param);
}
OptionList.NOKEY = '$nokey';
OptionList.MAIN = '$main';
OptionList.ACTOR = '$actor';


OptionList.uncompressClient = function(optionList,command,entity){
	if(!optionList) return null;
	
	var option = [];
	for(var i = 0 ; i < optionList.option.length; i++){
		option.push(OptionList.Option(
			Command.execute,
			[command,[entity,i]],
			optionList.option[i].name,
			optionList.option[i].description
		));
	}
	optionList.option = option;
	return optionList;
}

})(); //{


