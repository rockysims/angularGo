'use strict';

/* Utilities */
var arrayRemove = function(ary, e) {
	if (typeof(ary) == 'undefined') 
		alert("arrayRemove(): Error: typeof(ary) == 'undefined'.");
//	if (typeof(ary) != 'array') 
//		throw "arrayRemove(): Error: typeof(ary) != 'array'.";
	var index = ary.indexOf(e);
	if (index > -1) {
	    ary.splice(index, 1);
	}
	
	if (typeof(ary) == 'undefined') 
		alert("arrayRemove(): Error: return undefined");
		
	return ary;
};

var arrayMerge = function(a1, a2) {
	var a = a1.concat(a2);
	for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i] === a[j])
				a.splice(j--, 1);
		}
	}
	
	return a;
};
/* Utilities ^^ */

/* Go game logic */

/* TODO
map liberties to size of stone image
onHover, display 50% opacity stone
ko rule
suicide rule
move stack (board snapshots)
	undo, redo buttons


Later:
mark potential, false, and complete eyes
mark cutting points and protected points like tiger's mouth
mark forcing moves
onHover, show change in liberties, enemy liberties removed, territory gained (range)?
*/

var EMPTY = "e";
var BLACK = "b";
var WHITE = "w";

//wraps a place on the board which could have a stone
var Place = function(x, y) {
	this.x = x;
	this.y = y;
	this.color = EMPTY;
	this.group = new Group(this);
	this.adjacentPlaces = []; //populated by Board constructor
	this.size = 45; //used as width and height in pixels
};

Place.prototype.refreshSize = function() {
	var liberties = this.group.liberties.length;
	var mapLibToSize = [];
	mapLibToSize[1] = 30;
	mapLibToSize[2] = 35;
	mapLibToSize[3] = 40;
	mapLibToSize[4] = 45;
	mapLibToSize[5] = 50;
	mapLibToSize[6] = 55;
	mapLibToSize[7] = 60;
	if (liberties > 7) 
		liberties = 7;
	
	this.size = mapLibToSize[liberties];
};

//Group wraps an array of places
var nextGroupId = 0;
var Group = function(place) {
	this.id = nextGroupId++;
	this.liberties = [];
	this.color = place.color;
	this.stones = (place != null)?[place]:[];
	
	if (this.color != EMPTY) {
		//add adjacent stones/liberties to this group recursively
		var checkAdjacentPlacesRecurs = function(center, group) {
			var a, i;
			for (i in center.adjacentPlaces) {
				a = center.adjacentPlaces[i];
				
				if (group.stones.indexOf(a) == -1) {
					//adjacent stone not already part of group
					
					//add place as liberty (if not already added)
					if (a.color == EMPTY) {
						if (group.liberties.indexOf(a) == -1)
							group.liberties.push(a);
					}
					//add place as stone (if not already added)
					if (a.color == group.color) {
						if (group.stones.indexOf(a) == -1)
							group.stones.push(a);
						a.group = group;
						checkAdjacentPlacesRecurs(a, group);
					}
				}
			}
		};
		checkAdjacentPlacesRecurs(place, this);
	}
};
//*/

var Board = function(size) {
	this.size = size;
	this.moves = ['emptyBoard'];
	this.places = [];
	var places = this.places;
	
	this.prisoners = [];
	this.prisoners['b'] = 0;
	this.prisoners['w'] = 0;
	
	//fill places[] = new Place
	var x, y;
	for (x = 0; x < size; x++) {
		for (y = 0; y < size; y++) {
			places[y*size+x] = new Place(x, y);
		}
	}
	
	//fill places[].adjacents[] = the (usually) 4 adjacent places
	for (var x = 0; x < size; x++) {
		for (var y = 0; y < size; y++) {
			var a, adjacents = [];
			if ((a = this.getPlaceByXY(x+1, y)) != null) adjacents.push(a);
			if ((a = this.getPlaceByXY(x-1, y)) != null) adjacents.push(a);
			if ((a = this.getPlaceByXY(x, y+1)) != null) adjacents.push(a);
			if ((a = this.getPlaceByXY(x, y-1)) != null) adjacents.push(a);
			
			this.getPlaceByXY(x, y).adjacentPlaces = adjacents;
		}
	}
};

Board.prototype.refreshGroups = function() {
	var i;
	var p;
	for (i in this.places) {
		p = this.places[i];
		p.group = null;
	}
	
	for (i in this.places) {
		p = this.places[i];
		if (p.group == null) {
			p.group = new Group(p);
		}
	}
	
	//update stone sizes to match liberties
	for (i in this.places) {
		p = this.places[i];
		if (p.color != EMPTY)
			p.refreshSize();
	}
};

Board.prototype.getPlaceByXY = function(x, y) {
	var size = this.size;
	var places = this.places;
	if (x >= 0 && x < size && y >= 0 && y < size)
		return places[y*size+x];
	else
		return null;
};

Board.prototype.getTurnColor = function() {
	var moves = this.moves;
	var isBlacksTurn = moves[moves.length - 1].indexOf("b") != 0;
	return (isBlacksTurn)?"b":"w";
};

Board.prototype.placeStone = function(place) {
	if (place.color == EMPTY) {
		var color = this.getTurnColor();
		
		place.color = color;
		
		this.moves.push(color + place.x + "," + place.y);
		
		//capture stones?
		var i;
		var a;
		for (i in place.adjacentPlaces) {
			a = place.adjacentPlaces[i];
			if (a.group.color != "e") {
				a.group = new Group(a); //refresh group info about the adjacent stone a
				if (a.group.liberties.length == 0) {
					//capture(a.group);
					var j;
					var p;
					for (j in a.group.stones) {
						p = a.group.stones[j];
						this.prisoners[p.color]++;
						p.color = "e";
					}
				}
			}
		}
		
		//refresh groups
		this.refreshGroups();
	}
};

Board.prototype.pass = function() {
	var color = this.getTurnColor();
	this.moves.push(color + "Pass");
};

Board.prototype.undo = function() {
	alert('TODO: implement board.undo()');
};
/* Go game logic ^^ */

/* Controllers */

var myGoApp = angular.module('myGoApp', []);

myGoApp.controller('testCtrl', function($scope) {
	$scope.test = 0;
});

myGoApp.controller('goBoardCtrl', function($scope) {
	var size = 13;
	var squareSize = 60;
	$scope.board = new Board(size);
	var board = $scope.board;
	$scope.size = size;
	$scope.squareSize = squareSize;
	$scope.placeStone = function(place) {
		board.placeStone(place);
		$scope.debugPlace = place;
	};
	$scope.places = board.places; //shortcut
	$scope.hoveredPlace = null; //TODO: change to = false?
	
	$scope.alert = function(s) {alert(s)};
});





