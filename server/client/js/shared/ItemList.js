//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var ItemModel = require2('ItemModel'), Main = require2('Main');
var QueryDb = require4('QueryDb');
/*

player has tradeList
if tradeList opened and click in inventory, it transfer item to tradeList

if tradelist close, transfer back item to inventory
if server crash, transfer tradelist to inventory

player has tradeWith:keyOther
loop and check if Actor.get(keyOther).tradeWith = something

when player close win, it sends message to server

*/

var ItemList = exports.ItemList = {};
ItemList.create = function(key,data){
	var tmp = {
		key:key,
		id:key,
		data:data || {},	//id:amount
	};
    return tmp;
}

ItemList.getMain = function(inv){
	return Main.get(inv.id);
}

ItemList.format = function(id,amount,calledFromQuest){	//if calledFromQuest, ItemList.format will be called another time, check itemFormat
	var tmp = {};
	if(Array.isArray(id)) return ERROR(3,'no longer supported');
	else if(typeof id === 'string'){ tmp[id] = amount || 1; }
	else if(typeof id === 'object') tmp = id;
	
	if(!calledFromQuest) 
		for(var i in tmp) { 
			var a = tmp[i]; 
			delete tmp[i]; 
			tmp[ItemModel.getId(i)] = a; 
		}
	
	for(var i in tmp){
		if(!calledFromQuest && !ItemModel.get(i)){ ERROR(3,'item dont exist',i,tmp); delete tmp[i]; }
		if(Math.floor(tmp[i]) !== tmp[i]){ ERROR(3,'item amount isnt whole',i,tmp[i]); delete tmp[i]; }
		if(tmp[i] === 0) 
			delete tmp[i];
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
}

ItemList.setFlag = function(inv){
	var main = ItemList.getMain(inv);
	if(inv === main.invList) Main.setFlag(main,'invList');
	else if(inv === main.bankList) Main.setFlag(main,'bankList');
	else if(inv === main.tradeList) Main.setFlag(main,'tradeList');
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
	
	for(var i in list) if(ItemList.getAmount(inv,i) < list[i]) return false;
	return true;
}

//############################


ItemList.transfer = function(originInv,destinationInv,id,amount,verifyIfOwn){
	var list = ItemList.format(id,amount);
	if(verifyIfOwn && !ItemList.have(originInv,list)) return false;
	ItemList.remove(originInv,list);
	ItemList.add(destinationInv,list);	
	
	return true;
}

ItemList.stringify = function(list,cb){
	if(!SERVER){
		var str = '';
		for(var i in list){
			var item = QueryDb.get('item',i,cb);
			if(!item) return false;
			if(item.type !== 'ability')
				str += 'x' + list[i] + ' ' + item.name + ', ';
			else
				str += '<u>x' + list[i] + ' ' + item.name + '</u>, ';
		}
		return str.slice(0,-2);
	} else {
		var str = '';
		for(var i in list){
			str += 'x' + list[i] + ' ' + ItemModel.get(i).name + ', ';		
		}		
		
		return str.slice(0,-2);
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
		
	return inv.$keys().concat(bank.$keys());
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
	for(var i = 0 ; i < data.length; i++)
		res[data[i].id] = data[i].amount;
	return res;
}


})(); //{










