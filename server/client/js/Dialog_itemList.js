//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Collision = require4('Collision'), Main = require4('Main'), Command = require4('Command'), QueryDb = require4('QueryDb'), Img = require4('Img');
var Dialog = require3('Dialog');

var helperBankLeft = function(i){
	return function(e){
		if(!e.shiftKey) Command.execute('transferBankInv',[i,1]);
		else Command.execute('transferBankInv',[i,Main.getPref(main,'bankTransferAmount')]);
	}
};
var helperBankRight = function(i){
	return function(e){
		if(!e.shiftKey) Command.execute('transferBankInv',[i,25]);
		else Command.execute('transferBankInv',[i,99999999999]);
	}
};	

Dialog.create('bank','Bank',Dialog.Size(500,500),Dialog.Refresh(function(html,variable,param){
		if(!variable.x){	//first time opening
			variable.x = player.x;
			variable.y = player.y
		}
		if(Collision.getDistancePtPt(variable,player) > 100){
			delete variable.x;
			delete variable.y;
			return false;
		}
		
		
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
		

		html.append(' ');
		html.append($('<button>')
			.html('Bank All')
			.addClass('myButton')
			.click(function(){
				Command.execute('transferInvBankAll',[]);
			})
		);
		html.append('<br>');
		
		//#############
		var array = [[]];
		var arrayPosition = 0;
		for(var i in main.bankList.data){
			if(array[arrayPosition].length >= 10){
				arrayPosition++;
				array.push([]);
			}
			var item = QueryDb.get('item',i,function(){
				Dialog.refresh('bank');
			});
			if(!item) continue;
			var amount = main.bankList.data[i];
			
			var itemHtml = Img.drawItem(item.icon,40,'Transfer ' + item.name,amount);
			
			
			itemHtml.click(helperBankLeft(i))
			.bind('contextmenu',helperBankRight(i));
				
			array[arrayPosition].push(itemHtml);
		}	
		
		html.append(Tk.arrayToTable(array,false,false,false,'4px'));	
	},function(html,variable,param){
		return Tk.stringify(main.bankList.data) + (Collision.getDistancePtPt(variable,player) > 100);
	},10)
);

var helperTradeLeft = function(i){
	return function(e){
		if(!e.shiftKey) Command.execute('transferTradeInv',[i,1]);
		else Command.execute('transferTradeInv',[i,Main.getPref(main,'bankTransferAmount')]);
	}
};
var helperTradeRight = function(i){
	return function(e){
		if(!e.shiftKey) Command.execute('transferTradeInv',[i,25]);
		else Command.execute('transferTradeInv',[i,99999999999]);
	}
};	

var helperOtherTradeLeft = function(i){
	return function(e){
		if(Dialog.equipPopup.isItemEquip(i))
			Dialog.open('equipPopup',Dialog.EquipPopup(i,true));
	}
};	
	
	//button accept trade
Dialog.create('trade','Trade',Dialog.Size(600,450),Dialog.Refresh(function(html,variable,param){	//combine trade and bank?
		//#############
		var array = [[]];
		var arrayPosition = 0;
		for(var i in main.tradeList.data){
			if(array[arrayPosition].length >= 5){
				arrayPosition++;
				array.push([]);
			}
			var item = QueryDb.get('item',i,function(){
				Dialog.refresh('trade');
			});
			if(!item) continue;
			var amount = main.tradeList.data[i];
			
			var itemHtml = Img.drawItem(item.icon,40,'Transfer ' + item.name,amount);
			
			
			itemHtml.click(helperTradeLeft(i))
			.bind('contextmenu',helperTradeRight(i));
				
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
			if(array[arrayPosition].length >= 5){
				arrayPosition++;
				array.push([]);
			}
			var item = QueryDb.get('item',i,function(){
				Dialog.refresh('trade');
			});
			if(!item) continue;
			var amount = main.tradeInfo.data[i];
			
			var itemHtml = Img.drawItem(item.icon,40,item.name,amount);
			
			
			itemHtml.click(helperOtherTradeLeft(i));
				
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
	},10,null,null,function(){
		Command.execute('tradeCloseWin',[]);
	})
);	



})(); //{