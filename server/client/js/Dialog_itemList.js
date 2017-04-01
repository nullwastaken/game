
"use strict";
(function(){ //}
var Collision, Command, QueryDb, Img;
global.onReady(function(){
	Collision = rootRequire('shared','Collision',true); Command = rootRequire('shared','Command',true); QueryDb = rootRequire('shared','QueryDb',true); Img = rootRequire('client','Img',true);
});
var Dialog = rootRequire('client','Dialog');

var helperBankLeft = function(i){
	return function(e){
		if(!e.shiftKey) Command.execute(CST.COMMAND.transferBankInv,[i,1]);
		else Command.execute(CST.COMMAND.transferBankInv,[i,100]);
	}
};
var helperBankRight = function(i){
	return function(e){
		if(!e.shiftKey) Dialog.displayEquipIfEquip(i);
		else Command.execute(CST.COMMAND.transferBankInv,[i,99999999999]);
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
		variable.x = w.player.x;
		variable.y = w.player.y
	}
	if(Collision.getDistancePtPt(variable,w.player) > 100){
		delete variable.x;
		delete variable.y;
		return false;
	}
	
	var top = $('<div>');
	var all = $('<div>')
		.css({float:'left'})
		.append('<br>',
			$('<button>')
			.html('Bank All')
			.addClass('myButton')
			.click(function(){
				Command.execute(CST.COMMAND.transferInvBankAll,[]);
			})
		);
	var right = $('<div>')
		.css({float:'left',marginLeft:'10px'})
		.append('<h4 class="u">Mouse Shortcuts</h4>');
	
	var rightLeft = $('<div>')
		.css({float:'left',marginLeft:'8px'})
		.html('Left: Take 1<br>'
			+ 'Right: Examine');
	var rightRight = $('<div>')
		.css({float:'left',marginLeft:'18px'})
		.html('Shift-Left: Take 100<br>'
			+ 'Shift-Right: Take All');
	right.append(rightLeft,rightRight);
			
	top.append(all,right);
	html.append(top);
	
	
	
	html.append('<br style="clear:both" />');
	
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
			var amount = w.main.bankList.data[id];
			
			var itemHtml = Img.drawItem(id,40,'Transfer ' + item.name,amount);
			
			
			itemHtml.click(helperBankLeft(id))
			.bind('contextmenu',helperBankRight(id));
				
			array[arrayPosition].push(itemHtml);
		}
		if(array[0].length > 0){
			var table = Tk.arrayToTable(array,false,false,false,'6px');
			
			div.append('<u style="font-size:1em">' + order[j].$capitalize() + '</u><br>');
			div.append(table);
		}
	}
	
	html.append(div);	
},function(html,variable,param){
	return Tk.stringify(w.main.bankList.data) + (Collision.getDistancePtPt(variable,w.player) > 100);
},10));

var helperTradeLeft = function(i){
	return function(e){
		if(!e.shiftKey) 
			Command.execute(CST.COMMAND.transferTradeInv,[i,1]);
		else 
			Command.execute(CST.COMMAND.transferTradeInv,[i,100]);
	}
};
var helperTradeRight = function(i){
	return function(e){
		if(!e.shiftKey) 
			Dialog.displayEquipIfEquip(i);
		else 
			Command.execute(CST.COMMAND.transferTradeInv,[i,99999999999]);
	}
};	


var helperOtherTradeLeft = function(i){
	return function(){
		Dialog.displayEquipIfEquip(i);
	}
};	

var placeBankInOrder = function(){
	var list = {
		equip:[],
		material:[],
		misc:[],
	}
	for(var i in w.main.bankList.data){
		var item = QueryDb.get('item',i,refreshBank);
		if(!item) continue;
		if(item.type === CST.ITEM.equip)
			list.equip.push(i);
		else if(item.type === CST.ITEM.material)
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
	for(var i in w.main.tradeList.data){
		if(array[arrayPosition].length >= 5){
			arrayPosition++;
			array.push([]);
		}
		var item = QueryDb.get('item',i,refreshTrade);
		if(!item) continue;
		var amount = w.main.tradeList.data[i];
		
		var itemHtml = Img.drawItem(i,40,'Transfer ' + item.name,amount);
		
		
		itemHtml.click(helperTradeLeft(i))
		.bind('contextmenu',helperTradeRight(i));
			
		array[arrayPosition].push(itemHtml);
	}
	var table = Tk.arrayToTable(array,false,false,false,'6px');
	table.css({marginLeft:'auto',marginRight:'auto',minHeight:'100px'});
	
	var status = w.main.tradeInfo.acceptSelf 
		? $('<span>').html('Accepting').css({color:CST.color.green}).addClass('shadow')
		: $('<span>').html('Pending').css({color:CST.color.orange}).addClass('shadow');
	
	var div = $('<div>')
		.css({textAlign:'center',width:'250px',height:'100px'})
		.addClass('inline')
		.append("<h2>Your Offer</h2>")
		.append(table)
		.append('Trade State: ')
		.append(status);
		
	if(!w.main.tradeInfo.acceptSelf){
		div.append($('<button>').html('Accept')
			.attr('title','Click to accept trade.')
			.addClass('myButtonGreen skinny')
			.click(function(){
				Command.execute(CST.COMMAND.tradeAcceptSelf,[true]);
			}));
	} else {
		div.append($('<button>').html('Undo')
			.attr('title','Click to no longer accept trade.')
			.addClass('myButtonRed skinny')
			.click(function(){
				Command.execute(CST.COMMAND.tradeAcceptSelf,[false]);
			})
		);
	}
	div.append($('<button>').html('Refuse')
		.attr('title','Click to refuse trade and close window.')
		.addClass('myButtonRed skinny')
		.click(function(){
			Command.execute(CST.COMMAND.tradeCloseWin,[]);
		})
	);
		
	
	//Other guy
	
	//#############
	var array = [[]];
	var arrayPosition = 0;
	for(var i in w.main.tradeInfo.data){
		if(array[arrayPosition].length >= 5){
			arrayPosition++;
			array.push([]);
		}
		var item = QueryDb.get('item',i,refreshTrade);
		if(!item) continue;
		var amount = w.main.tradeInfo.data[i];
		
		var itemHtml = Img.drawItem(i,40,item.name,amount);
		
		
		itemHtml.click(helperOtherTradeLeft(i));
			
		array[arrayPosition].push(itemHtml);
	}
	var table2 = Tk.arrayToTable(array,false,false,false,'6px');
	table2.css({marginLeft:'auto',marginRight:'auto',minHeight:'100px'});
	
	var status = w.main.tradeInfo.acceptOther 
		? $('<span>').html('Accepting').css({color:CST.color.green}).addClass('shadow')
		: $('<span>').html('Pending').css({color:CST.color.orange}).addClass('shadow');
		
	var div2 = $('<div>')
		.css({textAlign:'center',width:'250px'})
		.addClass('inline')
		.append("<h2>" + w.main.tradeInfo.otherId + "'s Offer</h2>")
		.append(table2)
		.append('Trade State: ',status);
	
	html.append(div,div2);
},function(){
	return Tk.stringify(w.main.tradeList.data) + Tk.stringify(w.main.tradeInfo);
},10,null,null,function(){
	Command.execute(CST.COMMAND.tradeCloseWin,[]);
}));	



})(); //{