//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var SIGN_IN_PACK = {};

var SpriteModel = exports.SpriteModel = {};
SpriteModel.create = function(id,src,bumperBox,extra,anim){
	SIGN_IN_PACK[id] = SpriteModel.compressClient([id,src,bumperBox,extra,anim]);	//data sent to client
	
	bumperBox = SpriteModel.BumperBox.apply(this,bumperBox);
	
	var a = {
		id:'',
		src:"actor/main.png",
		img:null,	//client only
		filteredImg:{},	//client only
		size:1,
		side:[0,1,2,3],
		hpBar:0,
		legs:0,
		bumperBox:bumperBox,
		hitBox:SpriteModel.HitBox(-10,10,-10,10),
		anim:{},
		defaultAnim:"walk",
		alpha:1,
		canvasRotate:0,
		mirror:0,			//UNUSED: if 90 < angle < 270, symetry
		offsetY:0,
		offsetX:0,
		showBorder:true,
	};
	
	a.id = id;
	a.src = 'img/sprite/' + src;
	if(!extra.hitBox) 
		extra.hitBox = Tk.deepClone(bumperBox);
	
	for(var i in extra) a[i] = extra[i];
	
		
	for(var i in anim){
		a.anim[anim[i].name] = anim[i];
		a.anim['walk'] = anim[i];	//BAD temp
		a.anim['attack'] = anim[i];
		break;	
	}
		
	DB[id] = a;
	return id;
}
var DB = SpriteModel.DB = {};

SpriteModel.get = function(id){
	return DB[id] || null;
}

SpriteModel.useSignInPack = function(pack){	//client side only, for now
	for(var i in pack){
		SpriteModel.create.apply(this,SpriteModel.uncompressClient(pack[i]));
	}
}

SpriteModel.HitBox = SpriteModel.BumperBox = function(minX,maxX,minY,maxY){
	if(Array.isArray(minX)){ maxX = minX[1]; minY = minX[2]; maxY = minX[3]; minX = minX[0]; }
	return {
		right:{ "x":maxX,"y":(minY+maxY)/2 },
		down:{ "x":(minX+maxX)/2,"y":maxY },
		left:{ "x":minX,"y":(minY+maxY)/2 },
		up:{ "x":(minX+maxX)/2,"y":minY }
	};
}


SpriteModel.bullet = function(id,src,sizeX,sizeY,frame,canvasRotate,extra){
	extra = extra || {};
	extra.side = extra.side || [0];
	extra.showBorder = false;
	extra.canvasRotate = canvasRotate || 0;
	return SpriteModel.create(id,src,[-1,1,-1,1],extra,[
		SpriteModel.anim('walk',frame,sizeX,sizeY,1,{walk:0,dir:extra.side.length})
	]);
}
SpriteModel.player = function(id,src){
	var extra = {player:1,size:2.7,side:[1,2,3,0],hpBar:-17,legs:20,hitBox:[ -12,12,-12,12]}
	return SpriteModel.create(id,src,[-12,12,-5,20],extra,[
		SpriteModel.anim("move",4,24,32,0.5)
	]);
}
SpriteModel.picture = function(id,src,sizeX,sizeY,size,extra){
	extra = extra || {};
	extra.side = extra.side || [0];
	extra.size = size || 1;
	return SpriteModel.create(id,src,[-sizeX/2+1,sizeX/2-1,-sizeY/2+1,sizeY/2-1],extra,[
		SpriteModel.anim('move',1,sizeX,sizeY,0,{dir:extra.side.length})
	]);
}
SpriteModel.rpgvx = function(id,src){
	var extra = {size:2,side:[2,0,1,3],hpBar:-22,legs:16};
	return SpriteModel.create(id,src,[-16,16,-16,16 ],extra,[
		SpriteModel.anim('move',3,32,32,0.5)
	]);
}
SpriteModel.anim = function(name,frame,sizeX,sizeY,spd,extra){	//part of model
	var a = {
		name:'walk',
		startY:0,
		frame:4,
		sizeX:24,
		sizeY:32,
		dir:4,
		spd:0.4,
		walk:1,
		next:'walk'
	};
	a.name = name;
	a.frame = frame || a.frame;
	a.sizeX = sizeX || a.sizeX;
	a.sizeY = sizeY || a.sizeY;
	a.spd = Tk.nu(spd,a.spd);
	extra = extra || {};
	for(var i in extra) a[i] = extra[i];
	return a;
}


SpriteModel.getSignInPack = function(){
	return SIGN_IN_PACK;
}

/*
"bullet-pony": [
	
	{
		"side": [0,1],
		"showBorder": false,
		"canvasRotate": 0,
	},
	[
		
			"name": "move",
			"startY": 0,
			"frame": 1,
			"sizeX": 32,
			"sizeY": 32,
			"dir": 2,
			"spd": 1,
			"walk": 0,
			"next": "walk"
		}
	]
],
*/
SpriteModel.compressClient = function(array){
	var array = Tk.deepClone(array);
	var anim = array[4];
	var newAnim = [];
	for(var i in anim){
		newAnim.push([
			anim[i].name,
			anim[i].startY,
			anim[i].frame,
			anim[i].sizeX,
			anim[i].sizeY,
			anim[i].dir,
			anim[i].spd,
			anim[i].walk,
			anim[i].next		
		]);
	}
	array[4] = newAnim;
	
	return array;
}

SpriteModel.uncompressClient = function(array){
	var anim = array[4];
	var newAnim = [];
	for(var i in anim){
		newAnim.push({
			name:anim[i][0],
			startY:anim[i][1],
			frame:anim[i][2],
			sizeX:anim[i][3],
			sizeY:anim[i][4],
			dir:anim[i][5],
			spd:anim[i][6],
			walk:anim[i][7],
			next:anim[i][8],
		});
	}
	array[4] = newAnim;
	return array;
}


if(SERVER) return;
var SpriteFilter = function(id,func,advanced){
	SpriteFilter.LIST[id] = {
		func:func,
		advanced:advanced || false,
	}
}
SpriteFilter.LIST = {};	//list hardcoded in s.setSpriteFilter

SpriteFilter('red',function(red,green,blue,alpha){
	if(red > 100) red += 100;
	else red *= 2;
	return [
		red.mm(10),
		green,
		blue,
		alpha
	];
});

SpriteFilter('green',function(red,green,blue,alpha){
	if(green > 100) green += 100;
	else green *= 2;
	return [
		red,
		green.mm(10),
		blue,
		alpha
	]
});

SpriteFilter('blue',function(red,green,blue,alpha){
	if(blue > 100) blue += 100;
	else blue *= 2;
	return [
		red,
		green,
		blue.mm(10),
		alpha
	]
});

SpriteFilter('allBlack',function(red,green,blue,alpha){
	return [
		0,
		0,
		0,
		alpha
	]
},true);


SpriteFilter('dodge',function(red,green,blue,alpha){
	return [
		red+100,
		green,
		blue,
		alpha/2
	]
});



//TEST(SpriteModel.DB['warrior-male0']);
SpriteModel.generateSpriteFilteredImg = function(spriteModel,filter){
	var canvas = $('<canvas>')
		.attr({
			width:spriteModel.img.width,
			height:spriteModel.img.height
		})[0];
	var ctx = canvas.getContext("2d");
	ctx.drawImage(spriteModel.img,0,0);
	
	if(filter === 'allBlack'){	//need optimization cuz called often
		SpriteModel.generateSpriteFilteredImg.allColor('black',spriteModel.img,ctx);
		spriteModel.filteredImg[filter] = new Image();
		spriteModel.filteredImg[filter].src = canvas.toDataURL();
		return;
	}
	if(filter === 'allRed'){
		SpriteModel.generateSpriteFilteredImg.allColor('red',spriteModel.img,ctx);
		spriteModel.filteredImg[filter] = new Image();
		spriteModel.filteredImg[filter].src = canvas.toDataURL();
		return;
	}
	
	var imgDataNormal = ctx.getImageData(0,0,canvas.width,canvas.height);
	var imgData = imgDataNormal.data;
	
	for (var i = 0; i < imgData.length; i+=4){
		var res = SpriteFilter.LIST[filter].func(imgData[i+0],imgData[i+1],imgData[i+2],imgData[i+3]);
		imgData[i+0] = res[0];
		imgData[i+1] = res[1];
		imgData[i+2] = res[2];
		imgData[i+3] = res[3];
	}
	
	ctx.putImageData(imgDataNormal,0,0);
	spriteModel.filteredImg[filter] = new Image();
	spriteModel.filteredImg[filter].src = canvas.toDataURL();
}
SpriteModel.generateSpriteFilteredImg.allColor = function(color,img,ctx){
	ctx.globalCompositeOperation = 'source-atop';
	ctx.fillStyle = color;
	ctx.fillRect(0,0,10000,10000);
}

SpriteModel.get2DArray = function(imgData,height,width){	//no clue if works...
	var tmp = [];
	for (var j = 0; j < height; j++){
		tmp.push([]);
		for (var i = 0; i < width; i++){
			tmp[j][i] = {
				red:imgData[j*width*4+i*4],
				green:imgData[j*width*4+i*4+1],
				blue:imgData[j*width*4+i*4+2],
				alpha:imgData[j*width*4+i*4+3]
			}
		}
	}
	return tmp;
}

SpriteModel.getImage = function(model,spriteFilter){	//BAD with act... HARDCODED for border
	if(!spriteFilter){
		if(model.img && model.img.complete) 
			return model.img;	//idk if complete is good...
		else {
			model.img = new Image();
			model.img.src = model.src;
			return;
		}
	}
	
	var filterId = spriteFilter.filter;
	if(model.filteredImg[filterId] && model.filteredImg[filterId].complete)
		return model.filteredImg[filterId];
	else {
		SpriteModel.generateSpriteFilteredImg(model,filterId);
		return SpriteModel.getImage(model,null);	//return normal version
	}
	
	
	
}








})();

