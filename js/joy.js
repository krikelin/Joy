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
		console.log(txt);
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
	 console.log(e);
	
	if(e.keyIdentifier === "U+0057") {
		move_z = 0;
		
	} 
	if(e.keyIdentifier === "U+0053") {
		move_z = 0;
		
	} 
};
window.onkeydown = function (e) {
	 console.log(e);
	
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
	
	this.url = url;
	this.playing = null;
	this.currentScene  = {};
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
	this.play = function () {
	};
	this.setScene = function (index) {
		this.currentScene = this.scenes[index];
	};
}

var STEP_LENGTH = 60 / 500;
function Scene (sceneObj, movie) {
	this.motions = [];
	
	this.sceneObj = sceneObj;
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 11000);
	this.camera.position = sceneObj.camera.position;
	this.camera.rotation = sceneObj.camera.rotation;
	this.actors = [];
	this.objects = [];
	this.events = [];
	/***
	@function renderFrame
	@description Renders the frame
	***/
	this.renderFrame = function(frameIndex) {
		
		for(var i = 0; i < this.actors.length; i++) {
			var actor = this.actors[i];
			var prevFrame = null;
			for(var j = 0; j < actor.events.length; j++) {
				var event = actor.events[i];
				var frame = event.frame;
				var source = null; // previous frame
				var target = null; // target frame
				console.log(event, frameIndex, event.frame);
				prevEvent = actor.events[i-1];
				if(typeof(prevEvent) === "undefined") {
					prevEvent = {
						"frame":0,
						position: actor.position
					};
				}
				console.log(frameIndex, "PrevEvent", prevEvent.frame, event.frame,  frameIndex <= event.frame);
				if(frameIndex >= prevEvent.frame && frameIndex <= event.frame) {
				
					var percentFinished =  frameIndex / (event.frame - prevEvent.frame) ;
					
					var newPosition = null;
					if(typeof(prevEvent) === "undefined") {
						newPosition = event;
					
					} else {
						console.log("blend", percentFinished, blend(prevEvent, event, percentFinished));
						
						console.log("blend", prevEvent, event, percentFinished);
						newPosition = blend(prevEvent, event, percentFinished);	
						console.log("T", newPosition);
					}
					console.log("FEW", newPosition);
					console.log(actor.body.position);
					console.log("D", actor.body.position.x);
					actor.body.position = newPosition.position;
					actor.body.rotation = newPosition.rotation;
					console.log("Dw", actor.body.position.x);
					console.log(actor.body);
					console.log("df", newPosition);
				}
			}
		}
		
		for(var i = 0; i < this.objects.length; i++) {
			var actor = this.objects[i];
			for(var j = 0; j < actor.events.length; j++) {
				var frame = event.frame;
				var source = null; // previous frame
				var target = null; // target frame
				if(event.frame == Math.floor(frameIndex)) {
					source = event;
					
				}
				if(event.frame == Math.ceil(frameIndex)) {
					target = event;
					
					var percentFinished =  (frameIndex - source) / target;
					
					
					if(source == null) {
						source = this.position;
					}
					var newPosition = blend(source, target, percentFinished);
					
					actor.body.position = newPosition.position;
					actor.body.rotation = newPosition.rotation;
					console.log("POS", actor.body.position);
					
				}
			}
		}
	};
	for(var i = 0; i < sceneObj.actors.length; i++) {
		var actor = sceneObj.actors[i];
		var _actor = new Actor(actor, this);
		this.actors.push(_actor);
		this.scene.add(_actor.body);
	}
	for(var i = 0; i < sceneObj.objects.length; i++) {
		var _object = sceneObj.objects[i];
		var obj = new SObject(_object, this);
		this.objects.push(obj);
		this.scene.add(obj.body);
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
	var head = new THREE.Mesh(new THREE.SphereGeometry(120, 30, 5, 50), material);
	var hands = [new THREE.Mesh(new THREE.SphereGeometry(120, 30, 5, 50), material),
		new THREE.Mesh(new THREE.SphereGeometry(120, 30, 5, 50), material)];
		
	var foots = [new THREE.Mesh(new THREE.SphereGeometry(120, 30, 5, 50), material),
		new THREE.Mesh(new THREE.SphereGeometry(120, 30, 5, 50), material)];
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
	foots[1].position.y = 150;
	foots[1].position.z = 0;
	hands[0].position.x = 50;
	hands[0].position.y = 0;
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
	console.log("ActorObj", actorObj);
	this.events = actorObj.events;
	
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
	// request new frame
	// request new frame
	requestAnimFrame(function(){
		animate(lastTime);
	});
	movie1.currentScene.renderFrame(3);
	
};
