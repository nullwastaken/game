;(function(){ //}
var COUNT = 0;
var LAST = '';
var RESET_AT = 100;

ERROR = exports.ERROR = function(lvl){ 
	//1: fatal, reset server || 2: shouldnt happen || 3: warn, somewhat possible
	
	var stack = ERROR.getStack().split('\n');	//remove first 3 useless stack
	for(var i = 0 ; i < stack.length;){
		if(!stack[i]) break;
		if(stack[i].$contains('ERROR')) 
			stack.splice(0,1);
		else 
			break;
	}
	
	stack = stack.join('\r\n');
	var array = [lvl,stack];
	for(var i = 1; i < arguments.length; i++)
		array.push(arguments[i]);
	ERROR.err.apply(this,array);
}
ERROR.err = function(lvl,err){
	COUNT++;
	if(COUNT > 20)
		return;
	var str = '###################################\n' + 'Error Level ' + lvl + ': \n';
	for(var i = 2; i < arguments.length; i++)
		str += ' -- ' + JSON.stringify(arguments[i]) + '\n';
	
	if(typeof err === 'string')	
		str += err;
	else if(err && typeof err === 'object') 
		str += err.stack || err.message;
	
	
	if(!SERVER){
		var ClientError = rootRequire('client','ClientError',true);
		ClientError.onError(err.message,'ERROR',0,0,str);
	}
	
	
	str = str.replace('at Function.ERROR.getStack (C:\\rc\\rainingchain\\server\\client\\js\\shared\\ERROR.js:','');
	str = str.replace('at exports.ERROR (C:\\rc\\rainingchain\\server\\client\\js\\shared\\ERROR.js:','');
	str = str.replace('at Function.ERROR.getStack (C:\\rc\\rainingchain\\serverCompiled\\client\\js\\shared\\ERROR.js:','');
	str = str.replace('at exports.ERROR (C:\\rc\\rainingchain\\serverCompiled\\client\\js\\shared\\ERROR.js:','');
	
	if(!ERROR.display) return;
	if(COUNT > RESET_AT) return;
	var all = SERVER ? global : window;
	if(LAST === str) return all['con' + 'sole'].log('Same: x' + COUNT);
	LAST = str;
	
	if(lvl < 5 && ERROR.LOG.length < 100000){
		if(!str.$contains('RS_server') && !str.$contains('Debug.ts')){
			for(var i= 0 ; i < 10; i++){
				str = str.replace('at Function.ERROR.getStack (/opt/run/snapshot/package/server/client/js/shared/ERROR.js:')
				str = str.replace('at exports.ERROR (/opt/run/snapshot/package/server/client/js/shared/ERROR.js:','');
				str = str.replace('/opt/run/snapshot/package/server/','');
				str = str.replace('at Function.ERROR.getStack (/opt/run/snapshot/package/serverCompiled/client/js/shared/ERROR.js:')
				str = str.replace('at exports.ERROR (/opt/run/snapshot/package/serverCompiled/client/js/shared/ERROR.js:','');
				str = str.replace('/opt/run/snapshot/package/serverCompiled/','');
				str = str.replace('Error at Function.ERROR.getStack (client/js/shared/ERROR.js:')
				str = str.replace('at exports.ERROR (client/js/shared/ERROR.js:','');
				str = str.replace('Error at Function.ERROR.getStack','');
				str = str.replace('/opt/run/snapshot/package/server/','');
				str = str.replace('/opt/run/snapshot/package/serverCompiled/','');
			}
			
			ERROR.LOG = '<br>\r\n<br>\r\nNEW ' + (new Date()) + str.slice(50,5000) + ERROR.LOG;
		}
	}
	
	all['con' + 'sole'].log(str);
	
	//quest
	if(SERVER && str.$contains('(C:\\rc\\rainingchain\\server\\client\\quest\\')){
		var list = str.split('(C:\\rc\\rainingchain\\server\\client\\quest\\');
		for(var i = list.length-1; i >= 0; i--){
			if(list[i][0] !== 'Q'){
				list.$removeAt(i);
			} else {
				list[i] = list[i].slice(0,list[i].indexOf(')'));
			}
		}
		var str2 = '';
		str2 = '*** This error originated from: *** \r\n';
		for(var i in list){
			var questName = list[i].split(':')[0].split('\\')[1];
			var line = list[i].split(':')[1];
			str2 += '       Quest file "' + questName + '" at line ' + line + '\r\n';
		}
		all['con' + 'sole'].log('');
		all['con' + 'sole'].log(str2);
	}
	if(lvl === 1 && SERVER){
		process.exit(1);
	}
	
}

ERROR.display = true;

ERROR.LOG = 'None\r\n';

ERROR.getStack = function(){
	if(SERVER || window.chrome) return (new Error()).stack;
	try { undefined(); } catch(err) {
		return (new Error()).stack || err.stack || err.message;	//cuz ie sucks
	}
}

ERROR.loop = function(){
	COUNT = Math.max(COUNT - 0.1,0);
	if(COUNT > RESET_AT){
		COUNT = 0;
		return LAST;
	}
	return false;
}

		
})(); //{