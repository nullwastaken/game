
"use strict";

var SkillPlotModel = exports.SkillPlotModel = function(extra){
	this.id = '';
	this.model = '';
	this.downModel = '';
	this.exp = 0;
	this.item = {};
	this.sfx = null;	//SkillPlotModel.Sfx
	Tk.fillExtra(this,extra);
};
SkillPlotModel.create = function(id,model,downModel,exp,item,sfx){
	var tmp = new SkillPlotModel({
		id:id || ERROR(2,'id missing'),
		model:model || ERROR(2,'model missing'),
		downModel:downModel || ERROR(2,'downModel missing'),
		exp:exp,
		item:item,
		sfx:sfx,
	});
	DB[id] = tmp;
	return tmp;
}
var DB = SkillPlotModel.DB = {};

SkillPlotModel.get = function(id){
	return DB[id] || null;
}
SkillPlotModel.TIMER = 15*CST.MIN;
SkillPlotModel.Sfx = function(id,vol){
	return {id:id,vol:vol || 1};
}


;(function(){ //}
SkillPlotModel.create('tree-red','tree-red','tree-down',50,{
	'wood-0':0.9,'ruby-0':0.1
},SkillPlotModel.Sfx('chop'));
SkillPlotModel.create('rock-bronze','rock-bronze','rock-down',50,{
	'metal-0':0.9,'topaz-0':0.1,	
},SkillPlotModel.Sfx('mine'));		
SkillPlotModel.create('hunt-squirrel','hunt-squirrel','hunt-down',50,{
	'bone-0':0.9,'sapphire-0':0.1,
},SkillPlotModel.Sfx('strikeHit'));	

})(); //{