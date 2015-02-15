//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require4('Actor'), QueryDb = require4('QueryDb'), Img = require4('Img'), Command = require4('Command'), ItemModel = require4('ItemModel'), Combat = require4('Combat'), Stat = require4('Stat'), ItemList = require4('ItemList'), Input = require4('Input');
var Dialog = require3('Dialog');

//Message.parseText.item rely on this
var helperLeft = function(i){
	return function(e){
		Command.execute('useItem',[i,1]);	//aka equip
	}
};
var helperRight = function(i){
	return function(e){
		Command.execute('useItem',[i,0]);
	}
};	
var refreshIfNoEquip = function(){
	Dialog.open('equip');	//refresh if wasnt there
	setTimeout(function(){
		Dialog.open('equip');
	},1000);
}

Dialog.create('equip','Equip',Dialog.Size(1000,600),Dialog.Refresh(function(html,variable){
	html.append($('<span>')
		.html('Current Exp: ' + Actor.getExp(player).r(0) + '<br>')
		.attr('title','Obtained by killing monsters, harvesting resources and creating equips.')
		.css({fontSize:'2em'})
	);
	
	//############
	//
	var array = [
		[0,1,2],
		[3,4,5]
	];
	
	var haveAllInfo = true;
	
	for(var i = 0 ; i < CST.equip.piece.length ; i++){	//1 => skip weapon
		var row = i <= 2 ? 0 : 1;
		var column = i % 3;
		
		var piece = CST.equip.piece[i];
		
		var id = Actor.getEquip(player).piece[piece];
		if(!id){
			array[row][column] = $('<div>')
				.html('No ' + piece.capitalize() + '<br>equipped')
				.css({fontSize:'1.5em',textAlign:'center',padding:'20px 20px',width:'280px'})
				.attr('title','Wear equipment by right-clicking the equip in your inventory.');
			continue;
		}
		var equip = QueryDb.get('equip',id,refreshIfNoEquip);
		if(!equip){
			haveAllInfo = false;
			continue;
		}
		
		var div = $('<div>').css(Dialog.equipPopup.globalDivCss);
		array[row][column] = Dialog.equipPopup.func(div,{},equip,true);		
	}	
	if(!haveAllInfo){
		return false;
	}
	
	
	var inventory = $('<div>')
		.html('<h3>In inventory:</h3>');
	
	var count = 0;
	
	
	for(var i in main.invList.data){	//BADD
		if(Dialog.equipPopup.isItemEquip(i)){
			var item = QueryDb.get('item',i);
			var icon = Img.drawIcon.html(item.icon,48,'Click to equip ' + item.name);
			icon.click(helperLeft(i))
			icon.bind('contextmenu',helperRight(i));
			icon.css({cursor:'pointer'});
			inventory.append(icon);
			if(++count % 6 === 0)
				inventory.append('<br>');
		}
	}
	array[1][2] = inventory;
	
	
	html.append(Tk.arrayToTable(array,false,false,false,'2px 2px').addClass('tableAlignTop'));
	
	
},function(){
	return Tk.stringify(Actor.getEquip(player).piece) + player.skill.exp + Tk.stringify(main.invList.data);
}));
//Dialog.open('equip')



//#####################
Dialog.equipPopup = {};
Dialog.equipPopup.isItemEquip = function(id){ //BADDDD
	var item = QueryDb.get('item',id);
	if(!item) return false;
	if(item.option[0].name === 'Examine Equip' && item.option[1].name === 'Wear Equip')
		return true;
	return false;	
}


Dialog.equipPopup.globalDivCss = {	
	border:'4px solid black',
	padding:'0px 0px',
	zIndex:Dialog.ZINDEX.HIGH,
	font:'1.3em Kelly Slab',
	color:'black',
	backgroundColor:'white',
	height:'auto',
	width:'auto',
	textAlign:'center',
	whiteSpace:'nowrap',
	//display:'inline-block'
}
Dialog.equipPopup.func = function(html,variable,equip,equipWin,notOwning){	//important part
	if(equipWin){/*
		var randomDiv = $('<div>')
			.css({width:'100%',height:'100%',left:0,top:0})
			
		html.append(randomDiv);
		*/
		var unequip = $(Img.drawIcon.html('system.close',18))
			.css({float:'right'})
			.attr('title','Unequip')
			.mousedown(function(){
				Command.execute('tab,removeEquip',[equip.piece]);
			});
		html.append(unequip);
	}
	
	
	var isWeapon = equip.piece === 'weapon';
	
	var top = $('<div>')
		.css({width:'auto',height:'auto',pointerEvents:'none'});
	html.append(top);
	var icon = Img.drawIcon.html(equip.icon,48)
			.addClass('inline');
	
	if(!notOwning){
		icon.css({pointerEvents:'all'});
		icon.attr('title','Click to display in chat. Also done by Shift-Right click in inventory.');
		icon.click(function(){
			ItemModel.displayInChat(equip,key);
		});
	}	
			
			
	var topRight = $('<div>')
		.addClass('inline')
		.css({position:'relative',margin:'0px 0px 0 0'})
		.append($('<span>')
			.css({
				color:equip.color === 'white' ? 'grey' : equip.color,
				fontSize:'1.5em',
				textDecoration:'underline',
				textAlign:'center',
				pointerEvents:'none',
			})
			.addClass('shadow')
			.html(equip.name + '<br>')
		)
		.append($('<span>')
			.html('Lv:' + equip.lvl + ', ')
			.attr('title','Level required to use this.')
		);/*
		.append($('<span>')
			.html('Qual.:' + equip.quality.r(3) + ' ')
			.attr('title','Impact how high the hidden boosts are.')
		);*/
	
	var to = isWeapon ? 'damage dealt.' : 'all its defence stats.';
	var bonus = Tk.round(Combat.getMasteryExpMod(equip.masteryExp),3,true);
	if(equip.upgradable){
		topRight.append($('<span>')
			.html('Exp Spent: ' + equip.masteryExp + ' ')
			.attr('title','Grant bonus of x' + bonus + ' to ' + to)
			.css({pointerEvents:'all'})
		);
		if(!notOwning){
			var title = isWeapon ? 'Spend Exp to improve the Power of this equip.' : 'Spend Exp to improve the Defence of this equip.';
			topRight.append($(Img.drawIcon.html('system1.more',20,title))
				.css({pointerEvents:'all',cursor:'pointer'})
				.mousedown(function(){
					Command.execute('equipMastery',[equip.id]);
				})
			);
		}
	}
	/*
	if(equip.creator)
		topRight.append($('<span>')
			.html('Creator:' + equip.creator)
			.attr('title','Player who found this equip.')
		);
	*/	
	
	top.append(icon,topRight);
	
	//var buttonDiv = $('<div>');
	
	/*
	if(equip.accountBound){
		buttonDiv.append($('<span>')
			.html('Bound')
			.attr('title','You can no longer trade this item.')
		);
		buttonDiv.append(' ');
	} else {
		var title = equip.creator === player.name 
			? 'Add a boost and every boost multiplied by x1.2. Equip become untradable.'
			: 'Add a boost. Equip become untradable.';
		buttonDiv.append($('<button>')
			.html('Bind')
			.attr('title',title)
			.mousedown(function(){
				Command.execute('equipBound',[equip.id]);
			})
		);
		buttonDiv.append(' ');
	}
	*/
	/*if(equip.salvagable){
		buttonDiv.append($('<button>')
			.html('Salvage')
			.attr('title','Destroy equip into crafting materials.')
			.mousedown(function(){
				Command.execute('equipSalvage',[equip.id]);
			})
		);
		buttonDiv.append(' ');
	}*/
	//html.append(buttonDiv);
	
	//##########################
	var ratio = $('<div>')
		.css({fontSize:'1.4em',verticalAlign:'center'});
		
	html.append(ratio);
	if(isWeapon){
		var dmg = Combat.getVisiblePower(equip.dmg.main);
		var elements = [];
		for(var element in equip.dmg.ratio){
			if(equip.dmg.ratio[element] === 1.5)
				elements.push(element);
		}
		
		ratio.append($('<span>')
			.html('Power: ' + dmg)
			.attr('title','Base Power for this weapon.')
		)
		.append(' ');
		
		for(var i in elements){
			ratio.append(Img.drawIcon.html('element.'+elements[i],24,'x1.5 Damage if using ' + elements[i].capitalize() + ' ability.'));	
		}
	} else {
		var def = Combat.getVisiblePower(equip.def.main);
		var elementMain = '';
		var elementSub = [];
		
		for(var elementMain in equip.def.ratio){
			if(equip.def.ratio[elementMain] > 1) break;
		}
		for(var i in equip.def.ratio){
			if(equip.def.ratio[i] === 1)
				elementSub.push(i);
		}
		
		if(elementMain)
			ratio.append($('<span>')
				.append((def*1.5).r(0) + ' ')
				.append(Img.drawIcon.html('element.'+elementMain,24))
				.attr('title','Defence against ' + elementMain.capitalize() + '.')
			);
		if(elementSub[0])
			ratio.append($('<span>')
				.append(' ' + def + ' ')
				.append(Img.drawIcon.html('element.'+elementSub[0],24))
				.attr('title','Defence against ' + elementSub[0].capitalize() + '.')
			);
		
		if(elementSub[1])
			ratio.append($('<span>')
				.append(' ' + def + ' ')
				.append(Img.drawIcon.html('element.'+elementSub[1],24))
				.attr('title','Defence against ' + elementSub[1].capitalize() + '.')
			);
	}
	//##########################
	var boostDiv = $('<div>')
		.css({textAlign:'center',border:'2px solid black',width:'100%',height:'100%'});
		//.css({fontSize:'1.4em',verticalAlign:'center'});
	html.append(boostDiv);
	var array = [];
	for(var i  = 0 ; i < equip.boost.length; i++){
		var boost = equip.boost[i];
		var stat = Stat.get(boost.stat);
		
		var value = '+' + boost.value.r(2);
		if(boost.type === '*' || stat.value.base === 0) value = '+' + (boost.value*100).r(2) + '%';
		
		array.push([
			$('<span>')
				.html(stat.name)
				.attr('title','Boost: ' + stat.description),
			$('<span>')
				.html(value)
		]);
	}
	var table = Tk.arrayToTable(array,false,false,false,'10px 0')
		.css({margin:'0 auto'})
	boostDiv.append(table)
	
	//#########
	if(equip.upgradable){
		var itemNeeded = ItemList.stringify(equip.upgradeInfo.item,function(){
			if(equipWin)
				Dialog.refresh('equip');
			else
				Dialog.refresh('equipPopup',Dialog.EquipPopup(equip.id))
		});
		if(!itemNeeded) return false;
		var unlockDiv = $('<div>');
				
		for(var i = equip.boost.length; equip.upgradable && i < equip.maxAmount; i++){
			var btn = $('<button>')
				.addClass('myButton');
			
			if(!notOwning)
				btn.html('Unlock hidden boost')
				.attr('title','Unlock a new boost. Cost: ' + itemNeeded + '.')
				.mousedown(function(){
					if(!notOwning)
						Command.execute('equipUpgrade',[equip.id]);
				});
			else 
				btn.html('Locked Boost')
			
			unlockDiv.append(btn);
			unlockDiv.append('<br>');
		}
		boostDiv.append(unlockDiv);
	}
	
	//#####################
	
	if(!equipWin){
		var mouse = Input.getMouse();
		var idealX = CST.WIDTH - mouse.x;
		var idealY = CST.HEIGHT - mouse.y;
		
		html.css({
			right:idealX.mm(0,CST.WIDTH-200),
			bottom:idealY.mm(0,CST.HEIGHT-200),
			position:'absolute',
		});
	}
	return html;
};

//Dialog.open('equipPopup',Dialog.EquipPopup('8v_tfE'))
Dialog.UI('equipPopup',Dialog.equipPopup.globalDivCss,Dialog.Refresh(function(html,variable,param){	//{notOwning,id}
	if(!param) return false;
	
	var equip = QueryDb.get('equip',param.id,function(){
		Dialog.open('equipPopup',param);
	});	
	if(!equip) return false;
	Dialog.equipPopup.func(html,variable,equip,false,param.notOwning);
}));


Dialog.EquipPopup = function(id,notOwning){
	return {
		notOwning:notOwning||false,
		id:id||'',	
	}
}


})();




