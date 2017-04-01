
(function(){ //}

exports.InitManager = function(postProgress){
	var LIST = [];
	var loaded = {};
	var ran = false;
	var loadedCount = 0;
	var toLoadCount = 0;
	
	postProgress = postProgress || function(pct){};
	
	this.add = function(self,dependency,func){
		if(ran)
			ERROR(3,'already ran');
		var p = {
			self:self || '',
			func:func || null,
			dependency:dependency || [],
		}
		LIST.push(p);
		toLoadCount++;
	}
	
	
	
	var run = this.run = function(async,cb,index){
		var runHelper = function(){
			run(async,cb);
		};
		dance: 
			while(true){
				for(var i = 0; i < LIST.length; i++){
					if(canBeLoaded(LIST[i])){
						load(LIST[i]);
						loadedCount++;
						postProgress(loadedCount/toLoadCount);
						if(async){
							setTimeout(runHelper,0)
							return;
						}
						else
							continue dance;	//continue the while(true)
					}
				}
				break;
			}
			
		if(LIST.length !== 0)
			ERROR(3,'not all dependencies have been loaded',LIST);
		ran = true;
		if(cb)
			cb();
	}
	var load = function(pack){
		pack.func();
		LIST.$remove(pack);
		loaded[pack.self] = true;
	}
	var canBeLoaded = function(pack){
		for(var i = 0 ; i < pack.dependency.length; i++)
		if(!loaded[pack.dependency[i]])
			return false;
		return true;
	}
}


})(); //{