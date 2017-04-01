
//"use strict";
(function(){ //}
var Actor, Main, AttackModel, QueryDb, Img, Command, ItemModel, Combat, Stat, ItemList;
global.onReady(function(){
	Actor = rootRequire('shared','Actor',true); Main = rootRequire('shared','Main',true); AttackModel = rootRequire('shared','AttackModel',true); QueryDb = rootRequire('shared','QueryDb',true); Img = rootRequire('client','Img',true); Command = rootRequire('shared','Command',true); ItemModel = rootRequire('shared','ItemModel',true); Combat = rootRequire('server','Combat',true); Stat = rootRequire('shared','Stat',true); ItemList = rootRequire('shared','ItemList',true);
});
var Dialog = rootRequire('client','Dialog');

//Message.parseText.item rely on this
var helperEquipInv = function(i){
	return function(){
		Command.execute(CST.COMMAND.useEquip,[i]);	//aka wear
		//sfx depends if have lvl high enough Actor.equip.click
	}
};


var WIDTH_EQUIP = 280;
var RATIO = 1.5;
var DEFAULT_POS = {right:205,bottom:50};
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

var canCraft = function(){
	return Actor.getLevel(w.player) >= CST.CRAFT_MIN_LVL;
}

Dialog.create('equip','Equip',Dialog.Size(920,425),Dialog.Refresh(function(html,variable,param){
	var panelStyle = {
		display:'inline-block',
		padding:'10px',	
		verticalAlign:'top',
	}
	
	//left
	variable.leftPanel = $('<div>').css(panelStyle);
	variable.exp = $('<div>').css({fontSize:'1.5em'});
	variable.inventory = $('<div>').css({marginTop:'5px'});
	variable.ability = $('<div>').css({marginTop:'5px'});
	var defence = $('<div>').css({marginTop:'5px',fontSize:'1.2em'});
	
	defence.html('<span style="font-size:1.25em">Defence:</span><br>');	//1.25 cuz 1.2
	
	variable.melee = $('<span>');
	variable.range = $('<span>');
	variable.magic = $('<span>');
	variable.fire = $('<span>');
	variable.cold = $('<span>');
	variable.lightning = $('<span>');
	
	var array = [
		[
			$('<span>').append(variable.melee,Img.drawIcon.html('element-melee',18).css({marginLeft:'2px'})),
			$('<span>').append(variable.range,Img.drawIcon.html('element-range',18).css({marginLeft:'2px'})),
			$('<span>').append(variable.magic,Img.drawIcon.html('element-magic',18).css({marginLeft:'2px'})),
		],
		[
			$('<span>').append(variable.fire,Img.drawIcon.html('element-fire',18).css({marginLeft:'2px'})),
			$('<span>').append(variable.cold,Img.drawIcon.html('element-cold',18).css({marginLeft:'2px'})),
			$('<span>').append(variable.lightning,Img.drawIcon.html('element-lightning',18).css({marginLeft:'2px'})),
		]			
	];
	defence.append(Tk.arrayToTable(array,false,false,false,'15px 0px'));	
	
	var buttonStat = $('<button>')
		.html('Open Stat Window')
		.addClass('myButton skinny')
		.css({marginTop:'5px'})
		.click(function(){
			Dialog.closeBigWindow();
			Dialog.open('stat');
		});
		
	variable.leftPanel.append(variable.exp,variable.inventory,variable.ability,defence,buttonStat);
	
	//mid
	variable.midPanel = $('<div>').css(panelStyle)
		.append($('<div>')
			.html('Equipped:<br>')
			.css({marginLeft:'-5px',marginTop:'-4px',fontSize:'0.8em'})
		);
	
	variable.helm = $('<div>').css({cursor:'pointer'});
	variable.amulet = $('<div>').css({cursor:'pointer'});
	variable.weapon = $('<div>').css({cursor:'pointer'});
	variable.body = $('<div>').css({cursor:'pointer'});
	variable.ring = $('<div>').css({cursor:'pointer'});
	variable.midPanel.append(variable.helm,variable.amulet,variable.weapon,variable.body,variable.ring);
	
	//right panel
	variable.rightPanel = $('<div>').css(panelStyle);
	variable.shownEquip = $('<div>').css(Dialog.equipPopup.globalDivCss);
	variable.belowShownEquip = $('<div>').css({marginTop:'3px',fontSize:'0.8em'});
	variable.rightPanel.append(variable.shownEquip,variable.belowShownEquip);
	
	//craft panel
	variable.craftDiv = $('<div>').css(panelStyle);
		
	html.append(variable.leftPanel,variable.midPanel,variable.rightPanel,variable.craftDiv);

	return true;
},function(){
	return Tk.stringify(Actor.getEquip(w.player).piece) + Actor.getEquipExp(w.player) + Tk.stringify(w.main.invList.data);
},10,function(html,variable,param){
	html.dialog({width:canCraft() ? 900 : 700});
	if(param && param.id && variable.oldShownEquipId !== param.id){
		variable.shownEquipId = param.id;
		variable.oldShownEquipId = null;
	}
	
	//exp	
	var exp = Actor.getEquipExp(w.player);
	if(variable.oldExp !== exp){
		variable.oldExp = exp;
		variable.exp.html('Equip Exp: ' + exp.r(0));
	}
	
	//ability
	variable.ability.html('');
	var weaponId = Actor.getWeapon(w.player);
	var weapon = QueryDb.get('equip',weaponId,refresh);	//should always work
	if(weapon && weaponId !== CST.UNARMED){
		variable.ability.html('<span style="font-size:1.5em">Ability Damage:</span><br>');
		var ability = Actor.getAbility(w.player);
		
		var array = [[],[]];
		for(var row = 0 ; row < 2; row++){
			for(var col = 0 ; col < 2; col++){
				var i = row*2 + col; 
				var pack = $('<div>');
				array[row][col] = pack;
				
				if(!ability[i]){
					pack.append(Img.drawIcon.html(null,24),' ---');
					continue;
				}
				
				var ab = QueryDb.get('ability',ability[i],refresh);	//should always work
				if(!ab || ab.type !== CST.ABILITY.attack){
					pack.append(Img.drawIcon.html(null,24),' ---');
					continue;
				}
				var img = Img.drawIcon.html(ab.icon,24);
				var abElement = AttackModel.getElement(ab.param);
				img.attr({title:CST.element.toCaps[abElement] + ' Attack'});
				//var abColor = CST.element.toColor[abElement];
				//img.css({border:'4px solid ' + abColor});
				
				
				
				var hasElement = getWeaponElement(weapon).$contains(abElement);
				var dmg = Dialog.ability.getDamageFinal(ab,refresh);
				if(ab.param.amount >= 2)
					dmg += ' x' + Math.round(ab.param.amount);
				
				var text = $('<span>').html(' ' + dmg).addClass('shadow');
				if(hasElement){
					text.attr({title:'+50% damage because ability element matches weapon elements.'});
					text.css({color:'green',fontSize:'1.2em'});
				} else {
					text.attr({title:'No damage bonus because ability element doesn\'t match weapon elements.'});
					text.css({color:'red',fontSize:'1em'});
				}
				pack.append(img,text);
			}
		}
		//null,null,null,'10px'
		variable.ability.append(Tk.arrayToTable(array).css({marginLeft:'10px',width:'100%'}));
	}
	
	//inventory
	var flashBow = w.main.questActive === CST.QTUTORIAL && !Actor.getEquip(w.player).piece.weapon;
	
	var json = Tk.stringify(w.main.invList.data) + flashBow;
	var allGood = true;
	var invDiff = variable.oldInventory !== json;
	if(invDiff){
		variable.inventory.html('<span style="font-size:1.4em">Unused Equipment:</span><br>');
		var iconDiv = $('<div>').css({marginLeft:'10px'});
		variable.inventory.append(iconDiv);
		
		
		var list = {weapon:[],body:[],helm:[],amulet:[],ring:[]};
		for(var i in w.main.invList.data){	//BADD
			if(!Dialog.equipPopup.isItemEquip(i))
				continue;
			var equip = QueryDb.get('equip',i,refresh);
			if(!equip){
				allGood = false;
				continue;
			}
			list[equip.piece].push(equip);
		}
		var BIG_SPACE = ' &nbsp;';
		var count = 0;
		var addEquipToDiv = function(equip){
			var icon = Img.drawIcon.html(equip.icon,32-4*2,'Click to equip this ' + equip.piece + '.')
				.css({cursor:'pointer'})
				.click(helperEquipInv(equip.id))
				.mouseover(changeShownEquip(equip,variable))			
				.css({border:'2px solid white'});
			
			if(equip.id === 'Qsystem-start-bow' && flashBow)
				Tk.flashDOM(icon,1000,true,{border:'2px solid white'},{border:'2px dotted black'});
			
			iconDiv.append(icon);
			if(++count % 7 === 0)
				iconDiv.append('<br>');
		}
		//weapon
		for(var i = 0 ; i < list.weapon.length; i++){
			addEquipToDiv(list.weapon[i]);
		}
		if(list.weapon.length !== 0)
			iconDiv.append(BIG_SPACE);
		
		//body
		//count = 0;
		for(var i = 0 ; i < list.body.length; i++){
			addEquipToDiv(list.body[i]);
		}
		if(list.body.length !== 0)
			iconDiv.append(BIG_SPACE);
		//helm
		for(var i = 0 ; i < list.helm.length; i++){
			addEquipToDiv(list.helm[i]);
		}
		if(list.helm.length + list.body.length !== 0)
			iconDiv.append(BIG_SPACE);
			
		//ring
		//count = 0;
		for(var i = 0 ; i < list.ring.length; i++){
			addEquipToDiv(list.ring[i]);
		}
		if(list.ring.length !== 0)
			iconDiv.append(BIG_SPACE);
		//amulet
		for(var i = 0 ; i < list.amulet.length; i++){
			addEquipToDiv(list.amulet[i]);
		}

		
		
		
		if(allGood)
			variable.oldInventory = json;
	}
	
	//defence
	var rawEquipDef = Actor.getEquip(w.player).def;
	for(var i in rawEquipDef){
		var el = 'dmg-' + i;
		var val = rawEquipDef[i] * Actor.boost.getBase(w.player,el);
		variable[i].html(Tk.round(val,2,true))
	}
	
	//equip icon
	var list = Actor.getEquip(w.player).piece;
	
	var unequip = function(piece){
		return function(){
			Command.execute(CST.COMMAND.removeEquip,[piece]);
			Dialog.playSfx('select');
		}
	}
	
	var emptyIcon = {
		weapon:'weapon-sword',
		body:'body-metal',
		helm:'helm-metal',
		ring:'ring-ruby',
		amulet:'amulet-ruby',	
	}
	for(var piece in list){
		var id = Actor.getEquip(w.player).piece[piece];
		if(!id){
			variable[piece].html(
				Img.drawIcon.html(emptyIcon[piece],48,'No ' + piece + ' equipped.',0.15)
			)
			continue;
		}
		var equip = QueryDb.get('equip',id,refresh);
		if(!equip)
			continue;
			
		variable[piece].html('').css({padding:'0px 0px'});
		var img = Img.drawIcon.html(equip.icon,48,'Unequip ' + equip.name)
				.mouseover(changeShownEquip(equip,variable))
				.css({border:'2px solid white'})
				.click(unequip(equip.piece));
				
		variable[piece].html(img);
	}
	
	//shownEquip: check changeShownEquip
	
	if(variable.oldShownEquipId !== variable.shownEquipId){
		if(variable.shownEquipId){
			var equip = QueryDb.get('equip',variable.shownEquipId,refresh);
			if(equip){
				changeShownEquip(equip,variable)();
				variable.oldShownEquipId = variable.shownEquipId;
			}
		}
	}
	if(invDiff && variable.shownEquipId)
		fillCraftDiv(variable.craftDiv,QueryDb.get('equip',variable.shownEquipId,refresh));
	
}));

var SELECTED_ICON = null;
//var OLD_SHOWN = '';

var changeShownEquip = function(equip,variable,sfx){
	return function(){
		if(SELECTED_ICON)
			SELECTED_ICON.css({border:'2px solid white'});
		
		variable.shownEquip.html('');
		if(!equip){
			SELECTED_ICON = null;
			return;
		}
		//if(OLD_SHOWN !== equip)
			Dialog.playSfx('mouseover');
		//OLD_SHOWN = equip;
		Dialog.equipPopup.func(variable.shownEquip,{},equip,'equip');
		variable.belowShownEquip.html(canCraft() ? '' : 'Advanced Crafting unlocked at Level ' + CST.CRAFT_MIN_LVL + '.');
		fillCraftDiv(variable.craftDiv,equip);
		if($(this)[0])	//case triggered not via mouseover
			SELECTED_ICON = $(this).css({border:'2px solid red'});
	}
}

//Dialog.open('equip')
var equipRerollStat = function(id,slot){
	return function(){
		Command.execute(CST.COMMAND.equipRerollStat,[id,slot,'equip']);
	}	
}
	
var equipRerollPower = function(id){
	return function(){
		Command.execute(CST.COMMAND.equipRerollPower,[id,'equip']);
	}
}	
	
	
var fillCraftDiv = function(craftDiv,equip){
	craftDiv.html('');
	if(!canCraft() || !equip || !equip.upgradable)
		return;
	
	craftDiv.append('<h4>Crafting</h4>');
	var innerDiv = $('<div>').css({paddingLeft:'10px'});
	craftDiv.append(innerDiv);
	
	var itemNeeded = ItemList.stringify(equip.rerollStatCost,refresh);
	if(!itemNeeded) 
		return false;

	
	//reroll power
	var canUpgrade = Main.haveItem(w.main,equip.rerollStatCost);
	var btn = $('<button>')
		.addClass('myButton skinny')
		.html('Reroll Power')
		.click(equipRerollPower(equip.id))
		.attr('title','Cost: ' + itemNeeded)
		.css({
			background: canUpgrade ? '#EEFFEE' : '#FFEEEE',
			width:'100%',
		});
	innerDiv.append(btn,'<br><br>');
	
	
	//reroll stat
	var canUpgrade = Main.haveItem(w.main,equip.rerollStatCost);
	for(var i = 0 ; i < equip.boost.length ; i++){
		var btn = $('<button>')
			.addClass('myButton skinny')
			.html('Reroll ' + Stat.get(equip.boost[i].stat).name)
			.click(equipRerollStat(equip.id,i))
			.attr('title','Cost: ' + itemNeeded)
			.css({
				background: canUpgrade ? '#EEFFEE' : '#FFEEEE',
				width:'100%',
			});
			
		innerDiv.append(btn,'<br>');
	}
}


//#####################
Dialog.equipPopup = {};
Dialog.equipPopup.isItemEquip = function(id,cb){
	var item = QueryDb.get('item',id,cb);
	if(!item) return false;
	return item.type === 'equip';
}

Dialog.equipPopup.globalDivCss = {	
	width:WIDTH_EQUIP,
	border:'4px solid black',
	padding:'0px 0px',
	zIndex:Dialog.ZINDEX.HIGH,
	fontSize:'1.3em',
	color:'black',
	backgroundColor:'white',
	height:'auto',
	minHeight:'250px',
	textAlign:'center',
	whiteSpace:'nowrap',
}
Dialog.equipPopup.func = function(html,variable,equip,containerDialog,owning){	//important part,	//container= equipPopup, equip
	owning = owning === undefined ? true : owning;
	var isWeapon = equip.piece === 'weapon';
	
	var top = $('<div>')
		.css({width:'auto',height:'auto',pointerEvents:'none'});
	html.append(top);
	var icon = Img.drawIcon.html(equip.icon,48)
			.addClass('inline');
	
	if(owning){
		icon.css({pointerEvents:'all'});
		icon.attr('title','Click to display in chat. Also done by Shift-Right click in inventory.');
		icon.mousedown(function(){
			ItemModel.displayInChat(equip.id);
		});
	}	
			
			
	var topRight = $('<div>')
		.addClass('inline')
		.css({position:'relative',margin:'0px 0px 0 0'})
		.append($('<span>')
			.css({
				color:equip.color === 'white' ? 'grey' : equip.color,
				fontSize:equip.name.length > 12 ? '0.9em' : '1.2em',
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
	
	var inTut = !Main.quest.haveCompletedTutorial(w.main) && containerDialog === 'equipPopup';	//BAD
	if(equip.upgradable && owning && !inTut){
		var canUpgrade = Actor.getEquipExp(w.player) < equip.tierCost;
		
		var btn = $('<button>')
			.css({fontSize:'0.8em',paddingLeft:'4px',pointerEvents:'all'})
			.html('Upgrade')
			.attr('title','Upgrade Cost: ' + equip.tierCost + ' Equip Exp. Increase equip ' + (isWeapon ? 'damage' : 'defence') + ' by 5%.')
			.addClass('myButton skinny')
			.css({background: canUpgrade ? '#FFEEEE' : '#EEFFEE'})
			.mousedown(function(){
				Command.execute(CST.COMMAND.equipTier,[equip.id,containerDialog]);
			});
		

		$(btn).tooltip(Tk.getTooltipOptions({
			position: { my: "center center", at: "center center-40px" }
		}));
		topRight.append(btn);
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
			ratio.append(Img.drawIcon.html(Img.getIcon('element',elements[i]),24,'x1.5 Damage if using ' + CST.element.toCaps[elements[i]] + ' ability.'));	
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
				.append((def*1.5).r(0))
				.append(Img.drawIcon.html(Img.getIcon('element',elementMain),24))
				.attr('title','Defence against ' + CST.element.toCaps[elementMain] + '.')
			);
		if(elementSub[0])
			ratio.append($('<span>')
				.append(' ' + def)
				.append(Img.drawIcon.html(Img.getIcon('element',elementSub[0]),24))
				.attr('title','Defence against ' + CST.element.toCaps[elementSub[0]] + '.')
			);
		
		if(elementSub[1])
			ratio.append($('<span>')
				.append(' ' + def)
				.append(Img.drawIcon.html(Img.getIcon('element',elementSub[1]),24))
				.attr('title','Defence against ' + CST.element.toCaps[elementSub[1]] + '.')
			);
	}
	//##########################
	var boostDiv = $('<div>')
		.css({textAlign:'center',marginTop:'5px',width:'100%',height:'100%'});//,border:'2px solid black'
	html.append(boostDiv);
	var array = [];
	for(var i  = 0 ; i < equip.boost.length; i++){
		var ret = Stat.getNiceBoostText(equip.boost[i],true);
		array.push([
			ret.stat,ret.value
		]);
	}
	
	var table = Tk.arrayToTable(array,false,false,false,'10px 0')
		.css({margin:'0 auto'})
	boostDiv.append(table)
	
	//#########
	if(equip.upgradable && !inTut){
		var itemNeeded = ItemList.stringify(equip.unlockBoostCost,function(){
			Dialog.refresh(containerDialog,Dialog.EquipPopup(equip.id));
		});
		if(!itemNeeded) 
			return false;
		var unlockDiv = $('<div>');
				
		var helper = function(){
			Command.execute(CST.COMMAND.equipUnlockBoost,[equip.id,containerDialog]);
		};
		for(var i = equip.boost.length; equip.upgradable && i < equip.maxBoostAmount; i++){
			var btn = $('<button>')
				.addClass('myButton');
			
			if(owning){
				var canUpgrade = Main.haveItem(w.main,equip.unlockBoostCost);
				btn.html('Unlock boost')
				.css({fontSize:'0.8em',background: canUpgrade ? '#EEFFEE' : '#FFEEEE'})
				.attr('title','Unlock a new boost. Cost: ' + itemNeeded + '.')
				.mousedown(helper);
			} else
				btn.html('Locked Boost');				
		
				
			
			unlockDiv.append(btn);
			unlockDiv.append('<br>');
		}
		boostDiv.append(unlockDiv);
	}
	
	if(owning && !inTut && containerDialog === 'equipPopup'){
		var btn = $('<button>')
			.addClass('myButton skinny')
			.css({position:'absolute',left:'5px',bottom:'5px'})
			.mousedown(function(){
				Command.execute(CST.COMMAND.useEquip,[equip.id]);			
			});
			
		btn.html('Use')	//Salvage
			.attr('title','Click to equip.')
			
		html.append(btn);
	}
	
	if(equip.salvagable && owning && !inTut && containerDialog === 'equipPopup'){
		var btn = $('<button>')
			.addClass('myButton skinny')
			.css({position:'absolute',right:'5px',bottom:'5px'})
			.mousedown(function(){
				var bypass = equip.boost.length <= 3 && equip.maxBoostAmount <= 4;
				Command.execute(CST.COMMAND.equipSalvage,[equip.id,bypass]);			
			});
		if(Dialog.isActive('shop'))
			btn.html('Sell')
			.attr('title','Sell for crafting materials.')
		else
			btn.html('Sell')	//Salvage
			.attr('title','Convert into crafting materials.')
			
		html.append(btn);
	
	
	}
	
	
	
	//#####################
	
	
	return html;
};

//Dialog.open('equipPopup',Dialog.EquipPopup('8v_tfE'))
Dialog.UI('equipPopup',null,Dialog.equipPopup.globalDivCss,Dialog.Refresh(function(html,variable,param){	//{owning,id}
	if(!param) return false;
	var equip = QueryDb.get('equip',param.id,function(){
		Dialog.open('equipPopup',param);
	});	
	if(!equip)
		return false;
	Dialog.equipPopup.func(html,variable,equip,'equipPopup',param.owning);
	html.css({position:'absolute'});
	
	html.css(DEFAULT_POS);
}));


Dialog.EquipPopup = function(id,owning,staticPosition){
	return {
		owning:owning === undefined ? true : owning,
		id:id||'',
	}
}


})();




