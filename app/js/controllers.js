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
move stack (board snapshots)
	undo, redo buttons
onHover, display 50% opacity stone
ko rule
suicide rule


Later:
mark cutting points and protected points like tiger's mouth
mark forcing moves
mark dead stones
mark potential, false, and complete eyes
outline living stones
onHover, show change in liberties, enemy liberties removed, territory gained (range)?
maybe show group's theoretical liberty (as if virtual connections were resolved)
for each place, add 30% opacity background (above board and below stone) where how black/white it is shows influence
	influence calculated as if each group emits up to 4 empty spaces away (black and white light cancel out)
		100% of liberties for closest empty space and 25% for 4th empty space away
*/

var EMPTY = "e";
var BLACK = "b";
var WHITE = "w";

//wraps a place on the board which could have a stone
var Place = function(x, y, board) {
	this.x = x;
	this.y = y;
	this.board = board;
	this.color = EMPTY;
	this.group = new Group(this);
	this.size = 45; //used as width and height in pixels
};

Place.prototype.getAdjacentPlaces = function() {
	var x = this.x;
	var y = this.y;
	var board = this.board;
	var adjacents = [];
	var a;
	
	//check for cached adjacents
	if (this.adjacents != null)
		return this.adjacents;
	
	if ( (a = board.getPlaceByXY(x+1, y)) != null ) adjacents.push(a);
	if ( (a = board.getPlaceByXY(x-1, y)) != null ) adjacents.push(a);
	if ( (a = board.getPlaceByXY(x, y+1)) != null ) adjacents.push(a);
	if ( (a = board.getPlaceByXY(x, y-1)) != null ) adjacents.push(a);
	
	this.adjacents = adjacents;
	return this.adjacents;
};

//Group represents an array of places all of the same color
var nextGroupId = 0;
var Group = function(place) {
	this.id = nextGroupId++; //a unique this.id seems to make it much easier for angular to test if two groups are equal
	this.liberties = [];
	this.color = place.color;
	if (place == null)
		alert("place == null in Group constructor");
	this.stones = (place != null)?[place]:[]; //TODO: consider changing to = [place] without conditional
	
	if (this.color != EMPTY) {
		//add adjacent stones/liberties to this group recursively
		var checkAdjacentPlacesRecurs = function(center, group) {
			var a, i;
			for (i in center.getAdjacentPlaces()) {
				a = (center.getAdjacentPlaces())[i];
				
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

var nextBoardId = 0;
var Board = function(size) {
	this.id = nextBoardId++;
	this.size = size;
	this.turnCount = 0;
	this.history = [];
	this.future = [];
	this.prisoners = [];
	this.prisoners['b'] = 0;
	this.prisoners['w'] = 0;
	this.places = [];
	var places = this.places;
	
	//fill places[] = new Place
	var x, y;
	for (x = 0; x < size; x++) {
		for (y = 0; y < size; y++) {
			places[y*size+x] = new Place(x, y, this);
		}
	}
	
	this.history.push(this.getState());
};

Board.prototype.refresh = function() {
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
	return (this.turnCount % 2 == 0)?"b":"w";
};

Board.prototype.placeStone = function(x, y) {
	var color = this.getTurnColor();
	var place = this.getPlaceByXY(x, y);
	
	var validMove = place.color == EMPTY;
	if (validMove) {
		place.color = color;
		this.turnCount++;
		this.resolveCaptures(place);
		this.history.push(this.getState());
		this.future = [];
	}
	this.refresh();
};

Board.prototype.getState = function() {
	var size = this.size;
	var state = {};
	state.turnCount = this.turnCount;
	state.prisoners = [];
	state.prisoners['b'] = this.prisoners['b'];
	state.prisoners['w'] = this.prisoners['w'];
	
	//get color of all this.places[]
	state.placeColors = [];
	var x, y, p;
	for (x = 0; x < size; x++) {
		for (y = 0; y < size; y++) {
			p = this.places[y*size+x];
			state.placeColors[y*size+x] = p.color;
		}
	}
	
	return state;
};

Board.prototype.setState = function(state) {
	var size = this.size;
	this.turnCount = state.turnCount;
	this.prisoners = state.prisoners;
	
	//set color of all this.places[]
	var x, y, p;
	for (x = 0; x < size; x++) {
		for (y = 0; y < size; y++) {
			p = this.places[y*size+x];
			p.color = state.placeColors[y*size+x];
		}
	}
	
	this.refresh();
};

Board.prototype.pass = function() {
	this.turnCount++;
	this.history.push(this.getState());
};

Board.prototype.undo = function() {
	if (this.history.length > 1) { //the first item in this.history is a blank board so no need to undo from there
		this.future.push(this.history.pop());
		var state = this.history[this.history.length-1];
		this.setState(state);
	}
};

Board.prototype.redo = function() {
	if (this.future.length > 0) {
		this.history.push(this.future.pop());
		var state = this.history[this.history.length-1];
		this.setState(state);
	}
};

Board.prototype.resolveCaptures = function(lastPlacePlayed) {
	var place = lastPlacePlayed;
	var adjacentPlaces = place.getAdjacentPlaces();
	var i;
	var a;
	
	for (i in adjacentPlaces) {
		a = adjacentPlaces[i];
		if (a.group.color != "e") {
			a.group = new Group(a); //refreshes group info about the adjacent stone a and any other stones in the same group
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
};

var GoGame = function (size) {
	this.board = new Board(size);
};

GoGame.prototype.placeStone = function(x, y) {
	this.board.placeStone(x, y);
};
/* Go game logic ^^ */

/* Controllers */

var myGoApp = angular.module('myGoApp', []);

myGoApp.controller('testCtrl', function($scope) {
	$scope.test = 0;
});

myGoApp.controller('goGameCtrl', function($scope) {
	var size = 13;
	var squareSize = 60;
	$scope.size = size;
	$scope.squareSize = squareSize;
	
	$scope.game = new GoGame(size);
	var game = $scope.game;
	
	$scope.placeStone = function(place) {
		game.placeStone(place.x, place.y);
		$scope.debugPlace = place;
	};
	$scope.getPlaces = function() {
		return game.board.places;
	};
	$scope.getBoard = function() {
		return game.board;
	};
	$scope.pass = function() {
		game.board.pass();
	}
	$scope.undo = function() {
		game.board.undo();
	}
	$scope.redo = function() {
		game.board.redo();
	}
	
	$scope.alert = function(s) {alert(s)};
});

/*
myGoApp.controller('goBoardCtrl', function($scope) {
	var size = 13;
	var squareSize = 60;
	$scope.board = new Board(size);
	var board = $scope.board;
	$scope.size = size;
	$scope.squareSize = squareSize;
	$scope.placeStone = function(place) {
		board.placeStone(place.x, place.y);
		$scope.debugPlace = place;
	};
	$scope.places = board.places; //shortcut
	$scope.hoveredPlace = null; //TODO: change to = false?
	
	$scope.alert = function(s) {alert(s)};
});

//*/



