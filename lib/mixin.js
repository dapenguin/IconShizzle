var mixin = function(obj1, obj2){
	if (typeof obj1 == 'undefined') obj1 = {};
	if (!obj1 || !obj2) return;
	for (var p in obj2) {
		try {
			if ( obj2[p].constructor==Object ) {
				obj1[p] = JSM.mixin(obj1[p], obj2[p]);
			} else {
				obj1[p] = obj2[p];
			}
		} catch(e) {
			obj1[p] = obj2[p];
		}
	}
	return obj1;	
};

module.exports = mixin;