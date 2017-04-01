
"use strict";
(function(){ //}
var Img, SpriteFilter, LightingEffect, ParticleEffect;
global.onReady(function(){
	LightingEffect = rootRequire('shared','LightingEffect'); ParticleEffect = rootRequire('shared','ParticleEffect');
	Img = rootRequire('client','Img',true); SpriteFilter = rootRequire('client','SpriteFilter',true);
},null,'SpriteModel',[],function(){
	SpriteModel.init();
});

var OFFSETY_PLAYER = -4;
var SpriteModel = exports.SpriteModel = function(extra){
	this.id = '';
	this.src = "";
	this.img = null;	//Image, client only
	this.filteredImg = {};	//Image, client only
	this.size = 1;
	this.side = [0,1,2,3];
	this.hpBar = 0;
	this.legs = 0;
	this.bumperBox = null;	//SpriteModel.BumperBox
	this.hitBox = SpriteModel.HitBox(-10,10,-10,10);
	this.anim = {};	//SpriteModel.Anim
	this.defaultAnim = "walk";	//HCODE
	this.alpha = 1;
	this.canvasRotate = false;
	this.lightingEffect = null;	//LightingEffect
	this.offsetY = 0;
	this.offsetX = 0;
	this.showBorder = true;
	this.isBulletSprite = false;
	this.isPlayerSprite = false;
	this.particleEffect = null; //Particule.Model
	Tk.fillExtra(this,extra);
};

SpriteModel.create = function(id,src,bumperBox,extra,anim){
	bumperBox = SpriteModel.BumperBox.apply(this,bumperBox);
	
	var a = new SpriteModel({
		bumperBox:bumperBox,
		id:id,
		src:'img/sprite/' + src,
	});
	
	if(!extra.hitBox) 
		extra.hitBox = Tk.deepClone(bumperBox);
	Tk.fillExtra(a,extra);
		
	for(var i in anim){
		a.anim[anim[i].name] = anim[i];
		a.anim['walk'] = anim[i];	//BAD temp
		a.anim['attack'] = anim[i];
		break;	
	}
	if(Array.isArray(a.hitBox)) 
		return ERROR(3,'hitbox is still array');
	if(Array.isArray(a.bumperBox)) 
		return ERROR(3,'bumperBox is still array');
	
	SpriteModel.compressManager.add(id);
	DB[id] = a;
	return id;
}
var DB = SpriteModel.DB = {};

SpriteModel.compressManager = Tk.newCompressManager();

SpriteModel.init = function(){
	SpriteModel.create("mace","actor/main.png",[-10,10,-3,17],{
		size:2.7,side:[1,2,3,0],hpBar:-17,legs:16,hitBox:SpriteModel.HitBox(-10,10,-3,17),
	},[SpriteModel.Anim("move",3,24,32,0.7),SpriteModel.Anim("attack",3,24,32,0.7)]);
	
	var tmp = {	//duplicated data in Dialog_contribution
		body:[205,206,207,208,209,210,211,221,222,223,224,225,325,326,327,328,410,411,412,413,680],
		helm:[
			//120,
			132,133,134,135,136,137,138,139,140,141,15085,15088,15191,15192,15193,15194,15195,15196,15197,15198,15199,15200,15201,15202,15203,15204,15205,168,169,170,171,172,173,174,175,176,177,178,179,
			1389,1507,230,253,254,255,256,257,361,641
		],
		skin:[115,291,432,434],
	};
	for(var i in tmp) 
		for(var j in tmp[i]) 
			SpriteModel.player(tmp[i][j],"player/" + i + '/' + tmp[i][j] + ".png");
	
	
	SpriteModel.player('body-wood',"player/body/body-wood.png");	//linked Actor.getNormalSprite
	SpriteModel.player('body-metal',"player/body/body-metal.png");
	SpriteModel.player('body-bone',"player/body/body-bone.png");
	SpriteModel.player('body-normal',"player/body/body-normal.png");
	SpriteModel.player('helm-wood',"player/helm/helm-wood.png");
	SpriteModel.player('helm-metal',"player/helm/helm-metal.png");
	SpriteModel.player('helm-bone',"player/helm/helm-bone.png");
	SpriteModel.player('helm-normal',"player/helm/helm-normal.png");
	
	SpriteModel.player('skin-body-normal',"player/skin/skin-body-normal.png");
	SpriteModel.player('skin-head-normal',"player/skin/skin-head-normal.png");
	
	
	for(var i = 0 ; i < 10; i++)
		SpriteModel.charasProject('villagerMale-' + i);
	for(var i = 0 ; i < 10; i++)
		SpriteModel.charasProject('villagerFemale-' + i);
	SpriteModel.charasProject('creator');
	
	/*
	SpriteModel.create("slimeJerome","actor/slimeJerome.png",[-55,55,-15,80],{
		size:1,side:[0,1,2,3],hpBar:-110,legs:70,
	},[SpriteModel.Anim("move",5,200,200,0.5)]);	
	SpriteModel.create("troll","actor/troll.png",[-33,33,-30,64],{
		size:1,side:[0,1,2,3],hpBar:-70,legs:35,
	},[SpriteModel.Anim("move",9,128,128,0.5)]);
	*/
	
	//rpgvx
	SpriteModel.rpgvx("goblin","actor/tm/goblin.png");
	SpriteModel.rpgvx("skeleton","actor/tm/skeleton.png");
	SpriteModel.create("dragon","actor/tm/dragon.png",[-25,25,-25,30],{
		size:1.5,side:[2,0,1,3],hpBar:-40,legs:40,
	},[SpriteModel.Anim("move",3,72,72,0.5)]);
	
	//good
	//SpriteModel.rpgvx("troll","actor/troll.png");
	SpriteModel.rpgvx("spirit","actor/spirit.png");
	SpriteModel.rpgvx("mosquito","actor/mosquito.png");
	SpriteModel.rpgvx("mushroom","actor/mushroom.png");
	SpriteModel.rpgvx("larva","actor/larva.png");
	SpriteModel.create("orc-magic","actor/orc-magic.png",[-32,32,-48,48],{
		size:2,side:[2,0,1,3],hpBar:-30,legs:25,
	},[SpriteModel.Anim("move",3,32,48,0.25)]);
	SpriteModel.create("orc-melee","actor/orc-melee.png",[-32,32,-48,48],{
		size:2,side:[2,0,1,3],hpBar:-30,legs:25,
	},[SpriteModel.Anim("move",3,32,48,0.25)]);
	SpriteModel.create("orc-range","actor/orc-range.png",[-32,32,-48,48],{
		size:2,side:[2,0,1,3],hpBar:-30,legs:25,
	},[SpriteModel.Anim("move",3,32,48,0.25)]);
	SpriteModel.create("bat","actor/bat.png",[-32,32,-32,32 ],{
		size:2,side:[3,2,1,0],hpBar:-22,legs:16,
	},[SpriteModel.Anim("move",3,32,32,0.5)]);	
	SpriteModel.create("bee","actor/bee.png",[-32,32,-32,32 ],{
		size:2,side:[3,2,1,0],hpBar:-22,legs:16,
	},[SpriteModel.Anim("move",3,32,32,0.5)]);	
	SpriteModel.create("eyeball","actor/eyeball.png",[-32,32,-32,32 ],{
		size:2,side:[3,2,1,0],hpBar:-22,legs:20,
	},[SpriteModel.Anim("move",3,32,38,0.5)]);
	
	SpriteModel.create("bigWorm","actor/bigWorm.png",[-35,35,-50,50 ],{
		size:2,side:[3,2,1,0],hpBar:-30,legs:25,
	},[SpriteModel.Anim("move",3,35,50,0.5)]);
	
	SpriteModel.create("ghost","actor/ghost.png",[-40,40,-46,46 ],{
		size:2,side:[3,2,1,0],hpBar:-25,legs:28,
	},[SpriteModel.Anim("move",3,40,46,0.5)]);
	
	SpriteModel.create("plant","actor/plant.png",[-60,60,-76,76 ],{
		size:1.5,side:[3,2,1,0],hpBar:-70,legs:40,
	},[SpriteModel.Anim("move",3,60,76,0.5)]);
	
	SpriteModel.create("pumpking","actor/pumpking.png",[-48,48,-48,48 ],{
		size:2,side:[3,2,1,0],hpBar:-40,legs:25,
	},[SpriteModel.Anim("move",3,48,48,0.5)]);
	
	SpriteModel.create("slime","actor/slime.png",[-32,32,-32,32 ],{
		size:2,side:[3,2,1,0],hpBar:-22,legs:16,
	},[SpriteModel.Anim("move",3,32,32,0.5)]);

	SpriteModel.create("smallWorm","actor/smallWorm.png",[-32,32,-32,32 ],{
		size:2,side:[3,2,1,0],hpBar:-22,legs:16,
	},[SpriteModel.Anim("move",3,32,32,0.5)]);
	
	SpriteModel.create("snake","actor/snake.png",[-32,32,-32,32 ],{
		size:2,side:[3,2,1,0],hpBar:-22,legs:16,
	},[SpriteModel.Anim("move",3,32,32,0.5)]);
	
	SpriteModel.create("werewolf","actor/werewolf.png",[-64,64,-48,48],{
		size:1.8,side:[2,0,1,3],hpBar:-40,legs:50,
	},[SpriteModel.Anim("move",3,64,48,0.5)]);
	
	/*SpriteModel.create("taurus","actor/taurus.png",[-72,72,-72,72],{
		size:1.8,side:[2,0,1,3],hpBar:-45,legs:36,
	},[SpriteModel.Anim("move",3,72,72,0.5)]);*/
	
	SpriteModel.create("mummy","actor/mummy.png",[-60,60,-60,60],{
		size:2,side:[2,0,1,3],hpBar:-40,legs:40,
	},[SpriteModel.Anim("move",3,60,60,0.5)]);
	
	SpriteModel.create("basilisk","actor/basilisk.png",[-48,48,-48,48],{
		size:2,side:[2,0,1,3],hpBar:-30,legs:30,
	},[SpriteModel.Anim("move",3,48,48,0.5)]);
	
	//bullet
	SpriteModel.bullet("fireball","bullet/fireball.png",32,32,1,true,{size:0.8,
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(255,122,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,122,122,0)'),
		]),
		particleEffect:ParticleEffect.Model('#ff5555'),
	});
	SpriteModel.bullet("iceshard","bullet/iceshard.png",32,32,1,true,{size:0.8,
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(122,122,255,0.10)'),
			LightingEffect.Color(1,'rgba(122,122,255,0)'),
		]),
		particleEffect:ParticleEffect.Model('#7a7aff'),
	});
	
	SpriteModel.bullet("lightningball","bullet/lightningball.png",32,32,1,true,{size:0.8,
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(255,255,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,255,122,0)'),
		]),
		particleEffect:ParticleEffect.Model('#ffff7a'),
	});
	
	SpriteModel.bullet("bullet-pony","bullet/bullet-pony.png",32,32,1,false,{side:[0,1],
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(255,122,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,122,122,0)'),
		]),
		particleEffect:ParticleEffect.Model('#ff7a7a'),
	});
	SpriteModel.bullet("bullet-happyface","bullet/bullet-happyface.png",32,32,1,true,{
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(255,255,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,255,122,0)'),
		]),
		particleEffect:ParticleEffect.Model('#ffff7a'),
	});
	SpriteModel.bullet("bullet-penguin","bullet/bullet-penguin.png",32,32,1,true,{
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(122,122,255,0.10)'),
			LightingEffect.Color(1,'rgba(122,122,255,0)'),
		]),
		particleEffect:ParticleEffect.Model('#7a7aff'),
	});
	SpriteModel.bullet("arrow","bullet/arrow.png",42,11,1,true,{
		size:0.9,
		particleEffect:ParticleEffect.Model('#777777',0.5),
	});
	SpriteModel.bullet("arrow-fire","bullet/arrow-fire.png",42,11,1,true,{
		size:0.9,
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(255,122,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,122,122,0)'),
		]),
		particleEffect:ParticleEffect.Model('#ff5555'),
	});
	SpriteModel.bullet("arrow-cold","bullet/arrow-cold.png",42,11,1,true,{
		size:0.9,
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(122,122,255,0.10)'),
			LightingEffect.Color(1,'rgba(122,122,255,0)'),
		]),
		particleEffect:ParticleEffect.Model('#7a7aff'),
	});
	SpriteModel.bullet("arrow-lightning","bullet/arrow-lightning.png",42,11,1,true,{
		size:0.9,
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(255,255,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,255,122,0)'),
		]),
		particleEffect:ParticleEffect.Model('#ffff7a'),
	});
	
	
	SpriteModel.bullet("bullet-cannon","bullet/bullet-cannon.png",42,11,1,true);
	SpriteModel.bullet("dart","bullet/dart.png",16,16,1,true,{
		size:2,
		particleEffect:ParticleEffect.Model('#777777',0.5),
	});
	SpriteModel.bullet("bone","bullet/bone.png",48,48,8,{
		particleEffect:ParticleEffect.Model('#777777',0.5),
	});
	SpriteModel.bullet("weapon-fire","bullet/weapon-fire.png",48,48,8,false,{
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(255,122,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,122,122,0)'),
		]),
		particleEffect:ParticleEffect.Model('#ff5555'),
	});
	SpriteModel.bullet("weapon-cold","bullet/weapon-cold.png",48,48,8,false,{
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(122,122,255,0.10)'),
			LightingEffect.Color(1,'rgba(122,122,255,0)'),
		]),
		particleEffect:ParticleEffect.Model('#7a7aff'),
	});
	SpriteModel.bullet("weapon-lightning","bullet/weapon-lightning.png",48,48,8,false,{
		lightingEffect:LightingEffect.create(5,50,[
			LightingEffect.Color(0,'rgba(255,255,122,0.10)'),
			LightingEffect.Color(1,'rgba(255,255,122,0)'),
		]),
		particleEffect:ParticleEffect.Model('#ffff7a'),
	});
	
	
	SpriteModel.bullet("spore","bullet/spore.png",48,48,1,false,{
		size:0.8,
		particleEffect:ParticleEffect.Model('#CC0099'),	
	});
	SpriteModel.bullet("rock","bullet/rock.png",48,48,1,false,{
		size:0.8,
		particleEffect:ParticleEffect.Model('#CC6600',0.5),
	});
	SpriteModel.bullet("shadowball","bullet/shadowball.png",48,48,1,false,{size:0.8, //'http://mohsin-kun.deviantart.com/art/Shadow-Ball-73303663'
		lightingEffect:LightingEffect.create(10,100,[
			LightingEffect.Color(0,'rgba(255,122,255,0.10)'),
			LightingEffect.Color(1,'rgba(255,122,255,0)'),
		]),
		particleEffect:ParticleEffect.Model('#ff7aff'),
	});
	SpriteModel.bullet("tornado","bullet/tornado.png",48,48,5,false,{size:0.8});


	SpriteModel.picture("square-red","picture/square-red.png",32,32,2,{legs:-100});
	SpriteModel.picture("square-blue","picture/square-blue.png",32,32,2,{legs:-100});
	SpriteModel.picture("square-green","picture/square-green.png",32,32,2,{legs:-100});
	SpriteModel.picture("square-yellow","picture/square-yellow.png",32,32,2,{legs:-100});
	
	for(var i = 0 ; i <= 15; i++)	//number-1
		SpriteModel.picture("number-" + i,"picture/number" + i + ".png",32,32,2,{legs:-100});
	SpriteModel.picture("number-empty","picture/number-empty.png",32,32,2,{legs:-100});	
	SpriteModel.picture("number-flag","picture/number-flag.png",32,32,2,{legs:-100});
	SpriteModel.picture("system-sign","picture/sign.png",32,32,2);
	SpriteModel.picture("system-target","picture/target.png",96,96,0.5,{
		hitBox:SpriteModel.HitBox(-70,70,-70,70)
	});
	SpriteModel.picture("pushable-rock2x2","picture/pushable-rock2x2.png",64,64,1);
	SpriteModel.picture("bomb","picture/bomb.png",64,64);

	SpriteModel.picture("gravestone","picture/gravestone.png",32,32,2);
	SpriteModel.picture("waypoint","picture/waypoint.png",16,16,2,{legs:-100});
	SpriteModel.picture("loot-chestOn","picture/loot-chestOn.png",32,32,2);
	SpriteModel.picture("loot-chestOff","picture/loot-chestOff.png",32,32,2);
	SpriteModel.picture("tree-down","picture/tree-down.png",64,32,2,{legs:40,offsetY:24});
	SpriteModel.picture("tree-red","picture/tree-red.png",64,80,2,{legs:40});
	
	
	SpriteModel.picture("Qtutorial-tree","picture/Qtutorial-tree.png",64,80,2,{legs:40,showBorder:false});
	SpriteModel.picture("Qtutorial-tree-glitched","picture/Qtutorial-tree-glitched.png",64,80,2,{legs:40,showBorder:false});
	SpriteModel.picture("Qtutorial-bed","picture/Qtutorial-bed.png",85,74,2,{legs:40,showBorder:false});
	
	SpriteModel.picture("rock-down","picture/rock-down.png",64,64,1.5,{legs:30});
	SpriteModel.picture("rock-bronze","picture/rock-bronze.png",64,64,1.5,{legs:30});
	
	
	SpriteModel.picture("green-down","picture/green-down.png",32,32,2,{legs:-1000});
	SpriteModel.picture("green-up","picture/green-up.png",32,32,2,{legs:30});
	SpriteModel.picture("red-down","picture/red-down.png",32,32,2,{legs:-1000});
	SpriteModel.picture("red-up","picture/red-up.png",32,32,2,{legs:30});
	SpriteModel.picture("yellow-down","picture/yellow-down.png",32,32,2,{legs:-1000});
	SpriteModel.picture("yellow-up","picture/yellow-up.png",32,32,2,{legs:30});

	SpriteModel.picture("toggle-greenOn","picture/toggle-greenOn.png",32,32,2);
	SpriteModel.picture("toggle-greenOff","picture/toggle-greenOff.png",32,32,2);
	SpriteModel.picture("toggle-yellowOn","picture/toggle-yellowOn.png",32,32,2);
	SpriteModel.picture("toggle-yellowOff","picture/toggle-yellowOff.png",32,32,2);
	
	SpriteModel.picture("toggle-greenOn-bronze","picture/toggle-greenOn-bronze.png",32,32,2);
	SpriteModel.picture("toggle-greenOff-bronze","picture/toggle-greenOff-bronze.png",32,32,2);
	SpriteModel.picture("toggle-yellowOn-bronze","picture/toggle-yellowOn-bronze.png",32,32,2);
	SpriteModel.picture("toggle-yellowOff-bronze","picture/toggle-yellowOff-bronze.png",32,32,2);
	
	SpriteModel.picture("toggle-boxOn","picture/toggle-boxOn.png",32,32,2);
	SpriteModel.picture("toggle-boxOff","picture/toggle-boxOff.png",32,32,2);
	SpriteModel.picture("toggle-boxOn-bronze","picture/toggle-boxOn-bronze.png",32,32,2);
	SpriteModel.picture("toggle-boxOff-bronze","picture/toggle-boxOff-bronze.png",32,32,2);
	
	SpriteModel.picture("toggle-redOn","picture/toggle-boxOn.png",32,32,2);
	SpriteModel.picture("toggle-redOff","picture/toggle-boxOff.png",32,32,2);
	SpriteModel.picture("toggle-redOn-bronze","picture/toggle-boxOn-bronze.png",32,32,2);
	SpriteModel.picture("toggle-redOff-bronze","picture/toggle-boxOff-bronze.png",32,32,2);
	
	SpriteModel.create("hunt-squirrel","actor/tm/squirrel.png",[-12,12,-12,12],{	//"http://charas-project.net/resources_download.php?id=15580&file=resources%2FCharasets%2F1%2F10052_1098590341.png"
		size:2,side:[1,2,3,0]
	},[SpriteModel.Anim("move",3,24,24,0.4)]);
	SpriteModel.picture("hunt-down","picture/hunt-down.png",32,64,1.5,{legs:35});

	
	SpriteModel.picture("teleport-door","picture/teleport-door.png",32,48,1.8,{offsetY:-16});
	SpriteModel.picture("teleport-cave","picture/teleport-cave.png",128,102,1,{offsetY:-32});
	
	SpriteModel.picture("teleport-zone","picture/teleport-zone.png",32,32,1.5,{legs:-1000,side:[0,1,2,3]});
	SpriteModel.picture("teleport-zoneLight","picture/teleport-zoneLight.png",32,32,1.5,{legs:-1000,side:[0,1,2,3]});
	SpriteModel.picture("teleport-underground","picture/teleport-underground.png",32,32,2.5);
	SpriteModel.picture("teleport-well","picture/teleport-well.png",48,48,2);
				
	SpriteModel.picture("block-spike","picture/block-spike1x1.png",16,32,2,{showBorder:false});
	SpriteModel.picture("block-spike1x1","picture/block-spike1x1.png",16,32,2,{showBorder:false});
	SpriteModel.picture("block-spike1x3","picture/block-spike1x3.png",16,64,2,{showBorder:false,offsetY:16});
	SpriteModel.picture("block-spike1x5","picture/block-spike1x5.png",16,96,2,{showBorder:false,offsetY:32});
	SpriteModel.picture("block-spike1x9","picture/block-spike1x9.png",16,160,2,{showBorder:false,offsetY:64});	
	
	SpriteModel.picture("block-spike3x1","picture/block-spike3x1.png",48,32,2,{showBorder:false,offsetX:16});
	SpriteModel.picture("block-spike5x1","picture/block-spike5x1.png",80,32,2,{showBorder:false,offsetX:32});
	SpriteModel.picture("block-spike9x1","picture/block-spike9x1.png",144,32,2,{showBorder:false,offsetX:64});

	SpriteModel.picture("block-bridgeH","picture/block-bridgeH.png",32,32,2,{legs:-50});
	SpriteModel.picture("block-bridgeV","picture/block-bridgeV.png",32,32,2,{legs:-50});
	SpriteModel.picture("invisible","picture/invisible.png",32,32);
	SpriteModel.picture("loot-flowerOn","picture/loot-flowerOn.png",32,32,4);
	SpriteModel.picture("loot-flowerOff","picture/loot-flowerOff.png",32,32,4);

	SpriteModel.picture("tower-green","picture/tower-green.png",64,64,1,{hpBar:-40});
	SpriteModel.picture("tower-yellow","picture/tower-yellow.png",64,64,1,{hpBar:-40});
	SpriteModel.picture("tower-red","picture/tower-red.png",64,64,1,{hpBar:-40});
	SpriteModel.picture("tower-blue","picture/tower-blue.png",64,64,1,{hpBar:-40});
	SpriteModel.picture("drop-chest","picture/drop-chest.png",96,96,0.5);
	
	
	
}

SpriteModel.get = function(id){
	return DB[id] || DB[Tk.getSplit0(id,',')] || null;
}

SpriteModel.bullet = function(id,src,sizeX,sizeY,frame,canvasRotate,extra){
	extra = extra || {};
	extra.side = extra.side || [0];
	extra.showBorder = false;
	extra.canvasRotate = canvasRotate || false;
	extra.isBulletSprite = true;
	return SpriteModel.create(id,src,[-1,1,-1,1],extra,[
		SpriteModel.Anim('walk',frame,sizeX,sizeY,1,{walk:0,dir:extra.side.length,loopReverse:false})
	]);
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

SpriteModel.player = function(id,src){
	var extra = {
		isPlayerSprite:true,
		size:3,	//idk y 3 size and not 2.7
		side:[1,2,3,0],
		hpBar:-17,
		legs:15,
		offsetY:OFFSETY_PLAYER,
		hitBox:SpriteModel.HitBox([ -12,12,-12,12])
	};	
	return SpriteModel.create(id,src,[-12,12,-5+OFFSETY_PLAYER,20+OFFSETY_PLAYER],extra,[
		SpriteModel.Anim("move",4,24,32,0.7)
	]);
}

SpriteModel.picture = function(id,src,sizeX,sizeY,size,extra){
	extra = extra || {};
	extra.side = extra.side || [0];
	extra.size = size || 1;
	return SpriteModel.create(id,src,[-sizeX/2+1,sizeX/2-1,-sizeY/2+1,sizeY/2-1],extra,[
		SpriteModel.Anim('move',1,sizeX,sizeY,0,{dir:extra.side.length})
	]);
}

SpriteModel.charasProject = function(id){
	return SpriteModel.create(id,"actor/" + id + ".png",[-12,12,-3,20],{
		size:3,side:[1,2,3,0],hpBar:-12,legs:20,hitBox:SpriteModel.HitBox(-12,12,-3,20),
	},[SpriteModel.Anim("move",3,24,32,0.5)]);
}

SpriteModel.rpgvx = function(id,src){
	var extra = {size:2,side:[2,0,1,3],hpBar:-22,legs:16};
	return SpriteModel.create(id,src,[-32,32,-32,32 ],extra,[
		SpriteModel.Anim('move',3,32,32,0.5)
	]);
}

SpriteModel.Anim = function(name,frame,sizeX,sizeY,spd,extra){	//part of model
	var a = {
		name:'walk',
		startY:0,
		frame:4,
		loopFrame:4,
		sizeX:24,
		sizeY:32,
		dir:4,
		loopReverse:true,
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
	for(var i in extra){
		if(a[i] === undefined) 
			ERROR(4,'prop not in constructor',i);
		a[i] = extra[i];
	}
	if(a.loopReverse)
		a.loopFrame = 2*a.frame-2;	//-2 cuz dont want dupe first and last
	else
		a.loopFrame = a.frame;
	return a;
}

SpriteModel.isPlayerSprite = function(what){
	return SpriteModel.get(what) && SpriteModel.get(what).isPlayerSprite;
}

SpriteModel.getImage = function(model,spriteFilter,cb){
	if(!model.img || !model.img.complete){
		model.img = Img.load(model.src,cb);
		return;
	}
	
	if(!spriteFilter)
		return model.img;
	
	var filterId = spriteFilter.filter;
	if(model.filteredImg[filterId] && model.filteredImg[filterId].complete)
		return model.filteredImg[filterId];
	else {
		SpriteFilter.generateSpriteFilteredImg(model,filterId);
		return model.img;	//return normal version
	}
}









})();

