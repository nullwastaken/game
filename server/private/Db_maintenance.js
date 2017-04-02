!(function(){ //}
if(NODEJITSU) return;
var D = {B:null};
var db = D.B;
var Actor, Main;
setTimeout(function(){	Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main'); },5000);

//node app.js -d
exports.init = function(dbLink){
	D = dbLink;
}





doBatabaseBackup = function(){
	var fs = require('fs');
	
	//player main equip account mainQuest highscore
	var name = Date.nowDate().replace('/','_').replace('/','_');
	var helper = function(what){
		return function(err,res){
			var str = '';
			for(var i = 0 ; i < res.length; i++)
				str += JSON.stringify(res[i]) + '\r\n';
			fs.writeFile(name + "_database_" + what + ".txt", str, function(err,res) {
				if(err) throw err;
				INFO('Saved ' + what);
			}); 
		}
	}
	
	D.B.player.find({},{_id:0},helper('player'));
	setTimeout(function(){
		D.B.main.find({},{_id:0},helper('main'));
	},5000);
	setTimeout(function(){
		D.B.equip.find({},{_id:0},helper('equip'));
	},5000*2);
	setTimeout(function(){
		D.B.account.find({},{_id:0},helper('account'));
	},5000*3);
	setTimeout(function(){
		D.B.mainQuest.find({},{_id:0},helper('mainQuest'));
	},5000*4);
	setTimeout(function(){
		D.B.highscore.find({},{_id:0},helper('highscore'));
	},5000*5);
}



//db.main.update({username : "geff102" , "invList.id":"Qsystem-metal-0"},{$set: {"invList.$.amount": 10}})
//db.mainQuest.update({started:1},{$set:{started:true}},{multi:true});
//db.mainQuest.update({username:"wanweird",quest:"QpuzzleSwitch"},{$set:{"challengeDone.QpuzzleSwitch-speedrun":1}})
//db.mainQuest.update({username:"wanweird",quest:"QpuzzleSwitch"},{$set:{"complete":1}})

removeAbilityFromDb = function(name){
	D.B.player.find({abilityList:name},{username:1,ability:1,abilityList:1}).forEach(function(err,doc){
		if(!doc) return;
		if(err) throw err;
		for(var i = 0 ; i < doc.ability.length; i++)
			if(doc.ability[i] === name)
				doc.ability[i] = "";
		for(var i = 0 ; i < doc.abilityList.length; i++)
			if(doc.abilityList[i] === name)	//happens once
				doc.abilityList.splice(i,1);
		D.B.player.update({username:doc.username},{$set:{abilityList:doc.abilityList,ability:doc.ability}});
	});
}

addAbilityIfCompleteAchievement = function(achieveId,abilityId){
	D.B.achievement.find({id:achieveId,complete:true},{username:1}).forEach(function(err,doc){
		if(!doc) return;
		if(err) throw err;
		
		D.B.player.update({username:doc.username},{
			$addToSet: {abilityList: abilityId }
		});
	});
}

giveBasicAbility = function(){
	D.B.mainQuest.find({quest:'Qtutorial',complete:1},{username:1}).forEach(function(err,doc){
		if(!doc) return;
		if(err) throw err;
		D.B.player.update({username:doc.username},{
			$addToSet: { abilityList: { $each: [
				'Qsystem-start-freeze-range', 'Qsystem-start-fireball-range', 'Qsystem-start-freeze-melee',
				'Qsystem-start-fireball-melee','Qsystem-start-freeze','Qsystem-start-fireball'
			] } }
		},{multi:true});
	});
}


/*deleteActiveQuest = function(quest){
	if(!quest) return;
	DB['questVar'].remove({quest:quest});
	DB['main'].update({questActive:quest},{$set:{questActive:''}},function(err){ if(err) throw err; });
}
*/



/*
fixPlayerPosition = function(){
	D.B.player.find({},{username:1,respawnLoc:1}).forEach(function(err,doc){
		if(!doc) return;
		if(err) 
			throw err;
		
		var rec = doc.respawnLoc.recent;
		if(rec.mapModel.$contains('QfirstTown')){
			var newRespawn = {
				recent:Actor.TOWN_SPOT,
				safe:Actor.TOWN_SPOT,
			};
			INFO('updated ' + doc.username + ', was at ' + rec.mapModel + ', is now at ' + newRespawn.recent.mapModel);
			D.B.player.update({username:doc.username},{$set:{respawnLoc:newRespawn}});
		}
	});
}*/

fixPlayerPosition = function(func){
	D.B.player.find({},{username:1,respawnLoc:1}).forEach(function(err,doc){
		if(!doc) return;
		if(err) 
			throw err;
		
		var rec = doc.respawnLoc.recent;
		var newRespawn = func(rec);
		if(!newRespawn)
			return;
		
		var newRes = {
			recent:newRespawn,
			safe:newRespawn,
		};
		INFO('updated ' + doc.username + ', was at ' + rec.mapModel + ', is now at ' + newRes.recent.mapModel);
		D.B.player.update({username:doc.username},{$set:{respawnLoc:newRes}});
	});
}

/*setTimeout(function(){
	fixPlayerPosition(function(currentSpot){
		if(currentSpot.mapModel.$contains('QfirstTown'))
			return Actor.TOWN_SPOT;
	});
	
	fixPlayerPosition(function(currentSpot){
		if(currentSpot.mapModel.$contains('Qtutorial-adminZone'))
			return Actor.TUTORIAL_SPOT;
	});
	
},10000);*/

removeHighscore = function(category,username,Highscore,Competition){
	D.B.highscore.remove({category:category,username:username});
	
	if(Competition){
		var comp = Competition.getCurrent();
		if(comp.highscore === category){
			Competition.removePlayer(comp,username);
		}
	}
	if(Highscore){
		var quest = Highscore.getQuest(category);
		var query = {};
		query['highscore.' + category] = null;
		D.B.mainQuest.update({username:username,quest:quest},{$set:query});
	}
	/*
	db.mainQuest.update({username:'rc',quest:'QtowerDefence'},{$set:{
		'highscore.QtowerDefence-remainingpteasy':null
	}});
	*/
	
}
removeHighscore.all = function(username,Highscore,Competition){
	for(var i in Highscore.DB){
		removeHighscore(i,username,Competition,Highscore);
	}
}

deleteAccount = function(username){	//bad, need questVar, mainQuest...
	D.B.account.remove({username:username});
	D.B.main.remove({username:username});
	D.B.mainQuest.remove({username:username},{multi:true});
	D.B.player.remove({username:username});
	D.B.highscore.remove({username:username},{multi:true});
	D.B.highscore.remove({username:username},{multi:true});
	D.B.questVar.remove({username:username},{multi:true});
	D.B.offlineAction.remove({username:username},{multi:true});
	D.B.competition.update(
	  { },
	  { $pull: { rank: { username: username } } },
	  { multi: true }
	);
}




//D.B.equip.update({},{$rename:{maxAmount:"maxBoostAmount"},$unset:{rarity:"",quality:""}},{multi:true},function(err){});



fixEquipStatBoost = function(){	//when stat name changes
	//"boost.stat":"dmg-melee-+"
	var fixStatHelper = function(stat){
		if(stat.$contains('-+'))
			return stat.replace('-+','');	
		return stat;
	}
	D.B.equip.find({},{id:1,boost:1}).forEach(function(err,doc){
		if(err) throw err;
		if(!doc) return;
		var changed = false;
		for(var i = 0 ; i < doc.boost.length; i++){
			var newStat = fixStatHelper(doc.boost[i].stat);
			if(newStat !== doc.boost[i].stat)
				changed = true;
			doc.boost[i].stat = newStat;
		}
		if(changed){
			D.B.equip.update({id:doc.id},{$set:{boost:doc.boost}});
		}
	});
}

findMaterial = function(){
	var list = ['metal','wood','bone','ruby','sapphire','topaz'];
	
	var name = {};
	for(var i = 0 ; i < list.length; i++){
		for(var j = 20; j <= 80; j += 20){
			var id = "Qsystem-" + list[i] + "-" + j;
			D.B.main.find({"bankList.id":id},{username:1}).forEach(function(err,res){
				if(!res) 
					return;
				
				if(!name[res.username]){
					name[res.username] = 1;
				}
			});
			D.B.main.find({"invList.id":id},{username:1}).forEach(function(err,res){
				if(!res) 
					return;
				
				if(!name[res.username]){
					name[res.username] = 1;
				}
			});
		}		
	}
}





})(); //{
