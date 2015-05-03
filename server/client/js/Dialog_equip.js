//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
//"use strict";
(function(){ //}
var Actor = require4('Actor'), AttackModel = require4('AttackModel'), QueryDb = require4('QueryDb'), Img = require4('Img'), Command = require4('Command'), ItemModel = require4('ItemModel'), Combat = require4('Combat'), Stat = require4('Stat'), ItemList = require4('ItemList'), Input = require4('Input');
var Dialog = require3('Dialog');

//Message.parseText.item rely on this
var helperLeft = function(i){
	return function(){
		Command.execute('useItem',[i,1]);	//aka equip
	}
};
var helperRight = function(i){
	return function(){
		Command.execute('useItem',[i,0]);
	}
};	

var WIDTH = '280px';
var RATIO = 1.5;
var getWeaponElement = function(equip ){
	var elements = [];
	for(var element in equip.dmg.ratio){
		if(equip.dmg.ratio[element] === RATIO)
			elements.push(element);
	}
	return elements;
}

var refresh = function(){
	Dialog.open('equip');
};

Dialog.create('equip','Equip',Dialog.Size(925,650),Dialog.Refresh(function(html,variable){
	variable.exp = $('<span>');
	
	html.append($('<span>')
		.append('Exp: ',variable.exp,'<br>')
		.attr('title','Obtained by killing monsters, harvesting resources and creating equips.')
		.css({fontSize:'2em'})
	);
		
	variable.inventory = $('<div>').css({width:WIDTH}).html('a');
	variable.ability = $('<div>').css({width:WIDTH}).html('a');
	variable.inventoryAbility = $('<div>').append(variable.inventory,variable.ability);
	
	variable.helm = $('<div>').css(Dialog.equipPopup.globalDivCss);
	variable.amulet = $('<div>').css(Dialog.equipPopup.globalDivCss);
	variable.weapon = $('<div>').css(Dialog.equipPopup.globalDivCss);
	variable.body = $('<div>').css(Dialog.equipPopup.globalDivCss);
	variable.ring = $('<div>').css(Dialog.equipPopup.globalDivCss);
	
	var array = [
		[variable.inventoryAbility,variable.helm,variable.amulet],
		[variable.weapon,variable.body,variable.ring]	
	];
	html.append(Tk.arrayToTable(array,false,false,false,'2px 2px').addClass('tableAlignTop'));
	return true;
},function(){
	return Tk.stringify(Actor.getEquip(player).piece) + Actor.getExp(player) + Tk.stringify(main.invList.data);
},10,function(html,variable,param){
	var exp = Actor.getExp(player);
	if(variable.oldExp !== exp){
		variable.oldExp = exp;
		variable.exp.html(exp.r(0));
	}
	
	variable.ability.html('');
	var weaponId = Actor.getWeapon(player);
	if(weaponId !== CST.UNARMED){
		variable.ability.html('<span style="font-size:1.5em">Ability Damage Bonus:</span><br>');
		var ability = Actor.getAbility(player);
		var weapon = QueryDb.get('equip',weaponId,refresh);	//should always work
		
		
		for(var i = 0 ; i < 4; i++){
			var img;
			if(!ability[i]){
				img = Img.drawIcon.html(null,30);		
			} else {
				var ab = QueryDb.get('ability',ability[i],refresh);	//should always work
				if(!ab)
					img = Img.drawIcon.html(null,30);	
				else {
					img = Img.drawIcon.html(ab.icon,30);	
					if(ab.type === 'attack' && weapon && weaponId !== CST.UNARMED){
						var element = AttackModel.getElement(ab.param);
						if(getWeaponElement(weapon).$contains(element))
							img.css({border:'4px solid #55FF55'}).attr({title:'+50% damage because ability element matches weapon elements.'});
						else
							img.css({border:'4px solid red'}).attr({title:'No damage bonus because ability element doesn\'t match weapon elements.'});
					}				
				}
			}
			variable.ability.append(img,' ');
		}
	}
	
	var json = Tk.stringify(main.invList.data);
	if(variable.oldInventory !== json){
		variable.oldInventory = json;
		variable.inventory.html('<span style="font-size:1.5em">Inventory:</span><br>');
		
		var count = 0;
		
		for(var i in main.invList.data){	//BADD
			if(Dialog.equipPopup.isItemEquip(i)){
				var item = QueryDb.get('item',i,refresh);
				var icon = Img.drawIcon.html(item.icon,32,'Click to equip ' + item.name);
				icon.click(helperLeft(i))
				icon.bind('contextmenu',helperRight(i));
				icon.css({cursor:'pointer'});
				variable.inventory.append(icon,' ');
				if(++count % 6 === 0)
					variable.inventory.append('<br>');
			}
		}
	}
	var list = Actor.getEquip(player).piece;
	for(var piece in list){
		var id = Actor.getEquip(player).piece[piece];
		if(!id){
			variable[piece]
				.html('No ' + piece.$capitalize() + '<br>equipped<br><br>Equip one via<br>the Inventory.')
				.css({padding:'20px 20px'});
			continue;
		}
		var equip = QueryDb.get('equip',id,refresh);
		if(!equip)
			continue;
			
		if(variable['old' + piece] === list[piece])
			continue;
		variable['old' + piece] = list[piece];
		
		variable[piece].html('').css({padding:'0px 0px'});
		Dialog.equipPopup.func(variable[piece],{},equip,true);
	}
}));
//Dialog.open('equip')

//#####################
Dialog.equipPopup = {};
Dialog.equipPopup.isItemEquip = function(id){ //BADDDD
	var item = QueryDb.get('item',id,refresh);
	if(!item) return false;
	if(item.option && item.option[0].name === 'Examine Equip' && item.option[1].name === 'Wear Equip')
		return true;
	return false;	
}

Dialog.equipPopup.globalDivCss = {	
	width:WIDTH,
	border:'4px solid black',
	padding:'0px 0px',
	zIndex:Dialog.ZINDEX.HIGH,
	font:'1.3em Kelly Slab',
	color:'black',
	backgroundColor:'white',
	height:'auto',
	minHeight:'250px',
	textAlign:'center',
	whiteSpace:'nowrap',
}
Dialog.equipPopup.func = function(html,variable,equip,equipWin,notOwning){	//important part
	if(equipWin){
		var unequip = $(Img.drawIcon.html('system-close',18))
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
		icon.mousedown(function(){
			ItemModel.displayInChat(equip);
		});
	}	
			
			
	var topRight = $('<div>')
		.addClass('inline')
		.css({position:'relative',margin:'0px 0px 0 0'})
		.append($('<span>')
			.css({
				color:equip.color === 'white' ? 'grey' : equip.color,
				fontSize:'1.2em',
				textDecoration:'underline',
				textAlign:'center',
				pointerEvents:'none',
			})
			.addClass('shadow')
			.html(equip.name + '<br>')
		);
		
	var tmp = $('<span>')
		.append($('<span>')
			.html('Lv:' + equip.lvl + ' ')
			.attr('title','Level required to use this.')
			.css({pointerEvents:'all'})
		);
		
	if(equip.tier !== 0){
		var upgrade = '+' + Tk.round((Combat.getTierMod(equip.tier)-1)*100) + '%'
		
		tmp.append($('<span>')
			.html('(+' + equip.tier + ') ')
			.attr('title',upgrade + (isWeapon ? ' Dmg' : ' Def'))
			.css({pointerEvents:'all',fontSize:'0.8em'})
		);			
	}
	topRight.append(tmp);	
	
	if(equip.upgradable){
		var exp = equip.masteryExp;
		if(equip.masteryExp > 10000)
			exp = Math.round(equip.masteryExp/1000) + 'K';
		
		topRight.append($('<span>')
			.append($('<button>')
				.css({fontSize:'0.8em',paddingLeft:'4px',pointerEvents:'all'})
				.html('Upgrade')
				.attr('title','Upgrade Cost: ' + equip.tierCost + ' Exp. Increase equip ' + (isWeapon ? 'damage' : 'defence') + ' by 5%.')
				.addClass('myButton skinny')
				.css({background: Actor.getExp(player) < equip.tierCost 
					? '#FFEEEE' : '#EEFFEE'})					
				.mousedown(function(){
					Command.execute('equipTier',[equip.id]);
				})
			)
		);
	}
	/*
	if(equip.creator)
		topRight.append($('<span>')
			.html('Creator:' + equip.creator)
			.attr('title','Player who found this equip.')
		);
	*/	
	
	top.append(icon,topRight);
	
	//##########################
	var ratio = $('<div>')
		.css({fontSize:'1.4em',verticalAlign:'center'});
		
	html.append(ratio);
	if(isWeapon){
		var dmg = Combat.getVisiblePower(equip.dmg.main);
		var elements = getWeaponElement(equip);
		
		ratio.append($('<span>')
			.html('Power: ' + dmg)
			.attr('title','Base Power for this weapon.')
		)
		.append(' ');
		
		for(var i in elements){
			ratio.append(Img.drawIcon.html(Img.getIcon('element',elements[i]),24,'x1.5 Damage if using ' + elements[i].$capitalize() + ' ability.'));	
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
				.append(Img.drawIcon.html(Img.getIcon('element',elementMain),24))
				.attr('title','Defence against ' + elementMain.$capitalize() + '.')
			);
		if(elementSub[0])
			ratio.append($('<span>')
				.append(' ' + def + ' ')
				.append(Img.drawIcon.html(Img.getIcon('element',elementSub[0]),24))
				.attr('title','Defence against ' + elementSub[0].$capitalize() + '.')
			);
		
		if(elementSub[1])
			ratio.append($('<span>')
				.append(' ' + def + ' ')
				.append(Img.drawIcon.html(Img.getIcon('element',elementSub[1]),24))
				.attr('title','Defence against ' + elementSub[1].$capitalize() + '.')
			);
	}
	//##########################
	var boostDiv = $('<div>')
		.css({textAlign:'center',marginTop:'5px',width:'100%',height:'100%'});//,border:'2px solid black'
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
				.attr('title',stat.description),
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
				
		var helper = function(){
			if(!notOwning)
				Command.execute('equipUpgrade',[equip.id]);
		};
		for(var i = equip.boost.length; equip.upgradable && i < equip.maxBoostAmount; i++){
			var btn = $('<button>')
				.addClass('myButton');
			
			if(!notOwning)
				btn.html('Unlock hidden boost')
				.css({fontSize:'0.8em'})
				.attr('title','Unlock a new boost. Cost: ' + itemNeeded + '.')
				.mousedown(helper);
			else 
				btn.html('Locked Boost')
			
			unlockDiv.append(btn);
			unlockDiv.append('<br>');
		}
		boostDiv.append(unlockDiv);
	}
	
	//#####################
	
	if(!equipWin){
		var mouse = Input.getMouse(true);
		html.css({position:'absolute'});
			//right:CST.WIDTH - mouse.x,	//cuz equip in chat
				
		if(mouse.x < CST.WIDTH/2)	//left side
			html.css({left:mouse.x});
		else
			html.css({right:CST.WIDTH - mouse.x});
		if(mouse.y < CST.HEIGHT/2)	//left side
			html.css({top:mouse.y});
		else
			html.css({bottom:CST.HEIGHT - mouse.y});
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




