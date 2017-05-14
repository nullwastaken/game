//LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR RAININGCHAIN.COM
var Rc;
(function (Rc) {
  
var helper = function(func){
	return function(err){
		if(err) 
			ERROR.err(1,err);
		else 
			func.apply(this,arguments);
	}
};

var parseArguments = function(args){
	for(var i = 0 ; i < args.length; i++){
		if(typeof args[i] === 'function'){
			args[i] = helper(args[i]);
		}
	}
	return args;
}

var handleError = function(err){
	if(err)
		ERROR.err(1,err);
}

var dbVerify = function(){
	return true;
}


    var INACTIVE_COLLECTIONS = [];
    var ACTIVE_COLLECTIONS = ["clientError","sideQuest","zeldaGlitch","socialMedia","achievement","pingData","report","player",'contributionHistory','socialMedia',"offlineAction","main","equip","account",'competition','questRating','highscore','questVar','mainQuest'];
    var db = {};
    var DEBUG = false;
    var REQUEST_NUM = 0;
    var DbObj_one2 = (function () {
        function DbObj_one2(name, active) {
            if (name === void 0) { name = ''; }
            if (active === void 0) { active = true; }
            this.name = name;
            this.active = active;
            this.collection = null;
            this.collection = db[name];
        }
        DbObj_one2.require = function (colls) {
            if(typeof colls === 'string')
                colls = [colls];
            var list = {};
            colls.forEach(function (coll) {
                if (!db[coll])
                    return INFO('database table dont exist', coll);
                list[coll] = new DbObj_one2(coll, ACTIVE_COLLECTIONS.includes(coll));
            });
            return list;
        };
        DbObj_one2.prototype.log = function (what, num, args) {
            if (DEBUG)
                INFO(num, what, this.name, args);
        };
        DbObj_one2.prototype.find = function (query, proj, cb) {
          if(!dbVerify()) return;
          return this.collection.find.apply(this.collection,parseArguments(arguments));
        };
        DbObj_one2.prototype.findOne = function (query, wantedData, cb) {
            if(!dbVerify()) return;
            wantedData._id = 0;
            return this.collection.findOne.apply(this.collection,parseArguments(arguments));
        };
        DbObj_one2.prototype.update = function (query, update, multi, cb) {
            if(!dbVerify()) return;
            return this.collection.update.apply(this.collection,parseArguments(arguments));
        };
        DbObj_one2.prototype.upsert = function (searchInfo, updateInfo, cb) {
            if(!dbVerify()) return;
            return this.update(searchInfo,updateInfo,{upsert:true},cb || handleError);
        };
        DbObj_one2.prototype.insert = function (data, cb) {
            if(!dbVerify()) return;
            return this.collection.insert.apply(this.collection,parseArguments(arguments));
        };
        DbObj_one2.prototype.remove = function (query, multi, cb) {
            if(!dbVerify()) return;
            return this.collection.remove.apply(this.collection,parseArguments(arguments));
        };
        DbObj_one2.prototype.aggregate = function () {
		        return this.collection.aggregate.apply(this.collection,arguments);
        };
        return DbObj_one2;
    }());
    Rc.DbObj_one2 = DbObj_one2;
    var Db_tingodb = (function () {
        function Db_tingodb() {
        }
        Db_tingodb.init = function () {
            try {
                require('fs').mkdirSync(global.ROOT + '/db');
            }
            catch (err) { 
              //INFO("Failed creating " + global.ROOT + '/db');
            }
            var Tingodb_Db = require('tingodb')().Db;
            var dbFull = new Tingodb_Db(global.ROOT + '/db', {});
            ACTIVE_COLLECTIONS.concat(INACTIVE_COLLECTIONS).forEach(function (c) {
                db[c] = dbFull.collection(c);
            });
            return { require: DbObj_one2.require };
        };
        return Db_tingodb;
    }());
    Rc.Db_tingodb = Db_tingodb;
    exports.Db_tingodb = Db_tingodb;
    exports.initDb = function(){
      return Db_tingodb.init();
    }
})(Rc || (Rc = {}));
//# sourceMappingURL=Db_tingodb.js.map