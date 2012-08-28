window.requestAnimFrame = (function(callback){
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){
		window.setTimeout(callback, 1000 / 60);
	};
})();
function animate(lastTime){
	// update
	var date = new Date();
	var time = date.getTime();
	var timeDiff = time - lastTime;
	
//    three.cube.rotation.y += angleChange;
	lastTime = time;
	
	// render
	if(currentMovie && currentMovie.currentScene) {
		currentMovie.currentScene.camera.aspect = window.innerWidth / window.innerHeight;
		renderer.render(currentMovie.currentScene.scene, currentMovie.currentScene.camera);
	
	}
	// request new frame
	requestAnimFrame(function(){
		animate(lastTime);
	});
}
var move_z = 0;
var move_x = 0;
var move_y = 0;

var currentLevel = null;
var renderer = null;
function loadLevel (level, x, y) {
	var firstLevel = new Level(level, x, y);
	currentLevel = firstLevel;
	firstLevel.activate();
}
var textOverlays = [];
function addOrEditTextOverlay(id, text, left, top) {
	var txt = document.getElementById("label_" + id);
	if(!txt) {
		txt = document.createElement("span");
		txt.setAttribute("style", "z-index: 12; font-size:35px; font-family: Terminal; color: #FFFFFF; text-shadow: 1px 1px 0px #000000; position: absolute; left: " + left +"px; top: " + top + "px; width:70%; height:32px");
		txt.innerHTML = text;
		txt.setAttribute("id", "label_" + id);
		// console.log(txt);
		document.body.appendChild(txt);
	} else {
		txt.innerHTML = text;
	}
}
function die() {
	lives -= 1;
	if(lives > -1) {
		loadLevel(currentLevel.url);
		points = 0;
		lives = 3;
		coins = 0;
	} else {
		loadLevel("levels/1-1.json");
	}
	updateHeader();
}
var tileset = null;

var scene = null;
var camera = null;
window.onkeyup = function (e) {
	 // console.log(e);
	
	if(e.keyIdentifier === "U+0057") {
		move_z = 0;
		
	} 
	if(e.keyIdentifier === "U+0053") {
		move_z = 0;
		
	} 
};
window.onkeydown = function (e) {
	 // console.log(e);
	
	if(e.keyIdentifier === "U+0057") {
		move_z = -100;
		
	} 
	if(e.keyIdentifier === "U+0053") {
		move_z = +100;
		
	} 
};
/**
@class movie
**/
function Movie (url) {
	var si = 0;
	
	this.url = url;
	var playing = null;
	this.currentScene  = null;
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url + "/movie.json", false);
	xmlHttp.send();
	this.movie = eval("(" + xmlHttp.responseText + ")");
	
	// Load motion handlers
	xmlHttp.open("GET", "movies/motions.json", false);
	xmlHttp.send(null);
	this.motions = eval("(" + xmlHttp.responseText + ")");
	this.getMotion = function(name) {
		for(var i = 0; i < this.motions.motions.length; i++) {
			if(this.motions.motions[i].name == name) {
				return this.motions.motions[i];
			}
		}
	};
	this.scenes = [];
	for(var i = 0; i < this.movie.scenes.length; i++) {
		var scene = new Scene(this.movie.scenes[i], this);
		this.scenes.push(scene);
	}
	var currentScene = this.scenes[0];
	this.currentScene = currentScene;
	this.nextScene = function () {
		if(si < this.scenes.length) {
			this.currentScene = this.scenes[si];
			si++;
		} else {
			return false;
		}
	};
	this.play = function () {
		playing = setInterval(function () {
			currentScene.renderNextFrame(0.01);
			
		}, STEP_LENGTH);
		
	};
	this.setScene = function (index) {
		this.currentScene = this.scenes[index];
	};
}

var STEP_LENGTH = 60 / 500;
function Scene (sceneObj, movie, parentScene) {
	this.parentScene = parentScene;
	this.motions = [];
	this.events = sceneObj.events;
	var currentFrame = 0;
	this.renderNextFrame = function (p) {
		this.renderFrame(currentFrame);
		
		currentFrame += p;
	};
		
	this.sceneObj = sceneObj;
	this.scene = [];
	if(typeof(parentScene) !== "undefined") {
		this.scene = new THREE.Object3D();
	} else {
		this.scene = new THREE.Scene();
	
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 11000);
		this.camera.position = sceneObj.camera.position;
		this.camera.rotation = sceneObj.camera.rotation;
	}
	this.actors = [];
	this.objects = [];
	this.events = [];
	this.scenes = [];
	console.log(this);
	if(typeof(sceneObj.subscenes) !== "undefined") {
		for(var i = 0; i < sceneObj.subscenes.length; i++) {
			var sceneO =  sceneObj.subscenes[i];
			var xmlHttp = new XMLHttpRequest();
			console.log("F", sceneO.uri);
			xmlHttp.open("GET", sceneO["uri"] + " ", false);
			xmlHttp.send();
			console.log(xmlHttp.responseText);
			var scene = new Scene(eval("(" + xmlHttp.responseText + ")"), movie, this);
			scene.events = sceneO.events;
			this.scenes.push(scene);
			this.scene.add(scene.scene);
			
			console.log(scene.events);
			console.log(scene);
			console.log(scene.scene);
			scene.scene.position = sceneO.position;
			scene.scene.rotation = sceneO.rotation;
			
		}
	}
	/***
	@function renderFrame
	@description Renders the frame
	***/
	this.renderFrame = function(frameIndex) {
		for(var i = 0; i < this.scenes.length; i++) {
			
			var scene = this.scenes[i];
			console.log("AF", scene.events);
			var prevFrame = null;
			
			for(var j = 0; j < scene.events.length; j++) {
				console.log("FFGWEFWEFW");
				var event = scene.events[j];
				var frame = event.frame;
				var source = null; // previous frame
				var target = null; // target frame
				// console.log(event, frameIndex, event.frame);
				prevEvent = scene.events[j-1];
				console.log("G", prevEvent);
				console.log(scene.events);
				if(typeof(prevEvent) === "undefined") {
					prevEvent = {
						"frame":0,
						position: scene.position
					};
				} else {
					console.log("T");
				}
				
				 console.log(frameIndex, "PrevEvent", prevEvent.frame, event.frame,  frameIndex <= event.frame);
				if(frameIndex > prevEvent.frame && frameIndex <= event.frame) {
					console.log("FCT");
					var percentFinished =  (frameIndex -prevEvent.frame) / (event.frame - prevEvent.frame);
					console.log("%", percentFinished);
					var newPosition = null;
					if(typeof(prevEvent) === "undefined") {
						newPosition = event;
					
					} else {
						// console.log("blend", percentFinished, blend(prevEvent, event, percentFinished));
						
						// console.log("blend", prevEvent, event, percentFinished);
						newPosition = blend(prevEvent, event, percentFinished);	
						// console.log("T", newPosition);
					}
					// console.log("FEW", newPosition);
					// console.log(actor.body.position);
					// console.log("D", actor.body.position.x);
					scene.scene.position = newPosition.position;
					scene.scene.rotation = newPosition.rotation;
					// console.log("Dw", actor.body.position.x);
					// console.log(actor.body);
					// console.log("df", newPosition);
				}
			}
			scene.renderFrame(frameIndex);
			
		}
		for(var i = 0; i < this.actors.length; i++) {
			var actor = this.actors[i];
			var prevFrame = null;
			for(var j = 0; j < actor.events.length; j++) {
				var event = actor.events[j];
				var frame = event.frame;
				var source = null; // previous frame
				var target = null; // target frame
				// console.log(event, frameIndex, event.frame);
				prevEvent = actor.events[j-1];
				console.log("G", prevEvent);
				console.log(actor.events);
				if(typeof(prevEvent) === "undefined") {
					prevEvent = {
						"frame":0,
						position: actor.position
					};
				} else {
					console.log("T");
				}
				
				 console.log(frameIndex, "PrevEvent", prevEvent.frame, event.frame,  frameIndex <= event.frame);
				if(frameIndex > prevEvent.frame && frameIndex <= event.frame) {
					console.log("FCT");
					var percentFinished =  (frameIndex -prevEvent.frame) / (event.frame - prevEvent.frame);
					console.log("%", percentFinished);
					var newPosition = null;
					if(typeof(prevEvent) === "undefined") {
						newPosition = event;
					
					} else {
						// console.log("blend", percentFinished, blend(prevEvent, event, percentFinished));
						
						// console.log("blend", prevEvent, event, percentFinished);
						newPosition = blend(prevEvent, event, percentFinished);	
						// console.log("T", newPosition);
					}
					// console.log("FEW", newPosition);
					// console.log(actor.body.position);
					// console.log("D", actor.body.position.x);
					actor.body.position = newPosition.position;
					actor.body.rotation = newPosition.rotation;
					// console.log("Dw", actor.body.position.x);
					// console.log(actor.body);
					// console.log("df", newPosition);
				}
			}
		}
		
		for(var i = 0; i < this.objects.length; i++) {
			var object = this.objects[i];
			for(var j = 0; j < object.events.length; j++) {
				var event = object.events[i];
				var frame = event.frame;
				var source = null; // previous frame
				var target = null; // target frame
				// console.log(event, frameIndex, event.frame);
				prevEvent = object.events[i-1];
				console.log(object.events);
				console.log(preEvent);
				if(typeof(prevEvent) === "undefined") {
					prevEvent = {
						"frame":0,
						position: object.position
					};
				} else {
					console.log("A");
				}
				// console.log(frameIndex, "PrevEvent", prevEvent.frame, event.frame,  frameIndex <= event.frame);
				if(frameIndex >= prevEvent.frame && frameIndex <= event.frame) {
				
					var percentFinished =  frameIndex / (event.frame - prevEvent.frame) ;
					
					var newPosition = null;
					if(typeof(prevEvent) === "undefined") {
						newPosition = event;
					
					} else {
						// console.log("blend", percentFinished, blend(prevEvent, event, percentFinished));
						
						// console.log("blend", prevEvent, event, percentFinished);
						newPosition = blend(prevEvent, event, percentFinished);	
						// console.log("T", newPosition);
					}
					// console.log("FEW", newPosition);
					// console.log(actor.body.position);
					// console.log("D", actor.body.position.x);
					object.body.position = newPosition.position;
					object.body.rotation = newPosition.rotation;
					// console.log("Dw", actor.body.position.x);
					// console.log(actor.body);
					// console.log("df", newPosition);
				}
			}
		}
	};
	if(typeof(sceneObj.actors) !== "undefined") {
		for(var i = 0; i < sceneObj.actors.length; i++) {
			console.log("F");
			var actor = sceneObj.actors[i];
			var _actor = new Actor(actor, this);
			this.actors.push(_actor);
			this.scene.add(_actor.body);
		}
	}
	if(typeof(sceneObj.objects) !== "undefined") {
		for(var i = 0; i < sceneObj.objects.length; i++) {
		console.log("F");
			var _object = sceneObj.objects[i];
			var obj = new SObject(_object, this);
			this.objects.push(obj);
			this.scene.add(obj.body);
		}
	}
}
function Actor(actorObj, scene) {
	this.actorObj = actorObj;
	this.scene = scene;
	
	var material = new THREE.MeshBasicMaterial({
		  color: 0xFFFFFF,
		  map: THREE.ImageUtils.loadTexture(actorObj.material),
		  transparent: true
	});
	var head = new THREE.Mesh(new THREE.SphereGeometry(20, 30, 5, 50), material);
	var hands = [new THREE.Mesh(new THREE.SphereGeometry(5, 30, 5, 50), material),
		new THREE.Mesh(new THREE.SphereGeometry(5, 30, 5, 50), material)];
		
	var foots = [new THREE.Mesh(new THREE.SphereGeometry(5, 30, 5, 50), material),
		new THREE.Mesh(new THREE.SphereGeometry(5, 30, 5, 50), material)];
	head._parent = this;
	hands[0]._parent = this;
	hands[0].type = "hand";
	hands[1].type = "hand";
	hands[1]._parent = this;
	
	foots[0]._parent = this;
	foots[0].type = "foot";
	foots[1].type = "foot";
	foots[1]._parent = this;
	head.type = "head";
	head.position.x = 75;
	head.position.y = 0;
	head.position.z = 0;
	foots[0].position.x = 12;
	foots[0].position.y = 0;
	foots[0].position.z = 0;
	foots[1].position.x = -50;
	foots[1].position.y = -32;
	foots[1].position.z = 0;
	hands[0].position.x = 50;
	hands[0].position.y = -32;
	hands[0].position.z = 0;
	hands[1].position.x = 150;
	hands[1].position.y = 50;
	hands[1].position.z = 0;
	
	this.body = new THREE.Object3D();
	this.body.add(head);
	this.body.add(hands[0]);
	this.body.add(hands[1]);
	this.body.add(foots[0]);
	this.body.position = actorObj.position;
	this.position = actorObj.position;
	/*this.__defineGetter__("position", function () {
		return this.body.position;
	});
	this.__defineGetter__("rotation", function () {
		return this.body.rotation;
	});
	this.__defineSetter__("position", function (position) {
		this.body.position = position;
	});
	this.__defineSetter__("rotation", function (rotation) {
		this.body.rotation = rotation;
	});*/
	this.body.add(foots[1]);
	// console.log("ActorObj", actorObj);
	this.events = actorObj.events;
	console.log(this.events);
}	
function SObject(objectObj, scene) {
	this.obj = objectObj;
	this.scene = scene;
	/** 
	@function step 
	**/
	this.step = function(event) {
		
	};
	this.body = new THREE.Object3D();
	for(var i = 0; i < objectObj.parts.length; i++) {
		var material = new THREE.MeshBasicMaterial({
		  color: 0xFFFFFF,
		  map: THREE.ImageUtils.loadTexture(objectObj.parts[i].material),
		});
		var part = objectObj.parts[i];
		var block = new THREE.Mesh(new THREE.CubeGeometry(part.width, part.height, part.depth), this.material);
		this.body.add(block);
		block.position = block.position;
		block.rotation = block.rotation;
		
	}
	this.events = objectObj.events;
	this.position = objectObj.position;
	this.body.position = objectObj.position;
	this.body.rotation = objectObj.rotation;
}
function gameTick () {
}
var currentScene = null;
window.onload = function() {
	
	// Test blend
	
	var angularSpeed = 0.2; // revolutions per second
	var lastTime = 0;
	setInterval( gameTick, 10);
	
	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	document.body.appendChild(renderer.domElement);
	
	var movie1 = new Movie("movies/test");
	currentMovie = movie1;
	movie1.setScene(0);
	//movie1.play();
	// request new frame
	// request new frame
	requestAnimFrame(function(){
		animate(lastTime);
	});
	
	
};
