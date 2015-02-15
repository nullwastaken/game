//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";

var SkillPlotModel = exports.SkillPlotModel = {};
SkillPlotModel.create = function(id,model,downModel,exp,item,useQuestBonus){
	var tmp = {
		id:id || ERROR(2,'id missing'),
		model:model || ERROR(2,'model missing'),
		downModel:downModel || ERROR(2,'downModel missing'),
		exp:exp || 0,
		item:item || {},
		useQuestBonus:!!useQuestBonus,
	}
	DB[id] = tmp;
	return tmp;
}
var DB = SkillPlotModel.DB = {};

(function(){ //}
SkillPlotModel.create('tree-red','tree-red','tree-down',100,{
	'wood-0':0.9,'ruby-0':0.05,'sapphire-0':0.025,'topaz-0':0.025
},true);
SkillPlotModel.create('rock-bronze','rock-bronze','rock-down',100,{
	'metal-0':0.9,'ruby-0':0.025,'sapphire-0':0.05,'topaz-0':0.025,	
},true);		
SkillPlotModel.create('hunt-squirrel','hunt-squirrel','hunt-down',100,{
	'bone-0':0.9,'ruby-0':0.025,'sapphire-0':0.025,'topaz-0':0.05,
},true);

})(); //{

SkillPlotModel.get = function(id){
	return DB[id] || null;
}


