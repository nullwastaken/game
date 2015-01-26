//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
eval(loadDependency(['Message','Button','OptionList','MapModel','ItemModel','Main','ItemList']));

Main.ItemList = function(key,list){
	return ItemList(key,list);
}

Main.ItemList.compressDb = Main.ItemList.compressDb = function(list){
	return list.data;
}

Main.ItemList.uncompressDb = function(list,key){
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

Main.ItemList.compressClient = function(list){
	return list.data;
}

Main.ItemList.uncompressClient = function(list){
	return ItemList(key,list);
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
	if(!main.tradeInfo.otherId) return;
	
	var main2 = Main.getTradingWith(main);
	if(!main2) return Main.stopTrade(main);
	
	var selfInTheory = Main.getTradingWith(main2);
	if(selfInTheory !== main){
		return Main.stopTrade(main);
	}
}

Main.getUpdatedTradeInfo = function(main){
	var main2 = Main.getTradingWith(main);
	if(!main2){
		Main.stopTrade(main);
		return main.tradeInfo;
	}
	return {
		otherId:main2.username,
		data:Main.ItemList.compressClient(main2.tradeList),
		acceptSelf:main.tradeInfo.acceptSelf,
		acceptOther:main.tradeInfo.acceptOther
	}
}


Main.stopTrade = function(main){
	ItemList.transfer(main.tradeList,main.invList,main.tradeList.data,undefined,true);
	Main.closeDialog(main,'trade');
	main.tradeInfo.acceptSelf = false;
	main.tradeInfo.acceptOther = false;
	var main2 = Main.getTradingWith(main);
	main.tradeInfo.otherId = '';
	if(main2){
		main2.tradeInfo.otherId = '';
		Main.stopTrade(main2);	
	}
}

Main.doTrade = function(main){
	var main2 = Main.get(main.tradeInfo.otherId);
	if(!main2) return Main.stopTrade(main);
	
	var trade = Tk.deepClone(main.tradeList.data);
	var trade2 = Tk.deepClone(main2.tradeList.data);
	ItemList.transfer(main.tradeList,main2.invList,trade);
	ItemList.transfer(main2.tradeList,main.invList,trade2);
	Main.stopTrade(main);
	Main.stopTrade(main2);
	Main.addMessage(main,'Successful trade.');
	Main.addMessage(main2,'Successful trade.');
}

Main.getTradingWith = function(main){
	return Main.get(main.tradeInfo.otherId);
}	

Main.setTradeAcceptSelf = function(main,value){
	var main2 = Main.getTradingWith(main);
	if(!main2) return Main.stopTrade(main);
	
	main.tradeInfo.acceptSelf = value;
	main2.tradeInfo.acceptOther = value;
	
	if(main.tradeInfo.acceptSelf && main2.tradeInfo.acceptSelf){
		Main.doTrade(main);
	}	
	Main.setFlag(main,'tradeInfo');
	Main.setFlag(main2,'tradeInfo');
}

Main.startTrade = function(main,main2){	//shoul be requesting first
	main.tradeInfo.otherId = main2.id;
	main2.tradeInfo.otherId = main.id;
	Main.setTradeAcceptSelf(main,false);
	Main.setTradeAcceptSelf(main2,false);
	Main.openDialog(main,'trade');
	Main.openDialog(main2,'trade');
}



Main.isTrading = function(main){
	return !!Main.getTradingWith(main);
}

Main.canUseBank = function(main){
	if(!MapModel.get(Main.getAct(main).map).isTown)
		return Main.addMessage(main,'Access denied.');
	return true;
}

Main.addItem = function(main,id,amount){
	return ItemList.add(main.invList,id,amount);
}

Main.removeItem = function(main,id,amount){
	return ItemList.remove(main.invList,id,amount);
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
	Main.setFlag(main2,'tradeInfo');	//duplicate but makes more sense
}

Main.transferTradeInv = function(main,id,amount){
	var main2 = Main.getTradingWith(main);
	if(!main2) return Main.stopTrade(main);
	
	if(!ItemModel.get(id)) return;
	amount = Math.min(amount,ItemList.getAmount(main.tradeList,id));
	if(amount === 0) return;
	ItemList.transfer(main.tradeList,main.invList,id,amount);
	
	Main.setTradeAcceptSelf(main,false);
	Main.setTradeAcceptSelf(main2,false);
	Main.setFlag(main2,'tradeInfo');	//duplicate but makes more sense
}



Main.useItem = function(main,id,slot){
	if(!Main.haveItem(main,id)) return;
	var item = ItemModel.get(id);
	if(!item) return;
	var option = item.option[slot];
	if(!option) return;
	OptionList.executeOption(main,option);
}






//Dialog.open('bank')
Main.ItemList.init = function(){ //}
	Dialog('bank','Bank',Dialog.Size(500,500),Dialog.Refresh(function(html,variable,param){
		html.append('Shift-Left Click Amount: ');
		
		var input = $('<input>')
			.val(Main.getPref(main,'bankTransferAmount'))
			.attr('type','number')
			.attr('max',999999999)
			.attr('min',1);
		setTimeout(function(){	//BAD
			input.blur();
		},100);
		input.change(function(e){
			var newValue = input.val();
			Command.execute('pref',['bankTransferAmount',newValue]);
		});
		html.append(input);
			
		html.append('<br>');
		
		//#############
		var array = [[]];
		var arrayPosition = 0;
		for(var i in main.bankList.data){
			if(array[arrayPosition].length > 10){
				arrayPosition++;
				array.push([]);
			}
			var item = QueryDb.get('item',i,function(){
				Dialog.refresh('bank');
			});
			if(!item) continue;
			var amount = main.bankList.data[i];
			
			var itemHtml = Img.drawItem(item.icon,40,'Transfer ' + item.name,amount);
			
			
			itemHtml.click((function(i){
				return function(e){
					if(!e.shiftKey) Command.execute('transferBankInv',[i,1]);
					else Command.execute('transferBankInv',[i,Main.getPref(main,'bankTransferAmount')]);
				}
			})(i))
			.bind('contextmenu',(function(i){
				return function(e){
					if(!e.shiftKey) Command.execute('transferBankInv',[i,25]);
					else Command.execute('transferBankInv',[i,99999999999]);
				}
			})(i));
				
			array[arrayPosition].push(itemHtml);
		}	
		
		html.append(Tk.arrayToTable(array,false,false,false,'4px'));	
	},function(){
		return Tk.stringify(main.bankList.data);
	},10));
	
	//button accept trade
	Dialog('trade','Trade',Dialog.Size(600,450),Dialog.Refresh(function(html,variable,param){	//combine trade and bank?
		//#############
		var array = [[]];
		var arrayPosition = 0;
		for(var i in main.tradeList.data){
			if(array[arrayPosition].length >= 20){
				arrayPosition++;
				array.push([]);
			}
			var item = QueryDb.get('item',i,function(){
				Dialog.refresh('trade');
			});
			if(!item) continue;
			var amount = main.tradeList.data[i];
			
			var itemHtml = Img.drawItem(item.icon,40,'Transfer ' + item.name,amount);
			
			
			itemHtml.click((function(i){
				return function(e){
					if(!e.shiftKey) Command.execute('transferTradeInv',[i,1]);
					else Command.execute('transferTradeInv',[i,Main.getPref(main,'bankTransferAmount')]);
				}
			})(i))
			.bind('contextmenu',(function(i){
				return function(e){
					if(!e.shiftKey) Command.execute('transferTradeInv',[i,25]);
					else Command.execute('transferTradeInv',[i,99999999999]);
				}
			})(i));
				
			array[arrayPosition].push(itemHtml);
		}
		var table = Tk.arrayToTable(array,false,false,false,'4px');
		table.css({marginLeft:'auto',marginRight:'auto',minHeight:'100px'});
		
		var div = $('<div>')
			.css({textAlign:'center',width:'250px',height:'100px'})
			.addClass('inline')
			.append("<h2>Your Offer</h2>")
			.append(table)
			.append('Trade State: ' + (main.tradeInfo.acceptSelf ? 'Accepting' : 'Pending'));
			
		if(!main.tradeInfo.acceptSelf){
			div.append($('<button>').html('Accept')
				.attr('title','Click to accept trade.')
				.addClass('myButtonGreen skinny')
				.click(function(){
					Command.execute('tradeAcceptSelf',[true]);
				}));
		} else {
			div.append($('<button>').html('Undo')
				.attr('title','Click to no longer accept trade.')
				.addClass('myButtonRed skinny')
				.click(function(){
					Command.execute('tradeAcceptSelf',[false]);
				})
			);
		}
		div.append($('<button>').html('Refuse')
			.attr('title','Click to refuse trade and close window.')
			.addClass('myButtonRed skinny')
			.click(function(){
				Command.execute('tradeCloseWin',[]);
			})
		);
			
		
		//Other guy
		
		//#############
		var array = [[]];
		var arrayPosition = 0;
		for(var i in main.tradeInfo.data){
			if(array[arrayPosition].length >= 20){
				arrayPosition++;
				array.push([]);
			}
			var item = QueryDb.get('item',i,function(){
				Dialog.refresh('trade');
			});
			if(!item) continue;
			var amount = main.tradeInfo.data[i];
			
			var itemHtml = Img.drawItem(item.icon,40,item.name,amount);
			
			
			itemHtml.click((function(i){
				return function(e){
					if(Dialog.equipPopup.isItemEquip(i))
						Dialog.open('equipPopup',Dialog.EquipPopup(i,true));
				}
			})(i));
				
			array[arrayPosition].push(itemHtml);
		}
		var table2 = Tk.arrayToTable(array,false,false,false,'4px');
		table2.css({marginLeft:'auto',marginRight:'auto',minHeight:'100px'});
		
		var div2 = $('<div>')
			.css({textAlign:'center',width:'250px'})
			.addClass('inline')
			.append("<h2>" + main.tradeInfo.otherId + "'s Offer</h2>")
			.append(table2)
			.append('Trade State: ' + (main.tradeInfo.acceptOther ? 'Accepting' : 'Pending'))
		
		html.append(div,div2);
		
	},function(){
		return Tk.stringify(main.tradeList.data) + Tk.stringify(main.tradeInfo);
	},10,null,function(){
		Command.execute('tradeCloseWin',[]);
	}));	
}















