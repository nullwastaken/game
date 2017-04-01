
"use strict";
(function(){ //}
var ItemModel, Main, Equip, QueryDb;
global.onReady(function(){
	ItemModel = rootRequire('shared','ItemModel'); Main = rootRequire('shared','Main'); Equip = rootRequire('server','Equip');
	QueryDb = rootRequire('shared','QueryDb',true);
});
var ItemList = exports.ItemList = function(extra){
	this.key = '';
	this.id = '';	//same are key
	this.data = {};	//id:amount
	Tk.fillExtra(this,extra);
};

/*

player has tradeList
if tradeList opened and click in inventory, it transfer item to tradeList

if tradelist close, transfer back item to inventory
if server crash, transfer tradelist to inventory

player has tradeWith:keyOther
loop and check if Actor.get(keyOther).tradeWith = something

when player close win, it sends message to server

*/

ItemList.create = function(key,data){
	return new ItemList({
		key:key,
		id:key,
		data:data,	//id:amount
	});
}

ItemList.getMain = function(inv){
	return Main.get(inv.id);
}

ItemList.format = function(id,amount,calledFromQuest){	//if calledFromQuest, ItemList.format will be called another time, check itemFormat
	var tmp = {};
	if(Array.isArray(id)) 
		return ERROR(3,'no longer supported');
	else if(typeof id === 'string')
		tmp[id] = amount || 1; 
	else if(typeof id === 'object') 
		tmp = id;
	
	if(!calledFromQuest) 
		for(var i in tmp) { 
			var a = tmp[i]; 
			delete tmp[i]; 
			tmp[ItemModel.getId(i)] = a; 
		}
	
	for(var i in tmp){
		if(SERVER && !calledFromQuest && !ItemModel.get(i)){ 
			ERROR(3,'item dont exist',i,tmp); 
			delete tmp[i]; 
			continue;
		}
		if(Math.floor(tmp[i]) !== tmp[i]){ 
			ERROR(3,'item amount isnt whole',i,tmp[i]); 
			delete tmp[i]; 
			continue;
		}
		if(tmp[i] === 0){
			delete tmp[i];
			continue;
		}
		if(tmp[i] < 0){
			ERROR(3,'item amount cannot be negative');
			delete tmp[i];
		}
	}
		
	return tmp;
}

ItemList.add = function (inv,id,amount){	//only preparing
	var list = ItemList.format(id,amount);	
	for(var i in list){
		inv.data[i] = inv.data[i] || 0;
		inv.data[i] += list[i];
	}
	ItemList.setFlag(inv);
	return list;
}

ItemList.setFlag = function(inv){
	var main = ItemList.getMain(inv);
	if(inv === main.invList) 
		Main.setFlag(main,'invList',function(main){
			return Main.ItemList.compressClient(main.invList);
		});
	else if(inv === main.bankList) 
		Main.setFlag(main,'bankList',function(main){
			return Main.ItemList.compressClient(main.bankList);
		});
	else if(inv === main.tradeList) 
		Main.setFlag(main,'tradeList',function(main){
			return Main.ItemList.compressClient(main.tradeList);
		});
		
}

ItemList.remove = function (inv,id,amount){		
	var list = ItemList.format(id,amount);	
	for(var i in list){
		inv.data[i] = inv.data[i] || 0;
		inv.data[i] -= list[i];
		if(inv.data[i] <= 0)
			delete inv.data[i];	
	}
	ItemList.setFlag(inv);
}


ItemList.getAmount = function(inv,id){
	return inv.data[id] || 0;
}

ItemList.have = function (inv,id,amount){
	var list = ItemList.format(id,amount);	
	for(var i in list) 
		if(ItemList.getAmount(inv,i) < list[i]) 
			return false;
	return true;
}

//############################

ItemList.transfer = function(originInv,destinationInv,id,amount,verifyIfOwn){
	var list = ItemList.format(id,amount);
	list = Tk.deepClone(list);
	if(verifyIfOwn && !ItemList.have(originInv,list)) 
		return false;
	ItemList.add(destinationInv,list);
	ItemList.remove(originInv,list);	
	return true;
}

ItemList.stringify = function(list,cb,separator){
	separator = separator || ', ';
	if(!SERVER){
		var str = '';
		for(var i in list){
			var item = QueryDb.get('item',i,cb);
			if(!item) return false;
			if(item.type !== 'equip')
				str += 'x' + list[i] + ' ' + item.name + separator;
			else
				str += '<strong>x' + list[i] + ' ' + item.name + '</strong>' + separator;
		}
		return str.slice(0,-separator.length);
	} else {
		var str = '';
		for(var i in list){
			var item = ItemModel.get(i);
			str += 'x' + list[i] + ' ' + item.name + separator;	
		}		
		
		return str.slice(0,-separator.length);
	}
}

ItemList.combine = function(inv,inv2){
	var res = Tk.deepClone(inv);
	
	for(var i in inv2.data){
		res.data[i] = res.data[i] || 0;
		res.data[i] += inv2.data[i];
	}
	return res;
}

ItemList.getData = function(inv){
	return inv.data || ERROR(3,'invalid inv');
}

ItemList.getAllItemOwned = function(key){
	var inv = ItemList.getData(Main.get(key).invList);
	var bank = ItemList.getData(Main.get(key).bankList);
	var equip = Equip.getAllEquipOwned(key,true);
	return inv.$keys().concat(bank.$keys()).concat(equip);
}

ItemList.toArray = function(data){
	if(Array.isArray(data)){
		//ERROR(3,'already array',data);
		return data;
	}
	var res = [];
	for(var i in data)
		res.push({id:i,amount:data[i]});
	return res;
}
ItemList.fromArray = function(data){
	if(typeof data === 'object' && !Array.isArray(data)){
		//ERROR(3,'already obj',data);
		return data;
	}
	var res = {};
	for(var i = 0 ; i < data.length; i++){
		if(data[i].amount !== 0){	//case db maintenance
			res[data[i].id] = res[data[i].id] || 0;	//case duplicate, used when id changing
			res[data[i].id] += data[i].amount;
		}
	}
	return res;
}


})(); //{










