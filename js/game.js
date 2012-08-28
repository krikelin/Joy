var points = 0;var lives = 3;
var coins = 0;
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
	
	camera.aspect = window.innerWidth / window.innerHeight;
	renderer.render(scene, camera);
	// request new frame
	requestAnimFrame(function(){
		animate(lastTime);
	});
}
var move_z = 0;
var move_x = 0;
var move_y = 0;
function gameTick () {
	
	camera.position.z += move_z;
	
}
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
function loadTileSet(url) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url+"?c=" + Math.random(), false);
	xmlHttp.send(null);
	tileset = eval("(" + xmlHttp.responseText + ")");
}
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
	console.log(camera.z);
};
window.onkeydown = function (e) {
	 console.log(e);
	
	if(e.keyIdentifier === "U+0057") {
		move_z = -100;
		
	} 
	if(e.keyIdentifier === "U+0053") {
		move_z = +100;
		
	} 
	console.log(camera.z);
};
window.onload = function() {
	
	var angularSpeed = 0.2; // revolutions per second
	var lastTime = 0;
	setInterval( gameTick, 10);
	
	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 11000);
	camera.position.z = 3700;
	camera.position.y = -002;
	camera.rotation.y = -.5;
	document.body.appendChild(renderer.domElement);
	var earthMaterial = new THREE.MeshBasicMaterial({
		  color: 0xFFFFFF,
		  map: THREE.ImageUtils.loadTexture("img/earth.jpeg"),
		  transparent: true
	});
	
	var planet1 = new THREE.Mesh(new THREE.SphereGeometry(510, 50, 50), earthMaterial);
	planet1.position.x = 4330;
	planet1.position.y = 0;
	planet1.position.z = 0;
	
	var planet2 = new THREE.Mesh(new THREE.SphereGeometry(510, 50, 50), earthMaterial);
	planet2.position.x = 0;
	planet2.position.y = 0;
	planet2.position.z = 0;
	scene.add(planet1);
	scene.add(planet2);
	
	// request new frame
	// request new frame
	requestAnimFrame(function(){
		animate(lastTime);
	});
	
	
};
