
//cant use strict cuz global
CST = exports.CST = {};

True = true; False = false;	//for c#
CST.FPS = 25;
CST.MSPF = 1000/CST.FPS;
CST.HEIGHT = 720;
CST.HEIGHT2 = CST.HEIGHT/2;
CST.WIDTH = 1280;
CST.WIDTH2 = CST.WIDTH/2;
CST.OFFSET = {x:0,y:0};
CST.STAR = '★';
CST.ASYNC_LOOP = true;

CST.BISON = true;	//TEMP
CST.FRICTION = 0.50;
CST.FRICTIONNPC = 0.80;
CST.BULLETSPD = 10;

CST.NPCSPD = 7;
CST.PLAYERSPD = 12;
CST.NPCACC = 3;
CST.PLAYERACC = 6;

CST.LORD_DOTEX = 'Lord Dotex';

CST.TIMESTAMP_OFFSET = Date.now();	//on client, set in Game.init

CST.encodeTime = function(time){
	return time - CST.TIMESTAMP_OFFSET;
}
CST.decodeTime = function(time){
	return time + CST.TIMESTAMP_OFFSET;
}





CST.func = function(){};
CST.BIG_INT = 214748364;

CST.SEC = 1000;
CST.MIN = CST.SEC*60;
CST.HOUR = CST.MIN*60;
CST.DAY = CST.HOUR*24;
CST.WEEK = CST.DAY*7;

CST.CRAFT_MIN_LVL = 8;

CST.UNARMED = 'Qsystem-unarmed';

CST.ITEM_GOLD = 'Qsystem-gold';

CST.NPC_RESPAWN = 25*60;
CST.BULLET_MAXTIMER = 40;

CST.CHECKMARK = '✔';
CST.tab = ['inventory','equip','ability','quest','reputation','friend'];

CST.equip = {};
CST.equip.piece = ['weapon','amulet','ring','helm','body'];
CST.equip.weapon = ["mace","spear","sword","bow","boomerang","crossbow","wand","staff","orb"];
CST.equip.amulet = ["ruby","sapphire","topaz"];
CST.equip.ring = ["ruby","sapphire","topaz"];	
CST.equip.helm = ['metal','wood','bone'];
CST.equip.body = ['metal','wood','bone'];

CST.equip.weaponTypeToMainElement = {
	mace:'melee',
	sword:'melee',
	spear:'melee',
	wand:'magic',
	orb:'magic',
	staff:'magic',
	bow:'range',
	crossbow:'range',
	boomerang:'range',
}

CST.abbr = {
	melee:'ML',
	range:'RG',
	magic:'MG',
	fire:'FR',
	cold:'CD',
	lightning:'LG',
	//
	bleed:'BLD',
	knock:'KNK',
	drain:'DRN',
	burn:'BRN',
	chill:'CHL',
	stun:'STN',

};

CST.isWeapon = function(piece){
	return piece === 'weapon';
};
CST.isArmor = function(piece){
	return piece !== 'weapon';
};

CST.element = {};
CST.element.list = ["melee","range","magic","fire","cold","lightning"];
CST.element.toStatus = {"melee":"bleed","range":"knock","magic":"drain","fire":"burn","cold":"chill","lightning":"stun"};
CST.element.toColor = {'melee':'#F97A03','range':'#3EEA31','magic':'#AE52F5','fire':'#FF0000','cold':'#A9F5F2','lightning':'#FFFF00'};
CST.element.physical = ["melee","range","magic"];
CST.element.elemental = ["fire","cold","lightning"];
CST.element.toCaps = {'melee':'Melee','range':'Range','magic':'Arcane','fire':'Fire','cold':'Cold','lightning':'Lightning'};

CST.element.template = function(melee,range,magic,fire,cold,lightning){
	var num = melee;	//if 1 param
	return {
		melee:melee === undefined ? num : melee,
		range:range === undefined ? num : range,
		magic:magic === undefined ? num : magic,
		fire:fire === undefined ? num : fire,
		cold:cold === undefined ? num : cold,
		lightning:lightning === undefined ? num : lightning,
	};
};

CST.status = {
	'list':["bleed","knock","drain","burn","chill","stun"],
	'toElement':{"bleed":"melee","knock":"range","drain":"magic","burn":"fire","chill":"cold","stun":"lightning"},
}

CST.resource = {
	'list':['hp','mana'],
	'toColor':{'hp':'#FF3333','mana':'#0066FF'},
}

//var str = '[';for(var i = 0; i <= 100; i++){ str += Math.floor(10000 * Math.pow(10,i/25)) + ',';} str = str.slice(0,-1) + ']';
CST.exp = [10000,10964,12022,13182,14454,15848,17378,19054,20892,22908,25118,27542,30199,33113,36307,39810,43651,47863,52480,57543,63095,69183,75857,83176,91201,100000,109647,120226,131825,144543,158489,173780,190546,208929,229086,251188,275422,301995,331131,363078,398107,436515,478630,524807,575439,630957,691830,758577,831763,912010,1000000,1096478,1202264,1318256,1445439,1584893,1737800,1905460,2089296,2290867,2511886,2754228,3019951,3311311,3630780,3981071,4365158,4786300,5248074,5754399,6309573,6918309,7585775,8317637,9120108,10000000,10964781,12022644,13182567,14454397,15848931,17378008,19054607,20892961,22908676,25118864,27542287,30199517,33113112,36307805,39810717,43651583,47863009,52480746,57543993,63095734,69183097,75857757,83176377,91201083,100000000,1000000000000000000000000]

//var str = '[';for(var i = 0; i <= 100; i++){ str += i < 5 ? '0,' : (1 + (i-5)*(i < 10 ? 0.015 : 0.025)) + ','; }; str = str.slice(0,-1) + ']';
CST.LVLUP_GEM = [0,0,0,0,0,1,1.015,1.03,1.045,1.06,1.125,1.15,1.175,1.2,1.225,1.25,1.275,1.3,1.325,1.35,1.375,1.4,1.425,1.45,1.475,1.5,1.525,1.55,1.5750000000000002,1.6,1.625,1.65,1.675,1.7000000000000002,1.725,1.75,1.775,1.8,1.8250000000000002,1.85,1.875,1.9,1.925,1.9500000000000002,1.975,2,2.0250000000000004,2.05,2.075,2.1,2.125,2.1500000000000004,2.175,2.2,2.225,2.25,2.2750000000000004,2.3,2.325,2.35,2.375,2.4000000000000004,2.425,2.45,2.475,2.5,2.5250000000000004,2.55,2.575,2.6,2.625,2.6500000000000004,2.675,2.7,2.725,2.75,2.7750000000000004,2.8,2.825,2.85,2.875,2.9000000000000004,2.925,2.95,2.975,3,3.025,3.0500000000000003,3.075,3.1,3.125,3.15,3.1750000000000003,3.2,3.225,3.25,3.275,3.3000000000000003,3.325,3.35,3.375];


CST.ICON = {
	questMarker:'minimapIcon-questMarker',
	quest:'minimapIcon-quest',
	waypoint:'worldMap-waypoint',
}

//[10000,10471,10964,11481,12022,12589,13182,13803,14454,15135,15848,16595,17378,18197,19054,19952,20892,21877,22908,23988,25118,26302,27542,28840,30199,31622,33113,34673,36307,38018,39810,41686,43651,45708,47863,50118,52480,54954,57543,60255,63095,66069,69183,72443,75857,79432,83176,87096,91201,95499,100000,104712,109647,114815,120226,125892,131825,138038,144543,151356,158489,165958,173780,181970,190546,199526,208929,218776,229086,239883,251188,263026,275422,288403,301995,316227,331131,346736,363078,380189,398107,416869,436515,457088,478630,501187,524807,549540,575439,602559,630957,660693,691830,724435,758577,794328,831763,870963,912010,954992,1000000];

CST.color = {
	yellow:'yellow',
	red:'#FF6666',
	green:'#11FF11',
	bronze:'#CD7F32',
	silver:'#C0C0C0',
	gold:'#FFD700',
	white:'white',
	blue:'blue',
	orange:'orange',
}

CST.UI = {
	party:'tab-friend',

}
CST.GENERAL_FEEDBACK = 'general';

CST.pt = function(x,y){
	return {x:x,y:y};
}
CST.rect = function(x,y,width,height){
	return {x:x,y:y,width:width,height:height};
}

CST.material = {
	metal:'Metal',
	wood:'Wood',
	bone:'Bone',
	ruby:'Ruby',
	sapphire:'Sapphire',
	topaz:'Topaz',
}

CST.SKILLPLOT_DOWN = 'down';

CST.SIGN_IN_PACK_STATIC_VAR = 'SIGN_IN_PACK_STATIC';

CST.TUTORIAL_CLASS_BLINK_HELP = 'blink';

CST.INPUT = {
	key:'i',
	mouse:'m',
	position:'p',
}

CST.CHANGE = {
	screenEffectAdd:'sea',
	screenEffectRemove:'ser',
	hitHistory:'hh',
	abilityChange_chargeClient:'ac',
	serverX:'X',
	serverY:'Y',
	sprite_anim:'sa',
	curseClient:'cc',
	onHit:'o',
	screenShake:'ss',
	angle:'a',
	stagger:'st',
};

CST.SEND = {
	anim:'a',
	quickUpdate:'q',
	update:'u',
	init:'i',
	remove:'r',
	player:'p',
	main:'m',
	chrono:'c',
	timestamp:'t',
};

CST.SOCKET = {
	account:'account',
	ping:'ping',
	change:'change',
	statusEffect:'statusEffect',
	click:'click',
	clientError:'clientError',
	command:'command',
	queryDb:'queryDb',
	queryDbAnswer:'queryDbAnswer',
	signInAnswer:'signInAnswer',
	signUpAnswer:'signUpAnswer',
	signOffAnswer:'signOffAnswer',
	signIn:'signIn',
	signUp:'signUp',
	signOff:'signOff',
	toEval:'toEval',
	input:'input',
	message:'message',
	debug:'debug',
	disconnect:'disconnect',
	pingAnswer:'pingAnswer',
	accountAnswer:'accountAnswer',
	debugAnswer:'debugAnswer',
}

CST.COMMAND = {
	abilitySwap:'abilitySwap',
	enablePvp:'enablePvp',
	respawnSelf:'respawnSelf',
	removeEquip:'removeEquip',
	invite:'invite',
	actorOptionList:'actorOptionList',
	useWaypoint:'useWaypoint',
	lvlUp:'lvlUp',
	homeTele:'homeTele',
	teleportTo:'teleportTo',
	flAdd:'flAdd',
	flRemove:'flRemove',
	flPm:'flPm',
	redditComment:'redditComment',
	addCPQuestFeedback:'addCPQuestFeedback',
	giveCP:'giveCP',
	activeBotwatch:'activeBotwatch',
	getQuestRating:'getQuestRating',
	setQuestRatingAsRead:'setQuestRatingAsRead',
	spyPlayer:'spyPlayer',
	displayLogs:'displayLogs',
	replyReddit:'replyReddit',
	sendMsg:'sendMsg',
	addItem:'addItem',
	spawnEnemy:'spawnEnemy',
	addAbility:'addAbility',
	teleportToAdmin:'teleportToAdmin',
	displayPingData:'displayPingData',
	displayClientError:'displayClientError',
	deleteClientError:'deleteClientError',
	setLookingFor:'setLookingFor',
	chronoRemove:'chronoRemove',
	contributionPurchase:'contributionPurchase',
	contributionSelect:'contributionSelect',
	contributionReset:'contributionReset',
	dialogueOption:'dialogueOption',
	useItem:'useItem',
	transferInvBank:'transferInvBank',
	transferBankInv:'transferBankInv',
	transferInvBankAll:'transferInvBankAll',
	transferInvTrade:'transferInvTrade',
	transferTradeInv:'transferTradeInv',
	tradeAcceptSelf:'tradeAcceptSelf',
	tradeCloseWin:'tradeCloseWin',
	setAcceptPartyInvite:'setAcceptPartyInvite',
	partyJoin:'partyJoin',
	partyJoinSolo:'partyJoinSolo',
	questSetChallenge:'questSetChallenge',
	questStart:'questStart',
	questAbandon:'questAbandon',
	reputationAdd:'reputationAdd',
	reputationRemove:'reputationRemove',
	reputationClear:'reputationClear',
	reputationConverterAdd:'reputationConverterAdd',
	reputationConverterRemove:'reputationConverterRemove',
	toggleSQMarker:'toggleSQMarker',
	mute:'mute',
	unmute:'unmute',
	musicNext:'musicNext',
	equipUnlockBoost:'equipUnlockBoost',
	equipRerollStat:'equipRerollStat',
	equipRerollPower:'equipRerollPower',
	equipTier:'equipTier',
	equipSalvage:'equipSalvage',
	signOff:'signOff',
	sendPing:'sendPing',
	questButton:'questButton',
	dialogOpen:'dialogOpen',
	dialogClose:'dialogClose',
	getTutorialHelp:'getTutorialHelp',
	questFeedback:'questFeedback',
	shopBuy:'shopBuy',
	materialSalvage:'materialSalvage',	
	teleportToSpotAdmin:'teleportToSpotAdmin',
	useEquip:'useEquip',
}

CST.ENTITY = {
	npc:'npc',
	player:'player',
	drop:'drop',
	bullet:'bullet',
	strike:'strike',
	anim:'anim',	//note: anim is not actually an entity
}

CST.DAMAGE_IF = {
	player:'player',
	npc:'npc',
	summoned:'summoned',
	always:'always',
	never:'never',
}

CST.VIEWED_IF = {
	always:'always',
	never:'never'
}

CST.LAYER = {
	above:'a',
	below:'b',
}

CST.ITEM = {
	item:'item',
	material:'material',
	equip:'equip',
	misc:'misc',
}

CST.HIGHSCORE = {
	ascending:'ascending',
	descending:'descending',
}

CST.ABILITY = {
	attack:'attack',
	heal:'heal',
	dodge:'dodge',
	summon:'summon',
	event:'event',
	idle:'idle',
	boost:'boost',
}

CST.IDLE = 'idle';	//ability id

CST.FONT = '20px MiniSet2';

CST.ANIM_TYPE = {
	id:'id',
	position:'position',
}

CST.INIT_POSITION = {
	actor:'actor',
	mouse:'mouse',
}

CST.MAP_TILE = {
	cantWalk:'0',
	canWalk:'1',
	bulletOnly:'2',
	fallClose:'3',
	fall:'4',
	canWalkPre:'0',
	cantWalkPre:'1',
	slow:'5',
}

CST.MAP = {
	solo:'@@',
	separator:'@',
	MAIN:'MAIN',
}

CST.SERVER_DOWN = 'DOWN';

CST.QTUTORIAL = 'Qtutorial';

CST.SPRITE_NORMAL = 'normal';

CST.BOOST_X = '*';
CST.BOOST_XXX = '***';
CST.BOOST_PLUS = '+';

CST.DIR = { //TODO
	left:'left',
	right:'right',
	down:'down',
	up:'up',	
}

CST.TRANSITION_MAP = {
	slide:'slide',
	fadeout:'fadeout',
}

CST.SPRITE_FILTER = {
	allBlack:'allBlack',
	allRed:'allRed',
	red:'red',
	blue:'blue',
	green:'green',
}
