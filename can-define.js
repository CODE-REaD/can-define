
var can = require("can/util/");
var event = require("can/event/");
var compute = require("can/compute/");
var Map = require("can/map/");
var mapHelpers = require("can/map/map_helpers");
require("can/map/define/");


module.exports = function(objPrototype, defines){
	
	// Copy every method on Map
	can.each(Map.prototype, function(value, prop){
		objPrototype[prop]= value;
	});
	
	objPrototype.___set = function (prop, val) {
		var computedAttr = this._computedAttrs[prop];
		if ( computedAttr ) {
			computedAttr.compute(val);
		} else {
			this._data[prop] = val;
		}	
	};
	// this has to be here for the existing define plugin to find it.
	objPrototype.define = defines;
	
	Object.defineProperty(objPrototype, "_computedAttrs", {
		get: function(){
			if(!this.__computeAttrs) {
				this.__computeAttrs = {};
				for (var attr in defines) {
					var def = defines[attr],
						get = def.get,
						set = def.set;
					if (get) {
						mapHelpers.addComputedAttr(this, attr, can.compute.async(undefined, get, this));
					}
				}
				
			}
			return this.__computeAttrs;
		}
	});
	Object.defineProperty(objPrototype, "_data", {
		get: function(){
			if(!this.__data) {
				this.__data = {};
			}
			return this.__data;
		}
	});
	
	
	can.each(defines, function(value, prop){
		Object.defineProperty(objPrototype, prop,{
			get: function(){
				return this._get(prop);
			},
			set: function(val){
				return this._set(prop, val);
			}
		});
	});
	
	
	
	return objPrototype;
};
