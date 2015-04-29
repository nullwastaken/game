//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Collision = require4('Collision'), Command = require4('Command'), QueryDb = require4('QueryDb'), Img = require4('Img');
var Dialog = require3('Dialog');

var helperBankLeft = function(i){
	return function(e){
		if(!e.shiftKey) Command.execute('transferBankInv',[i,1]);
		else Command.execute('transferBankInv',[i,1000]);
	}
};
var helperBankRight = function(i){
	return function(e){
		if(!e.shiftKey) Command.execute('transferBankInv',[i,25]);
		else Command.execute('transferBankInv',[i,99999999999]);
	}
};	

var refreshBank = function(){
	Dialog.refresh('bank');
};
var refreshTrade = function(){
	Dialog.refresh('trade');
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
	
	html.append($('<button>')
		.html('Bank All')
		.addClass('myButton')
		.click(function(){
			Command.execute('transferInvBankAll',[]);
		})
	);
	html.append('<br>');
	
	//#############
	
	var div = $('<div>');
	
	
		
	var list = placeBankInOrder();
	var order = ['material','equip','misc'];
	
	
	for(var j = 0 ; j < order.length; j++){
		var array = [[]];
		var arrayPosition = 0;
		for(var i in list[order[j]]){
			var id = list[order[j]][i];
			if(array[arrayPosition].length >= 10){
				arrayPosition++;
				array.push([]);
			}
			var item = QueryDb.get('item',id,refreshBank);
			if(!item) continue;
			var amount = main.bankList.data[id];
			
			var itemHtml = Img.drawItem(item.icon,40,'Transfer ' + item.name,amount);
			
			
			itemHtml.click(helperBankLeft(id))
			.bind('contextmenu',helperBankRight(id));
				
			array[arrayPosition].push(itemHtml);
		}
		if(array[0].length > 0){
			var table = Tk.arrayToTable(array,false,false,false,'4px');
			div.append('<u style="font-size:1em">' + order[j].$capitalize() + '</u><br>');
			div.append(table);
		}
	}
	
	html.append(div);	
},function(html,variable,param){
	return Tk.stringify(main.bankList.data) + (Collision.getDistancePtPt(variable,player) > 100);
},10));

var helperTradeLeft = function(i){
	return function(e){
		if(!e.shiftKey) Command.execute('transferTradeInv',[i,1]);
		else Command.execute('transferTradeInv',[i,1000]);
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
	
var placeBankInOrder = function(){
	var list = {
		equip:[],
		material:[],
		misc:[],
	}
	for(var i in main.bankList.data){
		var item = QueryDb.get('item',i,refreshBank);
		if(!item) continue;
		if(item.type === 'equip')
			list.equip.push(i);
		else if(item.type === 'material')
			list.material.push(i);
		else
			list.misc.push(i);
	}
	return list;
}	
	
	
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
			var item = QueryDb.get('item',i,refreshTrade);
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
			var item = QueryDb.get('item',i,refreshTrade);
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