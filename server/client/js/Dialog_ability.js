//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Actor = require4('Actor'), QueryDb = require4('QueryDb'), Input = require4('Input'), Img = require4('Img'), Command = require4('Command'), Combat = require4('Combat'), AttackModel = require4('AttackModel'), Stat = require4('Stat');
var Dialog = require3('Dialog');

Dialog.create('ability','Ability',Dialog.Size(800,700),Dialog.Refresh(function(html,variable,param){
	Dialog.ability(html,variable,param);
},function(html,variable,param){
	return Tk.stringify(player.ability) + Tk.stringify(player.abilityList) + variable.param + variable.typeShowed + Tk.stringify(Actor.getEquip(player).piece);	
},10),{
	ability:null,	//object
	typeShowed:'all',
	param:null,
});
//Dialog.open('ability')

Dialog.ability = function(html,variable,param){
	if(!param) param = Object.keys(Actor.getAbilityList(player))[0];
	if(!param) return Dialog.close('ability');
	
	html.css({font:'1.3em Kelly Slab'});
	
	var ability = QueryDb.get('ability',param,function(){
		Dialog.refresh('ability',param);
	});
	if(!ability) return Dialog.close('ability');
	
	variable.ability = ability;
	variable.param = param;
	
	var left = $('<div>').addClass('inline');
	html.append(left);
	Dialog.ability.leftSide(html,variable,ability,left);
	
	var right = $('<div>').addClass('inline');
	html.append(right);
	Dialog.ability.abilityList(html,variable,ability,right);
	Dialog.ability.generalInfo(html,variable,ability,right);
	
	var bool;
	if(ability.funcStr === 'attack') bool = Dialog.ability.attack(html,variable,ability,right);
	
	if(ability.funcStr === 'boost') bool = Dialog.ability.boost(html,variable,ability,right);
	if(ability.funcStr === 'summon') bool = Dialog.ability.summon(html,variable,ability,right);
	if(ability.funcStr === 'heal') bool = Dialog.ability.heal(html,variable,ability,right);
	if(ability.funcStr === 'dodge') bool = Dialog.ability.dodge(html,variable,ability,right);
	
	return bool;
}

Dialog.ability.leftSide = function(html,variable,ability,left){
	left.css({textAlign:'center',width:'auto',height:'auto',fontSize:'1.6em'});
	left.append($('<span>')
		.html('Assign to<br>Key Bind<br>')
	);

	var array = [];
	var set = Input.getSetting();
	
	var helper = function(i){
		return function(){
			Command.execute('win,ability,swap',[ability.id,i]);
		}
	};
	
	for(var i = 0 ; i < set.ability.length ; i++){
		var buttonTitle = Input.getKeyName('ability',i,true);
		var button = $('<span>')
			.attr('title',buttonTitle)
			.html(Input.getKeyName('ability',i) + ':');
			
		//####
		var abilityId = Actor.getAbility(player)[i];
		var icon;
		if(!abilityId)
			icon = Img.drawIcon.html(null,30);
		else {
			var ab = QueryDb.get('ability',abilityId,function(){
				Dialog.refresh('ability',variable.param);
			});
			if(ab)
				icon = Img.drawIcon.html(ab.icon,30);
			else Dialog.close('ability');
		}
		icon.attr('title',"Assign " + ability.name + " to " + buttonTitle)
			.click(helper(i));
		
		array.push([
			button,
			icon		
		]);
	}
	
	left.append(Tk.arrayToTable(array).css({textAlign:'center',width:'100%'}));
	left.append("<br>");
	var el2 = $('<button>')
		.addClass("myButton skinny")
		.attr('title','Open Key Binding Window')
		.html('Change<br>Bindings')
		.css({border:'2px solid black',font:'0.8em Kelly Slab'})
		.click(function(){
			Dialog.open('binding');
		});
	left.append(el2);
}

var helper = function(id){
	return function(){
		Dialog.refresh('ability',id);
	}
}

Dialog.ability.abilityList = function(html,variable,selectedAb,right){
	var abilityList = Actor.getAbilityList(player);
	var obj = [];
	for(var i in abilityList){
		var ability = QueryDb.get('ability',i,function(){
			Dialog.refresh('ability');
		});
		if(ability){
			obj.push(ability);
		}
	}
	
	var el = $('<div>');
	var attackList = $('<p>').html(' - Attack: ');
	var miscList = $('<p>').html(' - Misc: &nbsp;&nbsp;');
	el.append('<h3 class="u">Select Ability</h3>',attackList,miscList);
		
	for(var j = 0 ; j < obj.length; j++){
		var ability = obj[j];	
		
		var el2 = Img.drawIcon.html(ability.icon,30,'Select: ' + ability.name)
			.click(helper(ability.id));
		
		var selected = selectedAb.id === ability.id;
		
		if(ability.type === 'attack'){
			var element = AttackModel.getElement(ability.param);
			var color = CST.element.toColor[element];
			
			//el2.css({border:'4px solid ' + color});
			
			var ctx = el2[0].getContext('2d');
			ctx.fillStyle = color;
			ctx.globalAlpha = 0.2;
			ctx.fillRect(0,0,30,30);	
			
			if(selected)
				el2.css({border:'4px solid ' + color});
			
			attackList.append(el2);
		}
		else {
			if(selected)
				el2.css({border:'4px solid black'});
			miscList.append(el2);	
		}
		//if(j === 16) el.append('<br>');
	}
	right.append(el);
}
	
Dialog.ability.generalInfo = function(html,variable,ab,right){
	var div = $('<div>');
	var icon = Img.drawIcon.html(ab.icon,64,ab.name)
		.addClass('inline')
		.css({padding:'4px 4px'})
		
	var generalInfo = $('<span>')
		.addClass('inline')
		.css({verticalAlign:'top',padding:'4px 0px'})
		.append(ab.name + '<br>')
		.append(' - Time/Cast: ' + (ab.periodOwn/25).r(2) + ' Sec')
		.append('<br>');
	var cost = ' - Cost: ';
	if(ab.costMana && !ab.costHp) cost += ab.costMana.r(1) + ' Mana'; 
	else if(!ab.costMana && ab.costHp) cost += ab.costHp.r(1) + ' Life'; 
	else if(ab.costMana && ab.costHp) cost += ab.costMana.r(1) + ' Mana, ' + ab.costHp.r(1) + ' Life'; 
	else cost += ' None.'
	
	generalInfo.append(cost);
	
	div.append(icon).append(generalInfo);
	right.append(div);
}

Dialog.ability.attack = function(html,variable,ab,right){ 
	var weapon = QueryDb.get('equip',Actor.getWeapon(player),function(){
		Dialog.refresh('ability');
	});
	if(!weapon) return false;
	
	
	var preatk = Tk.deepClone(ab.param);
	var atk = Combat.applyAttackMod(player,Tk.deepClone(preatk));
	
	var element = AttackModel.getElement(preatk);
	if(!element) return ERROR(4,'ability with no element');
	
	var array = [];
	array.push([
		'Ability: ',
		Img.drawIcon.html('element.' + element,30,element.capitalize()),
		$('<span>')
			.html(preatk.dmg.main.r(0))
			.attr('title','Ability Base Damage'),
		''
	]);
	//#######
	var elementW = [];	for(var i in weapon.dmg.ratio) if(weapon.dmg.ratio[i] === 1.5) elementW.push(i);
	if(weapon.dmg.ratio[element] === 1.5){
		array.push([
			'Weapon: ',
			Img.drawIcon.html('element.' + element,30,element.capitalize()),
			$('<span>')
				.html('x' + weapon.dmg.main.r(1))
				.attr('title','Weapon Base Damage'),
			$('<span>')
				.html(' &nbsp;x1.5')
				.attr('title','x1.5 Dmg Bonus because Weapon Type matches Ability Type (both ' + element.capitalize() + ')'),
		]);	
	} else {
		array.push([
			'Weapon: ',
			Img.drawIcon.html('element.' + element,30,element.capitalize(),0.3),
			$('<span>')
				.html('x' + weapon.dmg.main.r(1))
				.attr('title','Weapon Base Damage'),
			$('<span>')
				.html(' &nbsp;x1')
				.attr('title','No Bonus because Weapon Type (' + elementW[0].capitalize() + ', ' + elementW[1].capitalize() + ')'
					+ ' Doesn\'t Match Ability Type (' + element.capitalize() + ')')
		]);	
	}
	//###
	Actor.mastery.update(player);
	array.push([
		'Boost: ',
		Img.drawIcon.html('element.' + element,30,element.capitalize()),
		$('<span>')
			.html(' x' + player.mastery.dmg[element].sum.r(3))
			.attr('title','From Reputation Grid and Equipment'),
		''
	]);	
	
	//###
	var sum = (preatk.dmg.main*weapon.dmg.main*weapon.dmg.ratio[element]*player.mastery.dmg[element].sum).r(0);
	array.push([
		'Final: ',
		Img.drawIcon.html('element.' + element,30,element.capitalize()),
		$('<span>')
			.html(' ' + sum)
			.attr('title','Final Damage Dealt'),
		''
	]);	
	
	var table = Tk.arrayToTable(array,false,false,false,'10px 0');
	table.css({borderCollapse:'collapse'});
	table.find('tr:last td').css({borderTop:'1pt solid black',backgroundColor:'#EEEEEE'});
	right.append(table);
	
	//########################
	
	var mod = $('<div>')
		.append('x' + atk.amount + ' Bullet at ' + atk.angleRange + '°');
		
	right.append(mod);	
	
	//Mods
	mod.append('<h3>Special Effects on Hit:</h3>');
	var r = function(num,round){
		round = round === undefined ? 2 : round;
		return num.r(round);
	};
	
	if(atk.burn.chance > 0){
		var a = atk.burn;
		var s = r(a.chance*100,2) + '% chance to Burn for ' + r(100-Math.pow(1-a.magn,a.time)*100,0) + '% Hp over ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}
	if(atk.chill.chance > 0){
		var a = atk.chill;
		var s = r(a.chance*100,2) + '% chance to Chill, reducing Speed by ' + r((1-(1/a.magn))*100,0) + '% Hp for ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}
	if(atk.stun.chance > 0){
		var a = atk.stun;
		var s = r(a.chance*100,2) + '% chance to Stun, draining ' + r(a.magn*100,0) + '% Ability Charge for ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}
	if(atk.bleed.chance > 0){
		var a = atk.bleed;
		var s = r(a.chance*100,2) + '% chance to Bleed for ' + r(a.magn*a.time,2) + ' Dmg over ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}	
	if(atk.knock.chance > 0){
		var a = atk.knock;
		var s = r(a.chance*100,2) + '% chance to Knockback by ' + r(a.magn*a.time,2) + ' Pixel over ' + r(a.time/25,2) + 's.';
		mod.append(s + '<br>');
	}
	if(atk.drain.chance > 0){
		var a = atk.drain;
		var s = r(a.chance*100,2) + '% chance to Drain ' + r(a.magn,1) + ' Mana.';
		mod.append(s + '<br>');
	}
	if(atk.leech.chance > 0){
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

})(); //{
