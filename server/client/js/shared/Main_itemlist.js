
"use strict";
(function(){ //}
var Message, Achievement, Sign, Server, Actor, OptionList, ItemModel, ItemList;
global.onReady(function(){
	Message = rootRequire('shared','Message'); Achievement = rootRequire('shared','Achievement'); Sign = rootRequire('private','Sign'); Server = rootRequire('private','Server'); Actor = rootRequire('shared','Actor'); OptionList = rootRequire('shared','OptionList'); ItemModel = rootRequire('shared','ItemModel'); ItemList = rootRequire('shared','ItemList');

	var Command = rootRequire('shared','Command');
	Command.create(CST.COMMAND.useItem,Command.MAIN,[ //{
		Command.Param('string','Id',false),
		Command.Param('number','Option Position',false),
	],Main.useItem); //}

	Command.create(CST.COMMAND.transferInvBank,Command.MAIN,[ //{
		Command.Param('string','Item Id',false),
		Command.Param('number','Amount',true,{default:1,min:1}),
	],Main.transferInvBank); //}

	Command.create(CST.COMMAND.transferBankInv,Command.MAIN,[ //{
		Command.Param('string','Item Id',false),
		Command.Param('number','Amount',true,{default:1,min:1}),
	],Main.transferBankInv); //}

	Command.create(CST.COMMAND.transferInvBankAll,Command.MAIN,[ //{
	],Main.transferInvBankAll); //}

	Command.create(CST.COMMAND.transferInvTrade,Command.MAIN,[ //{
		Command.Param('string','Item Id',false),
		Command.Param('number','Amount',true,{default:1,min:1}),
	],Main.transferInvTrade); //}

	Command.create(CST.COMMAND.transferTradeInv,Command.MAIN,[ //{
		Command.Param('string','Item Id',false),
		Command.Param('number','Amount',true,{default:1,min:1}),
	],Main.transferTradeInv); //}
	Command.create(CST.COMMAND.tradeAcceptSelf,Command.MAIN,[ //{
		Command.Param('boolean','New State',false),
	],Main.setTradeAcceptSelf); //}

	Command.create(CST.COMMAND.tradeCloseWin,Command.MAIN,[ //{
	],Main.stopTrade); //}
	
});
var Main = rootRequire('shared','Main');



var MAX_BANK_SIZE = 75;

Main.ItemList = function(key,list){
	return ItemList.create(key,list);
}

Main.ItemList.compressDb = Main.ItemList.compressDb = function(list){
	return ItemList.toArray(list.data);
}

Main.ItemList.uncompressDb = function(list,key){
	list = ItemList.fromArray(list);
	var inv = Main.ItemList(key,list);
	
	//checkIntegrity is done in Sign.in.loadMain
	/*
	if(!Main.ItemList.checkIntegrity(inv)){
		setTimeout(function(){
			if(Main.get(key))
				Message.add(key,'Sorry, we can\'t find the data about one or multiples items you own... :('); 
		},1000);
	}
	*/
	return inv;
}

Main.ItemList.getDbSchema = function(){
	return Array.of({id:String,amount:Number});
}


Main.ItemList.compressClient = function(list){
	return list.data;
}

Main.ItemList.uncompressClient = function(list){
	return ItemList.create(null,list);
}

Main.ItemList.checkIntegrity = function(inv){
	var good = true;
	for(var i in inv.data){
		if(!ItemModel.get(i)){
			ERROR(2,'cant find item',i);
			delete inv.data[i];
			good = false;
		}
	}
	return good;
};

Main.ItemList.loop = function(main){
	if(!main.tradeInfo.otherId) 
		return;
	
	var main2 = Main.getTradingWith(main);
	if(!main2) 
		return Main.stopTrade(main);
	
	var selfInTheory = Main.getTradingWith(main2);
	if(selfInTheory !== main){
		return Main.stopTrade(main);
	}
}



Main.stopTrade = function(main,message){
	ItemList.transfer(main.tradeList,main.invList,main.tradeList.data,undefined,true);
	
	Main.closeDialog(main,'trade');
	main.tradeInfo.acceptSelf = false;
	main.tradeInfo.acceptOther = false;
	var main2 = Main.getTradingWith(main);
	main.tradeInfo.otherId = '';
	
	if(message !== false)
		Main.addMessage(main,'Trade refused.');
	if(main2){
		if(message !== false)
			Main.addMessage(main2,'Trade refused.');
		main2.tradeInfo.otherId = '';
		Main.stopTrade(main2,false);	
	}
}

Main.doTrade = function(main){
	var main2 = Main.get(main.tradeInfo.otherId);
	if(!main2) 
		return Main.stopTrade(main);
	
	ItemList.transfer(main.tradeList,main2.invList,main.tradeList.data);
	ItemList.transfer(main2.tradeList,main.invList,main2.tradeList.data);
	Main.stopTrade(main);
	Main.stopTrade(main2);
	Main.addMessage(main,'Trade accepted.');
	Main.addMessage(main2,'Trade accepted.');
	Achievement.onTrade(main);
	Achievement.onTrade(main2);
}

Main.getTradingWith = function(main){
	return Main.get(main.tradeInfo.otherId);
}	

Main.setTradeAcceptSelf = function(main,value){
	var main2 = Main.getTradingWith(main);
	if(!main2) 
		return Main.stopTrade(main);
	
	main.tradeInfo.acceptSelf = value;
	main2.tradeInfo.acceptOther = value;
	
	if(main.tradeInfo.acceptSelf && main2.tradeInfo.acceptSelf){
		Main.doTrade(main);
	}	
	var f = function(main){
		return Main.TradeInfo.compressClient(main);
	}
	Main.setFlag(main,'tradeInfo',f);
	Main.setFlag(main2,'tradeInfo',f);
}



Main.startTrade = function(main,main2){	//shoul be requesting first
	main.tradeInfo.otherId = main2.id;
	main2.tradeInfo.otherId = main.id;
	Main.setTradeAcceptSelf(main,false);
	Main.setTradeAcceptSelf(main2,false);
	Main.openDialog(main,'trade');
	Main.openDialog(main2,'trade');
}

Main.getInventorySlotUsed = function(main){
	return main.invList.data.$length();
}

Main.isTrading = function(main){
	return !!Main.getTradingWith(main);
}

Main.canUseBank = function(main){
	if(!Actor.isNearBank(Main.getAct(main)))
		return Main.addMessage(main,'Access denied.');
	return true;
}

Main.addItem = function(main,id,amount){
	if(!main.invList)
		return ERROR(3,'invalid main',main);
	var list = ItemList.add(main.invList,id,amount);
	for(var i in list)
		Achievement.onItemAdd(main,i,list[i]);
}

Main.removeItem = function(main,id,amount){
	ItemList.remove(main.invList,id,amount);
}

Main.haveItem = function(main,id,amount){
	return ItemList.have(main.invList,id,amount);
}

Main.getItemAmount = function(main,id){
	return ItemList.getAmount(main.invList,id);
}

Main.addItemBank = function(main,id,amount){
	ItemList.add(main.bankList,id,amount);
}

//###########################

Main.transferInvBank = function(main,id,amount){
	if(!Main.canUseBank(main)) return;
	
	if(!ItemModel.get(id)) return;
	if(!ItemModel.get(id).bank) return Main.addMessage(main,'You can\'t bank this item.');
	
		
	amount = Math.min(amount,Main.getItemAmount(main,id));
	if(amount === 0) return;
	ItemList.transfer(main.invList,main.bankList,id,amount);
}

Main.transferInvBankAll = function(main,id,amount){
	if(main.bankList.data.$keys().length > MAX_BANK_SIZE)
		return Message.addPopup(main.id,'You have too many items in your bank. You need to salvage unused equipments.');
	
	var toTransfer = {};
	for(var i in main.invList.data){
		if(ItemModel.get(i) && ItemModel.get(i).bank)
			toTransfer[i] = main.invList.data[i];
	}
	ItemList.transfer(main.invList,main.bankList,toTransfer);
}

Main.transferBankInv = function(main,id,amount){
	if(!Main.canUseBank(main)) return;
	if(!ItemModel.get(id)) return;
	amount = Math.min(amount,ItemList.getAmount(main.bankList,id));
	if(amount === 0) return;
	ItemList.transfer(main.bankList,main.invList,id,amount);
}

Main.transferInvTrade = function(main,id,amount){
	var main2 = Main.getTradingWith(main);
	if(!main2) return Main.stopTrade(main);
	
	if(!ItemModel.get(id)) return;
	if(!ItemModel.get(id).trade) return Main.addMessage(main,'You can\'t trade this item.');
	amount = Math.min(amount,Main.getItemAmount(main,id));
	if(amount === 0) return;
	ItemList.transfer(main.invList,main.tradeList,id,amount);
	
	Main.setTradeAcceptSelf(main,false);
	Main.setTradeAcceptSelf(main2,false);
}

Main.transferTradeInv = function(main,id,amount){
	var main2 = Main.getTradingWith(main);
	if(!main2) return Main.stopTrade(main);
	
	if(!ItemModel.get(id)) return;
	amount = Math.min(amount,ItemList.getAmount(main.tradeList,id));
	if(amount === 0) 
		return;
	ItemList.transfer(main.tradeList,main.invList,id,amount);
	
	Main.setTradeAcceptSelf(main,false);
	Main.setTradeAcceptSelf(main2,false);
}

Main.useItem = function(main,id,slot){
	if(!Main.haveItem(main,id)) 
		return;
	var item = ItemModel.get(id);
	if(!item) return;
	var option = item.option[slot];
	if(!option) return;
	
	if(item.adminOnly && !Server.isAdmin(main.id)){
		Sign.off(main.id,"Not allowed to use admin tools.");
		return ERROR(2,'regular player using admin tools',main.username,item.id);
	}
	Main.playSfx(main,'select');
	OptionList.executeOption(main,option);
}

})(); //{











