
"use strict";
(function(){ //}
var Actor, QueryDb, Input, Img, Command, Combat, AttackModel, Stat, Message;
global.onReady(function(){
	Message = rootRequire('shared','Message',true); Actor = rootRequire('shared','Actor',true); QueryDb = rootRequire('shared','QueryDb',true); Input = rootRequire('server','Input',true); Img = rootRequire('client','Img',true); Command = rootRequire('shared','Command',true); Combat = rootRequire('server','Combat',true); AttackModel = rootRequire('shared','AttackModel',true); Stat = rootRequire('shared','Stat',true);
});
var Dialog = rootRequire('client','Dialog');

var Qtutorial_HEAL_ID = "Qsystem-start-heal";
var MAX_USABLE_ABILITY = 39;	//BAD


Dialog.create('ability','Ability',Dialog.Size(800,450),Dialog.Refresh(function(html,variable,param){
	return Dialog.ability(html,variable,param);
},function(html,variable){
	return SHOW_UNSABLED + Tk.stringify(w.player.ability) + Tk.stringify(Input.getSetting().ability) + Tk.stringify(Input.getBinding()) + Tk.stringify(w.player.abilityList) + variable.param + Tk.stringify(Actor.getEquip(w.player).piece);	
},10));
//Dialog.open('ability')

var refresh = function(id,sfx){
	return function(){
		Dialog.refresh('ability',id);
		if(sfx)
			Dialog.playSfx('select');
	}
}

Dialog.ability = function(html,variable,param){
	html.css({fontSize:'1.3em'});
	
	var ability = param ? QueryDb.get('ability',param,refresh(param)) : null;
	
	variable.ability = ability;
	variable.param = param;
	
	var left = $('<div>').addClass('inline').css({marginTop:-20});
	html.append(left);
	Dialog.ability.leftSide(html,variable,ability,left);
	
	var right = $('<div>').addClass('inline').css({marginTop:-20});
	html.append(right);
	Dialog.ability.abilityList(html,variable,ability,right);
	
	if(!ability) 
		return;
	
	Dialog.ability.generalInfo(html,variable,ability,right);
	
	var bool;
	if(ability.type === CST.ABILITY.attack) bool = Dialog.ability.attack(html,variable,ability,right);
	else if(ability.type === CST.ABILITY.boost) bool = Dialog.ability.boost(html,variable,ability,right);
	else if(ability.type === CST.ABILITY.summon) bool = Dialog.ability.summon(html,variable,ability,right);
	else if(ability.type === CST.ABILITY.heal) bool = Dialog.ability.heal(html,variable,ability,right);
	else if(ability.type === CST.ABILITY.dodge) bool = Dialog.ability.dodge(html,variable,ability,right);
	//more type but not supported
	
	return bool;
}

Dialog.ability.leftSide = function(html,variable,ability,left){
	left.css({textAlign:'center',width:'auto',height:'auto',fontSize:'1.6em'});
	left.append($('<span>')
		.html('Active<br>Abilities<br>')
	);
	
	var array = [];
	var helper = function(i){
		return function(){
			Command.execute(CST.COMMAND.abilitySwap,[ability.id,i]);
			//sfx depends on success
		}
	};
	
	
	var listRecommendedSlot = ability ? getRecommendedSlot(ability) : [];
	
	var abList = Actor.getAbility(w.player);
	for(var i = 0 ; i < 5 ; i++){	//TEMP 5 instead of set.ability.length cuz no dodge
		var abilityId = abList[i];
		var ab = null;
		var icon = null;
		var buttonFullName = Input.getKeyName('ability',i,true);
		
		if(!abilityId){	//no ability assigned in slot
			icon = $('<button>')
				.addClass('myButton skinny')
				.css({fontSize:'0.3em',verticalAlign:'middle'})
				.html('Click to<br>assign');
				
		} else {
			ab = QueryDb.get('ability',abilityId,refresh(variable.param));
			if(ab){
				icon = Img.drawIcon.html(ab.icon,30);
				if(!Actor.testUseAbilityWeapon(w.player,ab))
					Dialog.drawRedX(icon[0].getContext('2d'),30);
			}
			else 
				return Dialog.close('ability');
		}
		if(ability)	//ability selected
			icon.attr('title',"Assign ability '" + ability.name + "' to key '" + buttonFullName + "'")
				.click(helper(i))
				.css({cursor:'pointer'});
		else
			icon.click(nothingSelectedClick);
		
		if(listRecommendedSlot.$contains(i)){
			icon.css({border:'3px solid #11FF11'});
		}
		
		//################
		
		var buttonTitle = null;
		var buttonHtml = null;
		if(Input.getBinding().ability === i){
			buttonTitle = '???';
			buttonHtml = '?';
		} else {
			if(ab)
				buttonTitle = 'Press ' + buttonFullName + ' to use ability \'' + ab.name + '\'';
			else
				buttonTitle = Input.getKeyName('ability',i,true) + ' (Unassigned)';
			buttonHtml = Input.getKeyName('ability',i);
		}
	
		var button = $('<span>')
			.attr('title',buttonTitle)
			.css({cursor:'text',verticalAlign:'middle'})
			.html(buttonHtml + ':')
		
		
		array.push([
			button,
			icon		
		]);
	}
	
	left.append(Tk.arrayToTable(array).css({textAlign:'center',width:'100%'}));
	left.append("<br>");
}

var nothingSelectedClick = function(){
	Message.addPopup(null,'No ability is currently selected. Select an ability by clicking its icon.');
	Dialog.playSfx('error');
}


var SHOW_UNSABLED = false;

Dialog.ability.abilityList = function(html,variable,selectedAb,right){	//Qtutorial stuff here...
	var flashHeal = w.main.questActive === CST.QTUTORIAL && !Actor.getAbility(w.player).$contains(Qtutorial_HEAL_ID);
	
	var abilityList = Actor.getAbilityList(w.player);
		
	var obj = [];
	for(var i in abilityList){
		var ability = QueryDb.get('ability',i,refresh());
		if(ability){
			if(SHOW_UNSABLED || Actor.testUseAbilityWeapon(w.player,ability))
				obj.push(ability);
		}
	}
	
	var el = $('<div>').css({marginTop:-20});	//BAD
	el.append('<h3 class="u">Select Ability:</h3>');
	
	var attackArray = [' &nbsp; '];
	var attackDiv = $('<div>');
	
	var specArray = [' &nbsp; '];
	var specDiv = $('<div>');
	
	var miscArray = [' &nbsp; '];
	var miscDiv = $('<div>');
	
	var abUsed = Actor.getAbility(w.player);
	
	for(var j = 0 ; j < obj.length; j++){
		var ability = obj[j];	
		
		var el2 = Img.drawIcon.html(ability.icon,30,'Select Ability: ' + ability.name)
			.css({cursor:'pointer'})
			.click(refresh(ability.id,true));
		if(flashHeal && ability.id === Qtutorial_HEAL_ID && (!selectedAb || selectedAb.id !== ability.id))
			Tk.flashDOM(el2,1000,true,{border:'4px solid white'},{border:'4px dotted black'});

		var currentlyUsing = false;
		for(var i = 0 ; i < abUsed.length; i++){
			if(abUsed[i] && abUsed[i] === ability.id){
				currentlyUsing = true;
				break;
			}
		}
		
		if(ability.type === CST.ABILITY.attack){
			var element = AttackModel.getElement(ability.param);
			var color = CST.element.toColor[element];
			
			var ctx = el2[0].getContext('2d');
			ctx.fillStyle = color;
			ctx.globalAlpha = 0.2;
			ctx.fillRect(0,0,30,30);	
			ctx.globalAlpha = 1;
			
			//draw X if unsuable
			if(!Actor.testUseAbilityWeapon(w.player,ability))
				Dialog.drawRedX(ctx,30);
			
			
			if(Actor.ability.isSpecialAttack(ability)){
				if(currentlyUsing)
					specArray.unshift(el2);
				else
					specArray.push(el2);
			} else {
				if(currentlyUsing)
					attackArray.unshift(el2);
				else
					attackArray.push(el2);
			}
		} else {
			if(currentlyUsing)
				miscArray.unshift(el2);
			else
				miscArray.push(el2);
		}
		
		
		var selected = selectedAb && selectedAb.id === ability.id;
		
		if(selected)
			el2.css({border:'4px dotted #000000'});
		else
			el2.css({border:'4px dotted white'});
	}
	if(attackArray.length > 10)
		attackArray.$insertAt(10,'<br>');
	if(attackArray.length > 20)
		attackArray.$insertAt(20,'<br>');
	if(specArray.length > 10)
		specArray.$insertAt(10,'<br>');
	attackDiv.append(attackArray);
	specDiv.append(specArray);
	miscDiv.append(miscArray);
	
	var array = [
		[$("<span>")
			.html(' - Main Attack: &nbsp;')
			.attr('title','Must be assigned to 1st or 2nd slots.')
		,attackDiv],
		[$("<span>")
			.html(' - Special Attack: ')
			.attr('title','Must be assigned to 3rd or 4th slots.')
		,specDiv],
		[$("<span>")
			.html(' - Heal: &nbsp;')
			.attr('title','Must be assigned to 5th slot.')
		,miscDiv],	
	];
	el.append(Tk.arrayToTable(array,null,null,null,'10px 0px').css({textAlign:'left'}));	
	right.append(el);
	right.append('<br>');
	
	
	
	//unsuable
	var topRight = $('<div>')
		.css({position:'absolute',fontSize:'0.8em',right:'10px',top:'0px'})
		.append(
			$('<div>')
			.addClass('checkbox')
			.append($('<label>')
				.append($('<input>')
					.attr('title','Show abilities that requires a weapon different than your current one.')
					.attr('type','checkbox')
					.change(function(){
						SHOW_UNSABLED = $(this)[0].checked;
					})
					.prop('checked', SHOW_UNSABLED)
					,' Show All'
				)
			)
		);
	html.append(topRight);
	
	
	//unlocked
	var abCount = Actor.getAbilityList(w.player).$length();
	var unlockedDiv = $('<div>')
		.css({position:'absolute',right:10,fontSize:'0.7em'})
		.append($('<fakea>')
			.html(abCount + '/' + MAX_USABLE_ABILITY + ' Abilities Unlocked')
			.attr('title','Unlock new abilities by completing achievements.')
			.click(function(){
				Dialog.open('achievement');
			})
		);
	if(w.main.questActive !== CST.QTUTORIAL)
		el.append(unlockedDiv);
}
	
Dialog.ability.generalInfo = function(html,variable,ab,right){
	var div = $('<div>');
	var icon = Img.drawIcon.html(ab.icon,64,ab.name)
		.addClass('inline')
		.css({padding:'4px 4px'})
		
	var generalInfo = $('<span>')
		.addClass('inline')
		.css({verticalAlign:'top',padding:'4px 0px'})
		.append('<u>' + ab.name + '</u><br>')
		.append(' - Time/Cast: ' + (ab.periodOwn/25).r(2) + ' Sec')
		.append('<br>');
	var cost = ' - Cost: ';
	if(ab.costMana && !ab.costHp) cost += ab.costMana.r(1) + ' Mana'; 
	else if(!ab.costMana && ab.costHp) cost += ab.costHp.r(1) + ' Life'; 
	else if(ab.costMana && ab.costHp) cost += ab.costMana.r(1) + ' Mana, ' + ab.costHp.r(1) + ' Life'; 
	else cost += ' None.'
	
	generalInfo.append(cost);
	
	if(ab.weaponReq.length)
		generalInfo.append($('<span>')
			.html('<br>Requires a <b>' + Tk.joinOrAnd(ab.weaponReq,'or') + '</b>.')
			.css({fontSize:'0.8em'})
		);
	div.append(icon).append(generalInfo);
	right.append(div);
}

Dialog.ability.attack = function(html,variable,ab,right){ 
	var weapon = QueryDb.get('equip',Actor.getWeapon(w.player),refresh());
	if(!weapon) return false;
	
	var preatk = Tk.deepClone(ab.param);
	var atk = Combat.applyAttackMod(w.player,Tk.deepClone(preatk));
	
	var element = AttackModel.getElement(preatk);
	if(!element) return ERROR(4,'ability with no element');
	
	var tab = '&nbsp;';
	
	var array = [];
	array.push([
		'Ability: ',
		Img.drawIcon.html(Img.getIcon('element',element),30,CST.element.toCaps[element]),
		$('<span>')
			.html(tab + preatk.dmg.main.r(0))
			.attr('title','Ability Base Damage'),
		''
	]);
	//#######
	var elementW = [];	for(var i in weapon.dmg.ratio) if(weapon.dmg.ratio[i] === 1.5) elementW.push(i);
	if(weapon.dmg.ratio[element] === 1.5){
		array.push([
			'Weapon: ',
			Img.drawIcon.html(Img.getIcon('element',element),30,CST.element.toCaps[element]),
			$('<span>')
				.html(tab + 'x' + weapon.dmg.main.r(1))
				.attr('title','Weapon Base Damage'),
			$('<span>')
				.html(tab + ' x1.5')
				.attr('title','x1.5 Dmg Bonus because Weapon Type matches Ability Type (both ' + CST.element.toCaps[element] + ')'),
		]);	
	} else {
		array.push([
			'Weapon: ',
			Img.drawIcon.html(Img.getIcon('element',element),30,CST.element.toCaps[element],0.3),
			$('<span>')
				.html(tab + 'x' + weapon.dmg.main.r(1))
				.attr('title','Weapon Base Damage'),
			$('<span>')
				.html(tab + ' x1')
				.attr('title','No Bonus because Weapon Type (' + CST.element.toCaps[elementW[0]] + ', ' + CST.element.toCaps[elementW[1]] + ')'
					+ ' Doesn\'t Match Ability Type (' + CST.element.toCaps[element] + ')')
		]);	
	}
	//###
	array.push([
		'Boost: ',
		Img.drawIcon.html(Img.getIcon('element',element),30,CST.element.toCaps[element]),
		$('<span>')
			.html(tab + 'x' + Actor.getMasteryValue(w.player,'dmg',element).r(3))
			.attr('title','From Reputation Grid and Equipment'),
		''
	]);	
	
	//###
	var sum = (preatk.dmg.main*weapon.dmg.main*weapon.dmg.ratio[element]*Actor.getMasteryValue(w.player,'dmg',element)).r(0);
	array.push([
		'Final: ',
		Img.drawIcon.html(Img.getIcon('element',element),30,CST.element.toCaps[element]),
		$('<span>')
			.html(tab + sum)
			.attr('title','Final Damage Dealt'),
		''
	]);	
	
	var table = Tk.arrayToTable(array);
	table.css({borderCollapse:'collapse'});
	table.find('tr:last td').css({borderTop:'1pt solid black',backgroundColor:'#EEEEEE'});
	
	right.append(table);
	
	//########################
	
	var mod = $('<div>')
		.css({fontSize:'0.8em'})
		.append('x' + atk.amount + ' Bullet at ' + atk.angleRange + '°');
		
	right.append(mod);	
	
	//Mods
	mod.append('<br><br>');
	var r = function(num,round){
		round = round === undefined ? 2 : round;
		return num.r(round);
	};
	
	if(atk.burn && atk.burn.chance > 0){
		var a = atk.burn;
		var s = r(a.chance*100,2) + '% chance to Burn for ' + r(100-Math.pow(1-a.magn,a.time)*100,0) + '% Hp over ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}
	if(atk.chill && atk.chill.chance > 0){
		var a = atk.chill;
		var s = r(a.chance*100,2) + '% chance to Chill, reducing Speed by ' + r((1-(1/a.magn))*100,0) + '% Hp for ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}
	if(atk.stun && atk.stun.chance > 0){
		var a = atk.stun;
		var s = r(a.chance*100,2) + '% chance to Stun, draining ' + r(a.magn*100,0) + '% Ability Charge for ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}
	if(atk.bleed && atk.bleed.chance > 0){
		var a = atk.bleed;
		var s = r(a.chance*100,2) + '% chance to Bleed for ' + r(a.magn*a.time,2) + ' Dmg over ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}	
	if(atk.knock && atk.knock.chance > 0){
		var a = atk.knock;
		var s = r(a.chance*100,2) + '% chance to Knockback by ' + r(a.magn*a.time,2) + ' Pixel over ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}
	if(atk.drain && atk.drain.chance > 0){
		var a = atk.drain;
		var s = r(a.chance*100,2) + '% chance to Drain ' + r(a.magn,1) + ' Mana.';
		mod.append(s + '<br>');
	}
	if(atk.leech && atk.leech.chance > 0){
		var a = atk.leech;
		var s = r(a.chance*100,2) + '% chance to Leech ' + r(a.magn,1) + ' Life.';
		mod.append(s + '<br>');
	}
	if(atk.pierce && atk.pierce.chance > 0){
		var a = atk.pierce;
		var s = r(a.chance*100,2) + '% chance to Pierce with ' + r((1-(1-a.dmgReduc))*100,0) + '% Dmg Reduction for each pierce.';
		mod.append(s + '<br>');
	}
	if(atk.curse && atk.curse.chance > 0){
		var a = atk.curse;
		var stat = Stat.get(a.boost[0].stat).name;
		var val = r(100-a.boost[0].value*100,2);
		var s = r(a.chance*100,2) + '% chance to Lower ' + stat + ' by ' + val + ' for ' + r(a.boost[0].time/25,2) + 's.';
		mod.append(s + '<br>');
	}
	if(atk.sin){
		mod.append('Move in waves.<br>');
	}
	if(atk.parabole){
		mod.append('Move in parabole.<br>');
	}
	if(atk.onMove){
		mod.append('This bullet shoots other bullets while moving.<br>');
	}
	if(atk.boomerang){
		mod.append('Boomerang.<br>');
	}
	if(atk.onHit){
		mod.append('Explode when hitting a target.<br>');
	}
	if(atk.onDamagePhase){
		mod.append('Two phases attack.<br>');
	}
	if(atk.damageIfMod){
		mod.append('Affect allies instead of enemies.<br>');
	}
	if(atk.heal){
		var s = 'Heal for '  + atk.heal.life + ' Life, ' + atk.heal.mana + ' Mana.';
		mod.append(s + '<br>');
	}
}

Dialog.ability.getDamageFinal = function(ab,refresh){
	var weapon = QueryDb.get('equip',Actor.getWeapon(w.player),refresh);
	if(!weapon) return false;
	
	
	var preatk = Tk.deepClone(ab.param);
	//var atk = Combat.applyAttackMod(w.player,Tk.deepClone(preatk));	//preatk would be better cuz constant
	
	var element = AttackModel.getElement(preatk);
	if(!element) return ERROR(4,'ability with no element');
	return (preatk.dmg.main*weapon.dmg.main*weapon.dmg.ratio[element]*Actor.getMasteryValue(w.player,'dmg',element)).r(0);
}

Dialog.ability.summon = function(html,variable,ab,right){ 
	var info = ab.param;	
	var time = info.time > 999999 ? '.' : ' lasting ' + (info.time/25).r(2) + 's.';
	var str = 'Summon a ' + info.model  + time + ' (Up to ' + info.maxChild + ' at once.)';
	right.append(str);
}

Dialog.ability.heal = function(html,variable,ab,right){ 
	var info = ab.param;
	var str = 'Regenerate ' + info.hp + ' Hp, ' + info.mana + ' Mana.';
	right.append(str);
}

Dialog.ability.dodge = function(html,variable,ab,right){
	var info = ab.param;
	var str = 'Invincibility for ' + info.time + ' frames and move ' + info.distance + ' pixels.';
	right.append(str);
}

Dialog.ability.boost = function(html,variable,ab,right){ 
	var info = ab.param;
	for(var i in info){
		var b = info[i];
		right.append($('<span>')
			.html('Boost ' + Stat.get(b.stat).name + ' by ' + b.type + b.value + ' for ' + (b.time/25).r(2))
			.attr('title',Stat.get(b.stat).name + ': ' + Stat.get(b.stat).description)		
		);	
		right.append('<br>');
	}
}


var getRecommendedSlot = function(ability){
	if(ability.type === CST.ABILITY.heal) return [4];
	if(ability.type === CST.ABILITY.attack){
		if(Actor.ability.isSpecialAttack(ability)) 
			return [2,3];
		else 
			return [0,1];
	}
	return [];
}



Dialog.drawRedX = function(ctx,size,lineWidth){
	ctx.strokeStyle = 'red';
	ctx.lineWidth = lineWidth || 4;
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(size,size);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(size,0);
	ctx.lineTo(0,size);
	ctx.stroke();
}

})(); //{
