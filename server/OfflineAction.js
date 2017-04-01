
"use strict";
var Account, Actor, Main, Message;
global.onReady(function(initPack){
	Account = rootRequire('private','Account'); Actor = rootRequire('shared','Actor'); Main = rootRequire('shared','Main'); Message = rootRequire('shared','Message');
	db = initPack.db;
},{db:['offlineAction']});
var OfflineAction = exports.OfflineAction = function(extra){
	this.id = Math.randomId();
	this.username = '';
	this.time = Date.now();
	this.type = '';
	this.data = null;
	Tk.fillExtra(this,extra);
};

var db;

OfflineAction.create = function(username,type,data,dontApplyAction){
	if(!OfflineAction.TYPE.$contains(type)) 
		return ERROR(3,'wrong type ' + type);
	var oa = new OfflineAction({
		username:username,
		type:type,
		data:data,
	});
	if(dontApplyAction)
		return oa;
		
	if(Account.getKeyViaUsername(username)){	//aka online
		OfflineAction.applyAction(oa);
		return;
	}
	
	Account.usernameExists(username,function(exist){
		if(exist)
			db.offlineAction.insert(oa,db.err);
	});
	return oa;
}

/*
ts("OfflineAction.create('test','message',OfflineAction.Data.message('heyhey!'));")

ts("OfflineAction.create('test','message',OfflineAction.Data.message('hoho!'));")
ts("OfflineAction.create('test','addItem',OfflineAction.Data.addItem('Qsystem-wood-0',10000));")
ts("OfflineAction.create('test','removeItem',OfflineAction.Data.removeItem('Qsystem-wood-0',5000));")

ts("OfflineAction.create('aaa','addExp',OfflineAction.Data.addExp(10000000,false));")
ts("OfflineAction.create('aaa','addItem',OfflineAction.Data.addItem('Qsystem-wood-0',10000));")
ts("OfflineAction.create('aaa','removeItem',OfflineAction.Data.removeItem('Qsystem-wood-0',100));")
*/
//OfflineAction.create('aaa','addAbility',OfflineAction.Data.addAbility('Qsystem-wood-0',100));


OfflineAction.TYPE = [ //{
	'message',
	'questPopup',
	'addItem',
	'removeItem',
	'addExp',
	'addAbility',
	'removeAbility',
	'addCP',
]; //}

OfflineAction.onSignIn = function(username){
	setTimeout(function(){
		db.offlineAction.find({username:username},{_id:0},function(err,res){
			res = OfflineAction.concat(res);
			
			res.sort(function(a,b){ return a.time-b.time; });
			for(var i = 0 ; i < res.length; i++){
				OfflineAction.applyAction(res[i]);
			}	
		});
	},1000*5);
}

OfflineAction.concat = function(array){
	var message = '';
	var questPopup = '';
	var username;
	
	for(var i = array.length-1; i >= 0 ; i--){
		var oa = array[i];
		username = oa.username;
		if(oa.type === 'message'){
			message += oa.data.msg + '<br>';
			array.$removeAt(i);
			db.offlineAction.remove({id:oa.id},db.err);
		}
		else if(oa.type === 'questPopup'){
			questPopup += oa.data.msg + '<br>';
			array.$removeAt(i);
			db.offlineAction.remove({id:oa.id},db.err);
		}
	}
	if(username && message)
		array.push(OfflineAction.create(username,'message',OfflineAction.Data.message(message),true));
	if(username && questPopup)
		array.push(OfflineAction.create(username,'questPopup',OfflineAction.Data.questPopup(questPopup),true));
	
	return array;
}


OfflineAction.Data = {};
OfflineAction.Data.message = function(msg){
	return {
		msg:msg  || null,
	}
}
OfflineAction.Data.addItem = OfflineAction.Data.removeItem = function(item){
	return {
		item:item || {},
	}
}
OfflineAction.Data.addExp = function(amount,useGEM){
	return {
		amount:amount || 0,
		useGEM:useGEM || false,
	}
}
OfflineAction.Data.addAbility = function(ability,slot){
	return {
		ability:ability || '',
		slot:slot || null,//int
	}
}
OfflineAction.Data.removeAbility = function(ability){
	return {
		ability:ability || '',
	}
}
OfflineAction.Data.questPopup = function(msg){
	return {
		msg:msg  || null,
	}
}

OfflineAction.Data.addCP = function(amount,type,comment){
	return {
		amount:amount,
		type:type,
		comment:comment,
	}
}

OfflineAction.applyAction = function(oa){
	var key = Account.getKeyViaUsername(oa.username);
	if(!key) return;	//aka not online
	db.offlineAction.remove({id:oa.id},db.err);
	
	if(oa.type === 'message')
		Message.add(key,oa.data.msg);
	else if(oa.type === 'questPopup')
		Message.addPopup(key,oa.data.msg);
	else if(oa.type === 'addItem')
		Main.addItem(Main.get(key),oa.data.item);
	else if(oa.type === 'removeItem')
		Main.removeItem(Main.get(key),oa.data.item);
	else if(oa.type === 'addExp')
		Actor.addExp(Actor.get(key),oa.data.amount,oa.data.useGEM);
	else if(oa.type === 'addAbility'){
		Actor.addAbility(Actor.get(key),oa.data.ability);
		if(typeof oa.data.slot === 'number') 
			Actor.swapAbility(Actor.get(key),oa.data.ability,oa.data.slot,true);
	} else if(oa.type === 'removeAbility'){
		Actor.removeAbility(Actor.get(key),oa.data.ability);
	} else if(oa.type === 'addCP'){
		Main.contribution.addPt(Main.get(key),oa.data.amount,oa.data.type,oa.data.comment);
	} 
	else 
		return ERROR(3,'unhandled type',oa.type);
	
}


