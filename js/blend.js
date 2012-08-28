/**
@function blend
Merge two objects numeric properties
***/
function blend(src, target, percent) {
	var newObj = {};
	for(var key in target) {
		newObj[key] = target[key];

		
		

	}
	for(var key in src) {
		newObj[key] = src[key];

		
		

	}
	
	for(var key in src) {
		for(var key2 in target) {
			if(key === key2) {
				
				var prop = src[key];
				var prop2 = target[key];
				if(!isNaN(prop) && !isNaN(prop2)) {
					var mix = ((parseFloat(prop2) - parseFloat(prop)) * parseFloat(percent)) + parseFloat(prop);
				//	// console.log("mix", mix);
					newObj[key] = mix;
					// console.log(prop, prop2);
				} else if(typeof(prop) === "object") {
			//		// console.log("A");
					newObj[key] = blend(prop, prop2, percent);
				} else {
					newObj[key] = prop;
				}
			} else {
				
			}
		}
	}
//	// console.log("Blend", newObj);
	return newObj;
}