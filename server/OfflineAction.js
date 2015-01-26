//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
eval(loadDependency(['Account','Actor','Main','Message'],['OfflineAction']));

/*
ts("OfflineAction('test','message',OfflineAction.Data.message('heyhey!'));")

ts("OfflineAction('test','message',OfflineAction.Data.message('hoho!'));")
ts("OfflineAction('test','addItem',OfflineAction.Data.addItem('Qsystem-wood-0',10000));")
ts("OfflineAction('test','removeItem',OfflineAction.Data.removeItem('Qsystem-wood-0',5000));")

ts("OfflineAction('aaa','addExp',OfflineAction.Data.addExp(10000000,false));")
ts("OfflineAction('aaa','addItem',OfflineAction.Data.addItem('Qsystem-wood-0',10000));")
ts("OfflineAction('aaa','removeItem',OfflineAction.Data.removeItem('Qsystem-wood-20',100));")
*/
//OfflineAction('aaa','addAbility',OfflineAction.Data.addAbility('Qsystem-wood-20',100));


var OfflineAction = exports.OfflineAction = function(username,type,data){
	if(!OfflineAction.TYPE.$contains(type)) 
		return ERROR(3,'wrong type ' + type);
	var oa = {
		id:Math.randomId(),
		username:username,
		time:Date.now(),
		type:type,
		data:data,
	}
	
	if(Account.getKeyViaUsername(username)){
		OfflineAction.applyAction(oa);
		return;
	}
	
	
	db.offlineAction.insert(oa,db.err);
	return oa;
}

OfflineAction.init = function(dbLink){
	db = dbLink;	
}

OfflineAction.TYPE = [ //{
	'message',
	'questPopup',
	'addItem',
	'removeItem',
	'addExp',
	'addAbility',
	'removeAbility',
]; //}

OfflineAction.onSignIn = function(username){
	setTimeout(function(){
		db.offlineAction.find({username:username},{_id:0},function(err,res){
			if(err) throw err;
			res.sort(function(a,b){ return a.time-b.time; });
			for(var i = 0 ; i < res.length; i++){
				OfflineAction.applyAction(res[i]);
			}	
		});
	},1000*5);
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

OfflineAction.applyAction = function(oa){
	var key = Account.getKeyViaUsername(oa.username);
	if(!key) return;
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
		Actor.ability.add(Actor.get(key),oa.data.ability);
		if(typeof oa.data.slot === 'number') 
			Actor.ability.swap(Actor.get(key),oa.data.ability,oa.data.slot,true);
	} else if(oa.type === 'removeAbility'){
		Actor.ability.remove(Actor.get(key),oa.data.ability);
	}
	
}


