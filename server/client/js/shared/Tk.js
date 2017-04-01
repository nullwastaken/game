
//kinda linked with Input but client only
//linked with player for Tk.absToRel
if(typeof exports === 'undefined') 
	exports = {};	//on client, exports gets overwritten cuz main loaded after Tk

INFO = function(){ //so doesnt show in search all
	var cons = SERVER ? global['cons' + 'ole'] : window['cons' + 'ole'];
	if(cons)	//BAD but causes error
		cons.log.apply(cons,arguments); 
};	

/* DATE

toDateString 		Tue Apr 08 2014
toGMTString 		Tue, 08 Apr 2014 23:05:05 GMT
toISOString 		2014-04-08T23:05:05.249Z
toJSON 				2014-04-08T23:05:05.249Z
toLocaleDateString 	4/8/2014		DOESNT WORK SERVER
toLocaleTimeString 	7:05:05 PM		DOESNT WORK SERVER	
toLocaleString 		4/8/2014 7:05:05 PM		DOESNT WORK SERVER
toString 			Tue Apr 08 2014 19:05:05 GMT-0400 (Eastern Daylight Time)
toTimeString 		19:05:05 GMT-0400 (Eastern Daylight Time)
toUTCString 		Tue, 08 Apr 2014 23:05:05 GMT
valueOf 			1396998305249

new Date((new Date('2015/04/24')).valueOf() + 1000*60*60*24*90)
*/

Date.nowDate = function(num){
	var date = new Date(num || Date.now());
	return date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate();
}
Date.niceFormat = function(num){
	var date = new Date(num || Date.now());
	return date.getMonth()+1 + '/' + date.getDate() + " " + (date.toTimeString()).slice(0,5);
}

//Math
Tk = exports.Tk = {};

Tk.absToRel = function(pt){
	ERROR(3,'Tk.absToRel not supported anymore cuz slow');
	/*return {
		x:Tk.absToRel.x(pt.x),
		y:Tk.absToRel.y(pt.y),
	}*/
}
Tk.absToRel.x = function(x){
	return x - w.player.x + CST.WIDTH2 + CST.OFFSET.x;
}
Tk.absToRel.y = function(y){
	return y - w.player.y + CST.HEIGHT2 + CST.OFFSET.y;
}
	
Tk.getTooltipOptions = function(extra){
	var a = {
		items: '*:not(.ui-dialog-titlebar-close)',
		show:false,
		hide:false,
		tooltipClass: "toolTipDetails",
	}
	for(var i in extra)
		a[i] = extra[i];
	return a;
}

Tk.nicePrompt = function(cb,placeholder,title){
	var div = $('<div>')
		.css({textAlign:'center',zIndex:100});
	var textarea = $('<textarea>')
		.css({margin:'10px',width:'300px',height:'200px'});
	if(placeholder)
		textarea.attr('placeholder',placeholder);
	var button = $('<button>')
		.addClass('myButton')
		.css({margin:'10px'})
		.html('Submit')
		.click(function(){
			div.dialog('destroy');
			var str = textarea.val();
			if(str)
				cb(str);
		});
	div.append(textarea,'<br>',button);
	
	div.dialog({ 
		width:'auto',
		height:'auto',
		zIndex:1000,
		title:title || '',
		resizable: false,
		open: function(event, ui) {
			if(!title)
				$(this).parent().children('.ui-dialog-titlebar').hide();
		}
	});
}

Tk.niceAlert = function(text){
	var div = $('<div>')
		.css({minHeight:'100px',minWidth:'200px',textAlign:'center',padding:'10px'})
		.html(text);
	
	div.dialog({ 
		zIndex:1000,
		modal: true,
		width:'auto',		
		height:'auto',
		resizable: false,
	});
}

Tk.crossDomainAjax = function(url,func){
	$.ajax({
		url: url,
		dataType: 'jsonp',
		type: 'GET',
		crossDomain: true,
		success: func,
	});
}

//var Tk = exports.Tk = {};
Tk.sin = function (number){
	return Math.sin(number/180*Math.PI);
}
Tk.cos = function (number){
	return Math.cos(number/180*Math.PI);
}
Tk.atan = function (number){
	return Math.atan(number)/Math.PI*180;
}
Tk.atan2 = function (y,x){
	//faster
	var coeff_1 = Math.PI / 4;
	var coeff_2 = 3 * coeff_1;
	var abs_y = Math.abs(y);
	var angle, r;
	if (x >= 0) {
		r = (x - abs_y) / (x + abs_y);
		angle = coeff_1 - coeff_1 * r;
	} else {
		r = (x + abs_y) / (abs_y - x);
		angle = coeff_2 - coeff_1 * r;
	}
	angle *= 180/Math.PI;
	angle = angle || 0;	//case y=0,x=0
	if(y < 0)
		angle = -angle + 360;
	return angle;
}
Tk.atan2.precise = function(y,x){
	return y < 0 ? Math.atan2(y,x)*180/Math.PI + 360
		: Math.atan2(y,x)*180/Math.PI;
}

Tk.getAnglePtPt = function(pt1,pt2){
	return Tk.atan2(pt2.y-pt1.y,pt2.x-pt1.x);
}

Tk.getDistancePtPt = function(pt1,pt2){
	return Math.sqrt(Math.pow(pt1.x - pt2.x,2) + Math.pow(pt1.y - pt2.y,2));
}


Math.log10 = function(num){
    return Math.log(num) / Math.log(10);
}
Math.logBase = function(base,num){
    return Math.log(num) / Math.log(base);
}
Math.fact = function (num){
	for(var start = 1; num > 1; num--){ start *= num;}
	return start;
};
Tk.binarySearch = function(arr,value,exactValue){
	var startIndex = 0,
		stopIndex = arr.length - 1,
		middle = Math.floor((stopIndex + startIndex)/2);
		
	if(value < arr[0]) return 0;
	while(!(value >= arr[middle] && value < arr[middle+1]) && startIndex < stopIndex){

		if (value < arr[middle]){
			stopIndex = middle - 1;
		} else if (value > arr[middle]){
			startIndex = middle + 1;
		}

		middle = Math.floor((stopIndex + startIndex)/2);
	}
	if(exactValue === false)
		return middle;
	return arr[middle] === value ? middle : -1;
}
Math.pyt = function(a,b){
	return Math.sqrt(a*a+b*b);
}

Tk.formatAngle = function(angle){
	return ((angle%360)+360)%360;
}

Math.randomId = function(){
	return Math.randomId.getChars(Math.floor(Math.random()*1e8),'');
}
Math.randomId.num = function(){	//used when client only
	return Math.random();
}
Math.randomId.chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
Math.randomId.getChars = function(num, res) {
  var mod = num % 64,
      remaining = Math.floor(num / 64),
      chars = Math.randomId.chars[mod] + res;

  if (remaining <= 0)
	return chars;
  return Math.randomId.getChars(remaining, chars);
};

Tk.getBrowserVersion = function(){
    var ua= navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    M= M[2]? [M[1], M[2]]:[navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/([\.\d]+)/i))!== null) M[2]= tem[1];
    return M.join(' ');
};

Math.roundRandom = function(num){
	if(num%1 > Math.random()) num++;
	return Math.floor(num);
}
Math.randomML = function(num){
	num = num || 1;
	return (Math.random()*2-1)*num
}
Math.probability = function(base,mod){
	if(base >= 1)
		return 1;
	return 1 - Math.pow(1-base,mod);
}

Tk.frameToChrono = function(num){
	return Tk.msToChrono(num*40);
}
Tk.msToChrono = function(time,hideMilli){
	time = time || 0;
	var hour = Math.floor(time / CST.HOUR);
	time %= CST.HOUR;
	var min = Math.floor(time / CST.MIN);
	min = min < 10 ? '0' + min : min;
	time %= CST.MIN;
	var sec = Math.floor(time / CST.SEC);
	sec = sec < 10 ? '0' + sec : sec;
	var milli = time % CST.SEC;
	if(milli < 10) milli = '00' + milli;
	else if(milli < 100) milli = '0' + milli;
	
	if(hideMilli !== true){
		if(+hour) return hour + ':' + min + ':' + sec + '.' + milli;	
		if(+min) return min + ':' + sec + '.' + milli;	
		return sec + '.' + milli;
	} else {
		if(+hour) return hour + ':' + min + ':' + sec;	
		if(+min) return min + ':' + sec;	
		return sec;
	}
}


Tk.argumentsToArray = function(arg){
	return [].slice.call(arg);
}

//Function
Tk.nu = function(test,value){	//used for default values
	return typeof test !== 'undefined' ? test : value;
}


Tk.getCallTime = function(func,rep,what){
	var now = Date.now();
	rep = rep || 1;
	what = what || '';
	for(var i = 0 ; i < rep; i++) 
		func();
	INFO(what + ': ' + (Date.now() - now));	
}


//Copy
Tk.deepClone = function(obj){
	if(obj === null || typeof(obj) !== 'object')
        return obj;

	//var temp = Array.isArray(obj) ? [] : {};	//obj.constructor();
	
	var temp = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
	
    for(var key in obj)
        temp[key] = Tk.deepClone(obj[key]);
    return temp;
}

Tk.sleep = function(time){	//only use for debug
	var now = Date.now();
	while(Date.now() < now + time){
		now += 0;	//so not empty for gulp...		
	}
}	
	
//var verifySameType = false && setTimeout(function(){ INFO('WARNING verifySameType ACTIVE'); },1000);
Tk.fillExtra = function(what,extra,noError){
	for(var i in extra){
		if(what[i] === undefined && noError !== true){
			ERROR(3,'invalid property',what[i],i,extra[i]);
		}
		if(extra[i] !== undefined)
			what[i] = extra[i];
	}
	/*if(SERVER && !NODEJITSU && verifySameType && Math.random() < 0.25){
		setTimeout(function(){
			var old = Tk.deepClone(what);
			setInterval(function(){
				Tk.verifySameType(old,what);
			},1000);
		},1);
	}*/
		
}

	
Tk.verifySameType = function(a,b,stop){
	var bool = true;
	for(var i in a)
		if(a[i] === null)
			continue;
		else
			if(typeof a[i] !== typeof b[i]){
				bool = false;
				if(!stop)
					INFO('invalid:',i,a[i],b[i]);
				else
					INFO('invalid:',i,b[i],a[i]);
			}
	if(stop)
		return bool;
	return Tk.verifySameType(b,a,true);
}

Tk.sharpenCanvas = function(canvas){
	var ctx = $(canvas)[0].getContext('2d');
	ctx.mozImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	return canvas;
}

Tk.createSharpCanvas = function(width,height){
	var c = $('<canvas>').attr({width:width,height:height}).css({width:width,height:height});
	Tk.sharpenCanvas(c);
	return c;
}

Tk.deepClone.partial = function(obj,toExclude){
	if(obj === null || typeof(obj) !== 'object')
        return obj;

    var temp = obj.constructor();

    for(var key in obj){
		if(!toExclude[key])
			temp[key] = Tk.deepClone(obj[key]);
	}
    return temp;
}


Tk.stringify = function(string){
	if(typeof string === 'string'){ return '"' + string + '"'; }
	else if(typeof string === 'number'){ return string.toString(); }
	else { return JSON.stringify(string); }
}
Tk.isEqual = function(obj0,obj1){
	if(obj0 === undefined || obj1 === undefined)
		return false;
	return obj0 === obj1;
}

Tk.getCappedVariation = function(diff,max,pct){	//if pct, max is pctage of diff
	if(pct)
		max *= Math.abs(diff);
		
	if(diff < -max) 
		return -max;
	else if(diff > max) 
		return max;
	return diff;
}
	
//Via Array
Tk.viaArray = {};
Tk.viaArray.get = function(origin,a){
	try {
		return Tk.viaArray.get.main(origin,a);
	} catch (err) { ERROR.err(3,err); }
}
Tk.viaArray.get.main = function(origin,a){
	if(typeof a !== 'object')
		return origin[a];
	switch (a.length) {
		case 1: return origin[a[0]];
		case 2: return origin[a[0]][a[1]];
		case 3: return origin[a[0]][a[1]][a[2]];
		case 4: return origin[a[0]][a[1]][a[2]][a[3]];
		case 5: return origin[a[0]][a[1]][a[2]][a[3]][a[4]];
		case 6: return origin[a[0]][a[1]][a[2]][a[3]][a[4]][a[5]];
		default: break;
	}
}
Tk.viaArray.set = function(origin,a,value){
	try {
		return Tk.viaArray.set.main(origin,a,value);
	} catch (err) { ERROR.err(3,err); }
}
Tk.viaArray.set.main = function(origin,a,value){
	switch (a.length) {
		case 1: origin[a[0]] = value; break;
		case 2: origin[a[0]][a[1]] = value;break;
		case 3: origin[a[0]][a[1]][a[2]] = value;break;
		case 4: origin[a[0]][a[1]][a[2]][a[3]] = value;break;
		case 5: origin[a[0]][a[1]][a[2]][a[3]][a[4]] = value;break;
		case 6: origin[a[0]][a[1]][a[2]][a[3]][a[4]][a[5]] = value;break;
		default: break;
	}
}

//Round
Tk.round = function (num,decimals,str){
	if(!str){ 
		decimals = decimals || 0;
		return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals); 
	}
	if(!decimals)
		return Math.round(num).toString(); 
	
	var num = Tk.round(num,decimals).toString();
	
	var dot = num.indexOf('.');
	if(dot === -1){ 
		num += '.'; 
		dot = num.length-1; 
	}
	
	var missing0 = decimals - num.length + dot + 1;
	
	for(var i=0 ; i < missing0; i++)
		num += '0';
	
	return num;
}
Tk.formatNum = function(num){
	 return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Misc
escape.quote = function(str){
	if(typeof str !== 'string'){ return '' }
	
	str.$replaceAll('"','\"');
	str.$replaceAll("'","\'");
	return str;
}

escape.user = function(name){
	var str = name.replace(/[^a-z0-9 _]/ig, '');
	str = str.trim();
	return str;
}

escape.email = function(str){
	if(typeof str !== 'string') 
		return '' 

    var re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    return re.test(str) ? str : '';
}

escape.html = function(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

unescape.html = function(text){
	return text
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"")
		.replace(/&#039;/g, "'");
}

Tk.arrayToTable = function(array,top,left,CSSTableGenerator,spacing){
	var table = $('<table>');
	if(spacing)	table.css({borderCollapse:'separate',borderSpacing:spacing});
	
	
	for(var i=0; i<array.length; i++){
		var row = $('<tr>');
		if(i === 0 && top) row.addClass("tableHead");
		
		for(var j=0; j<array[i].length; j++){
			var cell = $('<td>');
			if(j === 0 && left) cell.addClass("tableHead").css({color:'white'});
			cell.append(array[i][j]);	//can be text or html
			row.append(cell);
		}
		table.append(row);
	}
	if(CSSTableGenerator === true)
		table.addClass('CSSTableGenerator');
	return table;
}

Tk.arrayToTable2 = function(array){
	var table = $('<table>');
	
	var thead = $('<thead>');
	var tbody = $('<tbody>');
	table.append(thead,tbody);
	
	for(var i=0; i<array.length; i++){
		var row = $('<tr>');		
		for(var j=0; j<array[i].length; j++){
			var cell = i === 0 ? $('<th>') : $('<td>');
			cell.append(array[i][j]);	//can be text or html
			row.append(cell);
		}
		if(i === 0)
			thead.append(row);
		else
			tbody.append(row);
	}
	return table;
}

Tk.responsiveTable = function(table,smToo){
	var list = table.find('tr:first').find('th');
	var colSmall = [];
	for(var i = 0 ; i < list.length; i++){
		if($(list[i]).hasClass('hidden-xs'))
			colSmall.push(i+1);	//+1 cuz index starts at 1...
	}
	var clas = smToo !== false ?  'hidden-xs hidden-sm' : 'hidden-xs';
	for(var i = 0 ; i < colSmall.length; i++){
		table.find('tr td:nth-child(' + colSmall[i] + ')').addClass(clas);
		
		/*table.find('td:eq(' + colSmall[i] + ')').each(function(){
			$(this).addClass(clas);
		});*/
	}
	return table;
}
	
Tk.arrayToTable.access = function(what,row,column){
	return $(what.children().children()[row]).children()[column].innerHTML;
}

Tk.abbreviateNumber = function(num){
	if(num > 10000000)
		num = Tk.round(num/1000000,0) + 'M';
	else if(num > 10000)
		num = Tk.round(num/1000,0) + 'K';
	return '' + num;
}

Tk.flashDOM = function(html,time,autoRemove,before,after){
	var bool = true;
	before = before || {border:'2px solid white'};
	after = after || {border:'2px solid black'};
	
	var interval = setInterval(function() {
		if(bool)
			html.css(before);
		else html.css(after);
		bool = !bool;
	},time || 2000);
	
	if(autoRemove){
		html.on("remove", function () {
			clearInterval(interval);
		})
	}
	return function(){
		clearInterval(interval);
		html.css(after);
	};
}

Tk.centerDOM = function(html){
	if(typeof html === 'string')
		html = $('<span>').html(html);
	return $('<div>')
		.css({width:'100%',textAlign:'center'})
		.append(html);
}

Tk.arrayfy = function(a){
	return (a instanceof Array) ? a : [a];
}

Tk.convertRatio = function(ratio){	//normalize vector
	var sum = 0;
	for(var i in ratio) sum += ratio[i];
	for(var i in ratio) ratio[i] /= sum;
	return ratio;
}

Tk.rotatePt = function(pt,angle,anchor){
	anchor = anchor || {};
	anchor.x = anchor.x || 0;
	anchor.y = anchor.y || 0;
	var rad_angle = angle / 180 * Math.PI;
	return {
		x:Tk.rotatePt.x(pt.x,pt.y,rad_angle,anchor.x,anchor.y),
		y:Tk.rotatePt.y(pt.x,pt.y,rad_angle,anchor.x,anchor.y),
	};
}
Tk.rotatePt.x = function(x,y,rad_angle,anchorX,anchorY){
	return Math.cos(rad_angle) * (x-anchorX) - Math.sin(rad_angle) * (y-anchorY) + anchorX;
}
Tk.rotatePt.y = function(x,y,rad_angle,anchorX,anchorY){
	return Math.sin(rad_angle) * (x-anchorX) + Math.cos(rad_angle) * (y-anchorY) + anchorY;
}

Tk.isScrollBarBottom = function (container,weirdOffset) {
	weirdOffset = weirdOffset || 0;
	var height = container.height();
	var scrollHeight = container[0].scrollHeight;
	var st = container.scrollTop();
	//INFO('height: ' + height + ' scrollHeight: ' + scrollHeight + ' scrollTop: ' + st );
	return st >= scrollHeight - height - weirdOffset;	//weirdOffset no clue y but works....
	
}


Tk.newCacheManager = function(func,lifeTime){
	if(lifeTime < 0)	//aka dont use caching. used when server doesnt need but client does
		return func;
	var cachedValue = null;
	var time = 0;
	var f = function(){
		if(Date.now()-time < lifeTime)
			return cachedValue;
		var res = Tk.fastApply(func,this,arguments);
		time = Date.now();
		cachedValue = res;
		return res;
	}
	f.noCache = func;
	return f;
}

//https://github.com/jaycetde/fast-apply/blob/master/index.js
Tk.fastApply = function(fn, context, args) {
    switch (args ? args.length : 0) {
        case 0:
            return context ? fn.call(context) : fn();
        case 1:
            return context ? fn.call(context, args[0]) : fn(args[0]);
        case 2:
            return context ? fn.call(context, args[0], args[1]) : fn(args[0], args[1]);
        case 3:
            return context ? fn.call(context, args[0], args[1], args[2]) : fn(args[0], args[1], args[2]);
        case 4:
            return context ? fn.call(context, args[0], args[1], args[2], args[3]) : fn(args[0], args[1], args[2], args[3]);
        case 5:
            return context ? fn.call(context, args[0], args[1], args[2], args[3], args[4]) : fn(args[0], args[1], args[2], args[3], args[4]);
        default:
            return fn.apply(context, args);
    }    
}

Tk.arrayToObject = function(array,key,value){
	var ret = {};
	for(var i = 0 ; i < array.length; i++){	
		if(array[i][value] === undefined)
			ERROR(3,'undefined value',key,value);
		ret[array[i][key]] = array[i][value];
	}
	return ret;
}
Tk.objectToArray = function(obj,key,value){
	var ret = [];
	for(var i in obj){
		var a = {};
		a[key] = i;
		a[value] = obj[i];
		ret.push(a);
	}
	return ret;
}

Tk.getSplit0 = function(str,sep){
	var index = str.indexOf(sep);
	if(index === -1)
		return str;
	return str.slice(0,index);
}

//Prototype
Object.defineProperty(Array.prototype, "$contains", {
    enumerable: false,
    value: function(name,begin,binarySearch){
		if(binarySearch)
			return Tk.binarySearch(this,name) !== -1;
		if(begin) 
			return this.indexOf(name) === 0;
		return this.indexOf(name) !== -1;
	}
});	

Object.defineProperty(Array.prototype, "$insertAt", {
    enumerable: false,
    value: function (index, item) {
	  this.splice(index, 0, item);
	}
});

Object.defineProperty(Array.prototype, "$remove", {
    enumerable: false,
    value: function (element,all) {
		for(var i = this.length-1; i >= 0; i--){
			if(this[i] === element){
				this.splice(i,1);
				if(!all) return this;
			}
		}
		return this;
	}
});

Object.defineProperty(Array.prototype, "$removeAt", {
    enumerable: false,
    value: function (i) {
		this.splice(i,1);
		return this;
	}
});

Object.defineProperty(Array.prototype, "$shuffle", {
    enumerable: false,
    value: function () {
		for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
		return this;
	}
});

Object.defineProperty(Array.prototype, "$random", {	// !name: return random element || name:  [{name:10},{name:1}] and return obj
    enumerable: false,
    value: function(name){
		if(!this.length) 
			return null;
		if(name) 
			return ERROR(3,'no longer supported');
		return this[Math.floor(this.length*Math.random())];
	}
});

Object.defineProperty(Object.prototype, "$random", {	//return attribute, must be {attribute:NUMBER}, chance of being picked depends on NUMBER
    enumerable: false,
    value: function(name){
		if(!Object.keys(this).length) 
			return null;
		
		var ratioed = {}; 
		if(name) 
			for(var i in this)	
				ratioed[i] = this[i][name]; 
		else ratioed = this;
		
		for(var i in ratioed)
			if(typeof ratioed[i] !== 'number'){
				return ERROR(2,'not numbers',i,ratioed,Object.keys(ratioed),'' + ratioed[i]);
			}
		ratioed = Tk.convertRatio(ratioed);		
		var a = Math.random();
		for(var i in ratioed){
			if(ratioed[i] >= a)
				return i;
			a -= ratioed[i];
		}
		
		return null;
	}
});

Object.defineProperty(Object.prototype, "$randomAttribute", {	//return random attribute
    enumerable: false,
    value: function(){
		return Object.keys(this).$random();
	}
});	

Object.defineProperty(Object.prototype, "$isEmpty", {
    enumerable: false,
    value: function(){
		var i;
		for(i in this)
			return false;
		return true;
	}
});
	
Object.defineProperty(Object.prototype, "$length", {
    enumerable: false,
    value: function(){
		return Object.keys(this).length;
	}
});	

Object.defineProperty(Object.prototype, "$keys", {
    enumerable: false,
    value: function(){
		return Object.keys(this);
	}
});	

Object.defineProperty(Number.prototype, "r", {
    enumerable: false,
    value: function(num,count) {
		return Tk.round(this,num || 0,count);
	}
});	

Tk.baseConverter = {};	//http://gist.github.com/eyecatchup/6742657
Tk.baseConverter.toAscii = function(bin) {
	return bin.replace(/\s*[01]{8}\s*/g, function(bin) {
		return String.fromCharCode(parseInt(bin, 2))
	});
};
Tk.baseConverter.toBinary = function(str, spaceSeparatedOctets) {
	return str.replace(/[\s\S]/g, function(str) {
		str = Tk.baseConverter.zeroPad(str.charCodeAt().toString(2));
		return str;	//OLD: return !1 == spaceSeparatedOctets ? str : str + " "
	})
};
Tk.baseConverter.zeroPad = function(num) {
	return "00000000".slice(String(num).length) + num;
};

Tk.removeComment = function(str){
	return str.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1');
}

Tk.getGlyph = function(id,jqueryObj){
	if(jqueryObj)
		return $('<span>').addClass("glyphicon glyphicon-" + id);
	else
		return '<span class="glyphicon glyphicon-' + id + '"></span>';
}


Tk.newPubSub = function(multiple,onNewSub){
	var DEFAULT = '__DEFAULT';
	
	var list = {};
	
	
	
	var f = function(what,func,priority){
		if(multiple !== true)
			ff(DEFAULT,what,func);
		else
			ff(what,func,priority);
		if(onNewSub)
			onNewSub.apply(this,arguments);
	}
	var ff = function(what,func,priority){
		if(!what)
			ERROR(3,'what is null',what);
		list[what] = list[what] || [];
		if(typeof func !== 'function')
			return ERROR(3,'func is not a function',func);
		list[what].push({
			func:func,
			priority:priority || 0
		});
		
		list[what].sort(function(a,b){
			return b.priority - a.priority;
		});
	}
	
	f.pub = function(what,p0,p1,p2,p3,p4,p5){	//BAD
		if(multiple !== true)
			return pub(DEFAULT,what,p0,p1,p2,p3,p4,p5);
		else
			return pub(what,p0,p1,p2,p3,p4,p5);
		
	}	
	var pub = function(what,p0,p1,p2,p3,p4,p5){
		if(typeof what === 'object' || !what)
			return ERROR(3,'param is object or undefined when it should be id',what);
		if(!list[what])
			return;
		var ret;
		for(var i = 0 ; i < list[what].length; i++){
			ret = list[what][i].func(p0,p1,p2,p3,p4,p5);
		}
		return ret;
	}
	f.getList = function(){
		return list;
	}
	f.have = function(what){
		return !!list[what];
	}
	
	return f;
}

Tk.newCompressManager = function(array){
	var compress = {};
	var uncompress = [null];
	var exp = {};
	exp.add = function(what){
		if(compress[what])
			return ERROR(3,'duplicate key',what);
		uncompress.push(what);
		compress[what] = uncompress.indexOf(what);
	}
	exp.compress = function(what){
		return compress[what] || what;
	}
	exp.uncompress = function(what){
		return uncompress[what] || what;
	}
	if(array){
		for(var i = 0 ; i < array.length; i++){
			if(array[i] === null)
				continue;
			exp.add(array[i]);
		}
	}
	exp.getArray = function(){
		return uncompress;
	}
	return exp;
}

Tk.getOccurenceCount = function(big,part){
	var r = new RegExp(part,'g');
	return (big.match(r) || []).length;
}


Tk.enumContains = function(list,what){
	for(var i in list)
		if(list[i] === what)
			return true;
	return false;
}


Tk.getFrameSpdMod = function(what){
	var now = Date.now();
	if(!Tk.getFrameSpdMod.LAST_UPDATE[what]){
		Tk.getFrameSpdMod.LAST_UPDATE[what] = now;
		return 1;
	}
	var raw = (now-Tk.getFrameSpdMod.LAST_UPDATE[what])/CST.MSPF;
	Tk.getFrameSpdMod.LAST_UPDATE[what] = now;
	return Tk.minmax(raw,0.8,2);
	
}
Tk.getFrameSpdMod.LAST_UPDATE = {};

Tk.minmax = function(val,min,max){
	return Math.max(min,Math.min(max,val));
}

Tk.getFunctionParameter = function(func){
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	var ARGUMENT_NAMES = /([^\s,]+)/g;
	var fnStr = func.toString().replace(STRIP_COMMENTS, '')
	var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
	if (result === null)
		result = []
	return result
}


Tk.joinOrAnd = function(array,orAnd){
	if(array.length === 0)
		return '';
	if(array.length === 1)
		return array[0];
	return array.slice(0,-1).join(', ') + ' ' + orAnd + ' ' + array[array.length-1];
}

//String
Tk.keyCodeToName = function(charCode,full){	//TOFIX fusion bothfunctions
	var boost = '';
	
	if(charCode > 1000){	//bad... check Input SHIFTKEY
		charCode -= 1000;
		boost = 's';
	}
	
	var m;
	if(charCode === 1) var m = 'l';
	else if(charCode === 2) var m = 'm';
	else if(charCode === 3) var m = 'r';
	else if (charCode === 8) var m = "backspace"; //  backspace
	else if (charCode === 9) var m = "tab"; //  tab
	else if (charCode === 13) var m = "enter"; //  enter
	else if (charCode === 16) var m = "shift left"; //shift left (shelse ift)
	else if (charCode === 17) var m = "ctrl"; //  ctrl
	else if (charCode === 18) var m = "alt"; //  alt
	else if (charCode === 19) var m = "pause/break"; //  pause/break
	else if (charCode === 20) var m = "caps lock"; //  caps lock
	else if (charCode === 27) var m = "escape"; //  escape
    else if (charCode === 32) var m = "_";	 //space        
    else if (charCode === 33) var m = "page up"; // page up, to avoid displaying alternate character and confusing people	         
	else if (charCode === 34) var m = "page down"; // page down
	else if (charCode === 35) var m = "end"; // end
	else if (charCode === 36) var m = "home"; // home
	else if (charCode === 37) var m = "left arrow"; // left arrow
	else if (charCode === 38) var m = "up arrow"; // up arrow
	else if (charCode === 39) var m = "right arrow"; // right arrow
	else if (charCode === 40) var m = "down arrow"; // down arrow
	else if (charCode === 45) var m = "insert"; // insert
	else if (charCode === 46) var m = "delete"; // delete
	else if (charCode === 91) var m = "left window"; // left window
	else if (charCode === 92) var m = "right window"; // right window
	else if (charCode === 93) var m = "select key"; // select key
	else if (charCode === 96) var m = "N0"; // N0
	else if (charCode === 97) var m = "N1"; // N1
	else if (charCode === 98) var m = "N2"; // N2
	else if (charCode === 99) var m = "N3"; // N3
	else if (charCode === 100) var m = "N4"; // N4
	else if (charCode === 101) var m = "N5"; // N5
	else if (charCode === 102) var m = "N6"; // N6
	else if (charCode === 103) var m = "N7"; // N7
	else if (charCode === 104) var m = "N8"; // N8
	else if (charCode === 105) var m = "N9"; // N9
	else if (charCode === 106) var m = "multiply"; // multiply
	else if (charCode === 107) var m = "add"; // add
	else if (charCode === 109) var m = "subtract"; // subtract
	else if (charCode === 110) var m = "decimal point"; // decimal point
	else if (charCode === 111) var m = "divide"; // divide
	else if (charCode === 112) var m = "F1"; // F1
	else if (charCode === 113) var m = "F2"; // F2
	else if (charCode === 114) var m = "F3"; // F3
	else if (charCode === 115) var m = "F4"; // F4
	else if (charCode === 116) var m = "F5"; // F5
	else if (charCode === 117) var m = "F6"; // F6
	else if (charCode === 118) var m = "F7"; // F7
	else if (charCode === 119) var m = "F8"; // F8
	else if (charCode === 120) var m = "F9"; // F9
	else if (charCode === 121) var m = "F10"; // F10
	else if (charCode === 122) var m = "F11"; // F11
	else if (charCode === 123) var m = "F12"; // F12
	else if (charCode === 144) var m = "num lock"; // num lock
	else if (charCode === 145) var m = "scroll lock"; // scroll lock
	else if (charCode === 186) var m = ";"; // semi-colon
	else if (charCode === 187) var m = "="; // equal-sign
	else if (charCode === 188) var m = ","; // comma
	else if (charCode === 189) var m = "-"; // dash
	else if (charCode === 190) var m = "."; // period
	else if (charCode === 191) var m = "/"; // forward slash
	else if (charCode === 192) var m = "`"; // grave accent
	else if (charCode === 219) var m = "["; // open bracket
	else if (charCode === 220) var m = "\\"; // back slash
	else if (charCode === 221) var m = "]"; // close bracket
	else if (charCode === 222) var m = "'"; // single quote
	
	if(!m) 
		m = String.fromCharCode(charCode);
	m = boost + m;
	if(full && m) 
		m = Tk.keyFullName(m);
	
	return m;
}

Tk.keyFullName = function(str){
	if(str === 'l') return 'Left Click'; 
	if(str === 'r') return 'Right Click';
	if(str === 'sl') return 'Shift-Left Click'; 
	if(str === 'sr') return 'Shift-Right Click';
	if(str === '_') return 'Space';
	return str;
}

Tk.replaceBracketPattern = function(data,func2){	//only works like [[sdadsa]]
	var func = function(match, p1, p2, p3) {
		return p1 + func2(p2) + p3;
	};
	for(var i = 0; i < 100; i++){
		var data2 = data.replace(/(.*?)\[\[(.*?)\]\](.*)/,func);
		if(data2 === data) 
			break;
		data = data2;
	}
	return data;
}

Tk.replaceCustomPattern = function(data,begin,ending,func){	//only works like [[sdadsa]]
	var start = data.indexOf(begin); if(start === -1) return data + '';
	var end = data.indexOf(ending); if(end === -1 || end < start) return data + '';
	
	var center = data.slice(start,end+ending.length);
	center = func(center);
	
	data = data.slice(0,start) + center + data.slice(end+ending.length);
	
	return data + '';
}

Tk.chronoToTime = function(str,func){	//1:04:10.10
	var array = str.split(":");
	var time = (+array[array.length-1] * CST.SEC) || 0;
	time += (+array[array.length-2] * CST.MIN) || 0;
	time += (+array[array.length-3] * CST.HOUR) || 0;
	return time;
}

String.prototype.$replaceAll = function (find, replace) {
    return this.replace(new RegExp(find, 'g'), replace);
};

String.prototype.$capitalize = function() {
	if(!this.$contains(' '))   
		return this.charAt(0).toUpperCase() + this.slice(1);
	
	var array = this.split(' ');
	for(var i in array) 
		array[i] = array[i].$capitalize();
	return array.join(' ');
}

String.prototype.$contains = function(name,first){
	if(!first)
		return this.indexOf(name) !== -1;
	return this.indexOf(name) === 0;
}

Tk.setString = function(str,pos,value){
	return str.slice(0,pos) + value + str.slice(pos+1);
}

Tk.quote = function(str){	//quote
	return '&quot;' + str + '&quot;';
}

Tk.rgbaToObject = function(color){	//http://snipplr.com/view.php?codeview&id=60570
	var values = {red:null,green:null,blue:null,alpha:null};
	if( typeof color === 'string' ){
		/* hex */
		if( color.indexOf('#') === 0 ){
			color = color.substr(1)
			if( color.length === 3 )
				values = {
					red:   parseInt( color[0]+color[0], 16 ),
					green: parseInt( color[1]+color[1], 16 ),
					blue:  parseInt( color[2]+color[2], 16 ),
					alpha: 1
				}
			else
				values = {
					red:   parseInt( color.substr(0,2), 16 ),
					green: parseInt( color.substr(2,2), 16 ),
					blue:  parseInt( color.substr(4,2), 16 ),
					alpha: 1
				}
		/* rgb */
		}else if( color.indexOf('rgb(') === 0 ){
			var pars = color.indexOf(',');
			values = {
				red:   parseInt(color.substr(4,pars)),
				green: parseInt(color.substr(pars+1,color.indexOf(',',pars))),
				blue:  parseInt(color.substr(color.indexOf(',',pars+1)+1,color.indexOf(')'))),
				alpha: 1
			}
		/* rgba */
		}else if( color.indexOf('rgba(') === 0 ){
			var pars = color.indexOf(','),
				repars = color.indexOf(',',pars+1);
			values = {
				red:   parseInt(color.substr(5,pars)),
				green: parseInt(color.substr(pars+1,repars)),
				blue:  parseInt(color.substr(color.indexOf(',',pars+1)+1,color.indexOf(',',repars))),
				alpha: parseFloat(color.substr(color.indexOf(',',repars+1)+1,color.indexOf(')')))
			}
		/* verbous */
		}
	}
	return values
}

Tk.rgbaToString = function(rgba){
	return 'rgba(' + Math.floor(rgba.red) + ',' + Math.floor(rgba.green) + ',' + Math.floor(rgba.blue) + ',' + rgba.alpha + ')';
}

Tk.getCallPerSec = function(what,log){
	var list = Tk.getCallPerSec.LIST;
	list[what] = list[what] || [];
	var now = Date.now();
	list[what].push(now);
	
	while(list[what][0] && (now - list[what][0] > 5000))
		list[what].shift();
	
	var callPerSec = list[what].length / 5;
	
	//log
	Tk.getCallPerSec.LAST_LOG[what] = Tk.getCallPerSec.LAST_LOG[what] || 0;
	if(now - Tk.getCallPerSec.LAST_LOG[what] > 1000){
		Tk.getCallPerSec.LAST_LOG[what] = now;
		INFO(what + ': ' + callPerSec);
	}
	return callPerSec;
}
Tk.getCallPerSec.LIST = {};
Tk.getCallPerSec.LAST_LOG = {};

Tk.convertAngleNumToSide = function(angle,v){
	v = v || 45;	//more or less
	angle = (angle+360) % 360;
	if(angle >= 360-v || angle < 0+v)
		return 'right';
	if(angle >= 90-v && angle < 90+v)
		return 'down';
	if(angle >= 180-v && angle < 180+v)
		return 'left';
	if(angle >= 270-v && angle < 270+v)
		return 'up';
	return null;	//not perpendicular
}

Tk.convertFloatToInt = function(obj,cap32Bit){
	/*jslint bitwise: true */
	if(typeof obj === 'number')
		return obj | 0;
	if(obj === null || typeof obj !== 'object')
		return obj;
	
	for(var i in obj){
		if(typeof obj[i] === 'number'){
			if(cap32Bit && obj[i] > 214748364)
				obj[i] = 214748364;
			if(cap32Bit && obj[i] < 214748364)
				obj[i] = -214748364;
			obj[i] = obj[i] | 0;
		}
		else if(obj[i] !== null && typeof obj[i] === 'object')
			Tk.convertFloatToInt(obj[i],cap32Bit);
	}
	return obj;	
	/*jslint bitwise: false */	
}

Tk.toArray2D = function(grid1d,width){
	var grid = [];
	for(var i = 0; i < grid1d.length; i++) {
		var y = Math.floor(i / width);
		grid[y] = grid[y] || [];
		grid[y][i % width] = grid1d[i];
	}
	return grid;
}
Tk.stringToNumArray = function(array){
	for(var i = 0 ; i < array.length; i++)
		array[i] = +array[i];
}

Tk.setTransform = function(ctx,rotation,translateX,translateY){
	var rot = rotation / 180 * Math.PI;
	
	var sine = Math.sin(rot);
	var cosine = Math.cos(rot);
	
	ctx.setTransform(cosine, sine, -sine, cosine, translateX, translateY);
}

if(typeof $ !== 'undefined' && typeof CanvasRenderingContext2D !== 'undefined'){ //}

	//http://stackoverflow.com/questions/21159301/quotaexceedederror-dom-exception-22-an-attempt-was-made-to-add-something-to-st
	if (typeof localStorage === 'object') {
		try {	
			localStorage.setItem('localStorage', 1);
			localStorage.removeItem('localStorage');
		} catch (e) {
			localStorage.setItem = function() {};
			alert('Your web browser does not support storing settings locally. In Safari, the most common cause of this is using "Private Browsing Mode". Some settings may not save or some features may not work properly for you.');
		}
	}

	$.fn.selectRange = function(start, end) {
		if(!end) end = start; 
		return this.each(function() {
			if (this.setSelectionRange) {
				this.focus();
				this.setSelectionRange(start, end);
			} else if (this.createTextRange) {
				var range = this.createTextRange();
				range.collapse(true);
				range.moveEnd('character', end);
				range.moveStart('character', start);
				range.select();
			}
		});
	};
	$.fn.contextmenu = function(func) {
		this.bind('contextmenu',function(e){
			e.preventDefault();
			func();
			return false;
		});
		return this;
	};

	/*CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, fill, stroke, radius) {
		if (typeof stroke === "undefined" ) {  stroke = true; }
		if (typeof fill === "undefined" ) {  fill = true; }
		if (typeof radius === "undefined") {  radius = 5; }
		this.beginPath();
		this.moveTo(x + radius, y);
		this.lineTo(x + width - radius, y);
		this.quadraticCurveTo(x + width, y, x + width, y + radius);
		this.lineTo(x + width, y + height - radius);
		this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		this.lineTo(x + radius, y + height);
		this.quadraticCurveTo(x, y + height, x, y + height - radius);
		this.lineTo(x, y + radius);
		this.quadraticCurveTo(x, y, x + radius, y);
		this.closePath();
		if (fill) 
			this.fill();     
		if (stroke) 
			this.stroke();
	}

	CanvasRenderingContext2D.prototype.length = function(a){
		return this.measureText(a).width;
	}

	CanvasRenderingContext2D.prototype.clear = function(a){
		this.clearRect(0,0,this.width,this.height);
	}

	CanvasRenderingContext2D.prototype.setFont = function(size){
		this.font = size + 'px MiniSet2';
	}*/


	
} //{





