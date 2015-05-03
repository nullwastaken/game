//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var SpriteFilter = exports.SpriteFilter = {};
var LIST = SpriteFilter.LIST = {};	//list hardcoded in s.setSpriteFilter

SpriteFilter.create = function(id,func,advanced){
	LIST[id] = {
		func:func,
		advanced:advanced || false,
	}
}

SpriteFilter.init = function(){
	SpriteFilter.create('red',function(red,green,blue,alpha){
		if(red > 100) red += 100;
		else red *= 2;
		return [
			red.mm(10),
			green,
			blue,
			alpha
		];
	});

	SpriteFilter.create('green',function(red,green,blue,alpha){
		if(green > 100) green += 100;
		else green *= 2;
		return [
			red,
			green.mm(10),
			blue,
			alpha
		]
	});

	SpriteFilter.create('blue',function(red,green,blue,alpha){
		if(blue > 100) blue += 100;
		else blue *= 2;
		return [
			red,
			green,
			blue.mm(10),
			alpha
		]
	});

	SpriteFilter.create('allBlack',function(red,green,blue,alpha){
		return [
			0,
			0,
			0,
			alpha
		]
	},true);

	SpriteFilter.create('dodge',function(red,green,blue,alpha){
		return [
			red+100,
			green,
			blue,
			alpha/2
		]
	});
};

SpriteFilter.init();	//no dependency

SpriteFilter.generateSpriteFilteredImg = function(spriteModel,filter){
	var canvas = $('<canvas>')
		.attr({
			width:spriteModel.img.width,
			height:spriteModel.img.height
		})[0];
	var ctx = canvas.getContext("2d");
	ctx.drawImage(spriteModel.img,0,0);
	
	if(filter === 'allBlack'){	//need optimization cuz called often
		SpriteFilter.generateSpriteFilteredImg.allColor('black',spriteModel.img,ctx);
		spriteModel.filteredImg[filter] = new Image();
		spriteModel.filteredImg[filter].src = canvas.toDataURL();
		return;
	}
	if(filter === 'allRed'){
		SpriteFilter.generateSpriteFilteredImg.allColor('red',spriteModel.img,ctx);
		spriteModel.filteredImg[filter] = new Image();
		spriteModel.filteredImg[filter].src = canvas.toDataURL();
		return;
	}
	
	var imgDataNormal = ctx.getImageData(0,0,canvas.width,canvas.height);
	var imgData = imgDataNormal.data;
	
	for (var i = 0; i < imgData.length; i+=4){
		var res = LIST[filter].func(imgData[i+0],imgData[i+1],imgData[i+2],imgData[i+3]);
		imgData[i+0] = res[0];
		imgData[i+1] = res[1];
		imgData[i+2] = res[2];
		imgData[i+3] = res[3];
	}
	
	ctx.putImageData(imgDataNormal,0,0);
	spriteModel.filteredImg[filter] = new Image();
	spriteModel.filteredImg[filter].src = canvas.toDataURL();
}

SpriteFilter.generateSpriteFilteredImg.allColor = function(color,img,ctx){
	ctx.globalCompositeOperation = 'source-atop';
	ctx.fillStyle = color;
	ctx.fillRect(0,0,10000,10000);
}

/*
SpriteFilter.get2DArray = function(imgData,height,width){	//no clue if works...
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
*/













})();



