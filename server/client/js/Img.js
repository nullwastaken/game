//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}

var Img = exports.Img = {};

Img.load = function(src,cb){
	var tmp = new Image();
	tmp.src = '/' + src;
	if(cb)
		tmp.onload = function(){
			cb(tmp);
		}
	return tmp;
}

//#####################

Img.icon = [];

Img.getMinimapIconSize = function(name){
	if(name === 'minimapIcon.quest') return 24;
	if(name === 'minimapIcon.questMarker') return 24;
	if(name.$contains('color')) return 6;
	return 16;
}

var IconModel = function(id,list,size){
	size = size || 48;
	if(DB[id]) return ERROR(3,'id already taken',id);
	var tmp = {
		id:id,
		list:list,
		size:size,
		img:Img.load("img/ui/icon/" + id + ".png"),
	};
	DB[id] = tmp;
}

var DB = IconModel.DB = {};



//regular icon
IconModel('system',["square","close","arrow","heart","gold","question","flag"]);
IconModel('color',["red","yellow","cyan","green","purple","orange","magenta"]);
IconModel('system1',["left","right","down","up","more","less"]);
IconModel('tab',["equip","inventory","quest","skill","friend","pref","ability","reputation"]);
IconModel('element',["melee","range","magic","fire","cold","lightning","melee2","range2","magic2","fire2","cold2","lightning2"]);
IconModel('status',["bleed","knock","drain","burn","chill","stun"]);
IconModel('resource',["hp","mana","fury","dodge","heal"]);
IconModel('skill',["melee","range","magic","metalwork","woodwork","leatherwork","mining","woodcutting","trapping"]);
IconModel('friend',["friend","mute","add","remove"]);
IconModel('minimapIcon',["enemy","quest","good","friend","tree","trap","rock","waypoint","loot","toggle","door","questMarker"]);
IconModel('offensive',["pierce","bullet","strike","leech","atkSpd"]);
IconModel('defensive',["speed","pickup","life","magicFind"]);
IconModel('attackMelee',["slash","pierce","scar","trio","triple","punch","box","slice","bleed","fierce","alert","ground","chop","cube"]);
IconModel('attackRange',["trio","steady","rocket","bleed","rain","thunder","head"]);
IconModel('attackMagic',["thunder","ring","breathe","fog","onMove","crystal","tsunami","fireball","meteor","fire","ball","lightning","static","spark","storm"]);
IconModel('blessing',["angel","fly","beat","spike","sumo","muscle","strong","cycle","reflect","multi","wave","block"]);
IconModel('curse',["back","nuclear","ghost","fang","death","haunt","bleed","broken","sand","skull","stumble"]);
IconModel('dodge',["start","ninja","stand","footprint","wing","stop"]);
IconModel('heal',["plus","pill","open","pills","fixed","sink","pot","tower","mix","tree","vial","cake","dropplet","flower"]);
IconModel('summon',["wolf","moon","cat","bird","fang","head","peck","fish","dino","ram","gull","dragon","duo","rex","lion"]);

IconModel('misc',["teleport","circle","hourglass","timebomb","forward","disync","clock","invisible"]);
IconModel('weapon',["mace","spear","sword","bow","boomerang","crossbow","wand","staff","orb"]);
IconModel('amulet',["ruby","sapphire","topaz"]);
IconModel('helm',["metal","wood","bone"]);
IconModel('ring',["ruby","sapphire","topaz"]);
IconModel('body',["metal","wood","bone"]);
IconModel('plan',["equip","ability"]);
IconModel('shard',["white","blue","yellow","gold"]);
IconModel('orb',["upgrade","boost","removal","water","ruby","sapphire","topaz"]);
IconModel('metal',["metal"]);
IconModel('chain',["chain"]);
IconModel('wood',["wood"]);
IconModel('leaf',["leaf"]);
IconModel('bone',["bone"]);
IconModel('hide',["hide"]);

//Face
IconModel('warrior-male',['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],96);
IconModel('warrior-female',['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],96);
IconModel('villager-male',['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],96);
IconModel('villager-female',['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],96);
IconModel('villager-child',['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],96);
IconModel('fairy',['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],96);
IconModel('bad-monster',['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],96);
IconModel('bad-human',['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],96);



Img.drawIcon = function(ctx,info,size,x,y){	
	size = size || 32;
	var ret = ctx;

	info = info.split('.');
	var iconModel = DB[info[0]];
	if(!iconModel) return ERROR(4,'no icon',info);
	var pos = iconModel.list.indexOf(info[1]);
	if(pos === -1) return ERROR(4,'no icon',info);
	
	var slotX = pos * iconModel.size;
	
	var draw = function(){
		ctx.drawImage(
			iconModel.img,
			slotX,0,
			iconModel.size,iconModel.size,
			x,y,
			size,size
		);
	}
	if(iconModel.img.complete)
		draw();
	else
		$(iconModel.img).load(draw);
		
	return ret;
}

Img.drawIcon.html = function(icon,size,title,alpha){
	size = size || 24;
	var canvas = $('<canvas>')
		.attr({
			width:size,
			height:size,
		})
		.css({
			zIndex:Img.drawItem.zIndex,
			border: icon ? '' : '2px solid black',
		});
	if(title)
		canvas.attr('title',title);
	
	var ctx = canvas[0].getContext("2d");
	if(alpha !== undefined) ctx.globalAlpha = alpha;
	if(icon) Img.drawIcon(ctx,icon,size,0,0);
	return canvas;
}

Img.redrawIcon = function(canvas,icon,title,alpha){
	if(title)
		canvas.attr('title',title);
	
	var ctx = canvas[0].getContext("2d");
	if(alpha !== undefined) ctx.globalAlpha = alpha;
	else ctx.globalAlpha = 1;
	
	var size = canvas[0].width;	//assume square
	ctx.clearRect(0,0,size,size);
	if(icon) 
		Img.drawIcon(ctx,icon,size,0,0);
	return canvas;

}

//Dialog.get('inventory')
Img.drawItem = function(iconId,size,title,amount){
	var icon = Img.drawIcon.html(iconId,size || 40,title || '');
		
	if(amount >= 100000){
		amount = Math.floor(amount/1000);
		if(amount >= 10000)	amount = Math.floor(amount/1000) + "M";
		else amount = amount + "K";
	}
	
	icon.css({
		position:'absolute',
		top:0,
		left:0,
		zIndex:Img.drawItem.zIndex,
	});
	var amountHtml = $('<span>')
		.css({
			color:'yellow',
			position:'absolute',
			top:-5,
			left:-5,
			zIndex:Img.drawItem.zIndex+1,
			backgroundColor:'rgba(0,0,0,0.6)'
		})
		.addClass('shadow360')
		.html(amount);
	
	if(amount <= 1)
		amountHtml.hide();
		
	var total = $('<div>')
		.css({position:'relative',width:size,height:size})
		.append(icon,amountHtml);
	return total;
}
Img.drawItem.zIndex = 20;	//bad...

Img.redrawItem = function(total,iconId,amount){
	var c = total.children();
	var amountHtml = $(c[1]);
	if(amount <= 1)
		amountHtml.hide();
	else {
		amountHtml.html(amount);
		amountHtml.show();
	}
	Img.redrawIcon($(c[0]),iconId);
	return total;
}


Img.drawFace = function(info,size){
	size = size || 96;
	if(info.image === 'player') 
		info = {image:'warrior-male.0',name:player.name};	//BAD
	
	var face = $('<div>')
		.css({textAlign:'center'})
		.append(Img.drawIcon.html(info.image,size,info.name))
		.append($('<span>')
			.html(info.name)
			.css({margin:'auto auto'})
		);
	return face;
}

Img.drawArrow = function(side,size){
	size = size || 40;
	var src = 'img/ui/interface/arrow-' + side + '.png'; 
	return $('<img>')
		.attr({src:src})
		.css({zIndex:Img.drawItem.zIndex,width:size,height:size});
}

Img.getStar = function(color){
	return $('<span>').html(CST.STAR).css({color:'yellow' || color});
}


})();









