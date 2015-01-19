(function(){ //}

Dialog('equip','Equip',Dialog.Size(1000,600),Dialog.Refresh(function(html,variable){
	
	html.append($('<span>')
		.html('Current Exp: ' + Actor.getExp(player).r(0) + '<br>')
		.attr('title','Obtained by killing monsters, harvesting resources and creating equips.')
		.css({fontSize:'2em'})
	);
	
	//############
	//
	var array = [
		[0,1,2],
		[3,4]
	];
	
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
		var equip = QueryDb.get('equip',id,function(){
			Dialog.open('equip');	//refresh if wasnt there
		});
		if(!equip) return false;
		
		var div = $('<div>').css(Dialog.equipPopup.globalDivCss);
		array[row][column] = Dialog.equipPopup.func(div,{},equip,true);		
	}	
	
	html.append(Tk.arrayToTable(array,false,false,false,'2px 2px').addClass('tableAlignTop'));
	
},function(){
	return Tk.stringify(Actor.getEquip(player).piece);
}));
//Dialog.open('equip')

//#####################
Dialog.equipPopup = {};
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
Dialog.equipPopup.func = function(html,variable,equip,equipWin){	//important part
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
			})
			.css({float:'right'});
			
		html.append(unequip);
	}
	
	
	var isWeapon = equip.piece === 'weapon';
	
	var top = $('<div>')
		.css({width:'auto',height:'auto',zIndex:-1});
	html.append(top);
	var icon = Img.drawIcon.html(equip.icon,48,equip.piece + ' ' + equip.type)
			.addClass('inline')
	var topRight = $('<div>')
		.addClass('inline')
		.css({position:'relative',margin:'0px 0px 0 0'})
		.append($('<span>')
			.css({
				color:equip.color === 'white' ? 'grey' : equip.color,
				fontSize:'1.5em',
				textDecoration:'underline',
				textAlign:'center',
			})
			.addClass('shadow')
			.html(equip.name + '<br>')
		)
		.append($('<span>')
			.html('Lv:' + equip.lvl + ' ')
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
		);
		var title = isWeapon ? 'Spend Exp to improve the Power of this equip.' : 'Spend Exp to improve the Defence of this equip.';
		topRight.append($(Img.drawIcon.html('system1.more',20,title))
			.mousedown(function(){
				Command.execute('equipMastery',[equip.id]);
			})
		);
	}
	
	if(equip.creator)
		topRight.append($('<span>')
			.html('Creator:' + equip.creator)
			.attr('title','Player who found this equip.')
		);
		
		
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
		var dmg = (Math.pow(equip.dmg.main*Combat.WEAPON_MAIN_MOD,10)*100).r(1);
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
		var def = (Math.pow(equip.def.main*Combat.ARMOR_MAIN_MOD,10)*100).r(1);
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
				.append((def*1.5).r(1) + ' ')
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
		if(boost.type === '*') value = '+' + (boost.value*100).r(2) + '%';
		
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
			Dialog.refresh('equipPopup',equip.id)
		});
		if(!itemNeeded) return false;
		var unlockDiv = $('<div>');
				
		for(var i = equip.boost.length; equip.upgradable && i < equip.maxAmount; i++){
			unlockDiv.append($('<button>')
				.addClass('myButton')
				.html('Unlock hidden boost')
				.attr('title','Use ' + itemNeeded + ' to unlock a new boost.')
				.attr('tabindex', -1)
				.mousedown(function(){
					Command.execute('equipUpgrade',[equip.id]);
				})
			);
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

//Dialog.open('equipPopup','8v_tfE')
Dialog.UI('equipPopup',Dialog.equipPopup.globalDivCss,function(html,variable,param){
	if(!param) return false;
	
	var equip = QueryDb.get('equip',param,function(){
		Dialog.open('equipPopup',param);
	});	
	if(!equip) return false;
	Dialog.equipPopup.func(html,variable,equip);
});

})();




