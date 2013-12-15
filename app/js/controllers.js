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
var arrayUnique = function(array) {
	var a = array.concat();
	for(var i=0; i<a.length; ++i) {
		for(var j=i+1; j<a.length; ++j) {
			if(a[i] === a[j])
				a.splice(j--, 1);
		}
	}
	
	return a;
};
var arrayMerge = function(a1, a2) {
	return arrayUnique(a1.concat(a2));
};
/* Utilities ^^ */

/* Go game logic */
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
};

//Group wraps an array of places
var nextGroupId = 0;
var Group = function(place) {
	this.id = nextGroupId++;
	this.stones = [place];
	this.liberties = [];
	this.color = place.color;
	
	var a, i;
	
	if (place.color != EMPTY) {
		//fill liberties[]
		for (i in place.adjacentPlaces) {
			a = place.adjacentPlaces[i];
			if (a.color == EMPTY)
				this.liberties.push(a);
		}
		
		//merge with adjacent groups
		for (i in place.adjacentPlaces) {
			a = place.adjacentPlaces[i];
			
			//merge stones
			if (this.color == a.color) {
				//merge liberties
				this.liberties = arrayMerge(this.liberties, a.group.liberties);
				//merge stones
				this.stones = arrayMerge(this.stones, a.group.stones);
				a.group = this;
				
				//update .group of all stones in a.group
				var s;
				for (i in a.group.stones) {
					s = a.group.stones[i];
					s.group = this;
				}
			}
		}
		//remove place from liberties because place is now a filled liberty
		var liberties;
		for (i in place.adjacentPlaces) {
			a = place.adjacentPlaces[i];
			
			if (typeof(a) == 'undefined')
				alert("a is undefined");
			
			liberties = a.group.liberties;
			if (typeof(liberties) == 'undefined')
				alert("liberties is undefined");
			a.group.liberties = arrayRemove(liberties, place);
		}
	}
};





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
			if ((a = this.getPlaceByXY(x+1, y)) != null) adjacents[adjacents.length] = a;
			if ((a = this.getPlaceByXY(x-1, y)) != null) adjacents[adjacents.length] = a;
			if ((a = this.getPlaceByXY(x, y+1)) != null) adjacents[adjacents.length] = a;
			if ((a = this.getPlaceByXY(x, y-1)) != null) adjacents[adjacents.length] = a;
			
			this.getPlaceByXY(x, y).adjacentPlaces = adjacents;
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
	var moves = this.moves;
	var isBlacksTurn = moves[moves.length - 1].indexOf("b") != 0;
	return (isBlacksTurn)?"b":"w";
};

Board.prototype.placeStone = function(place) {
	if (place.color == EMPTY) {
		var color = this.getTurnColor();

		place.color = color;
		place.group = new Group(place);
		
		this.moves.push(color + place.x + "," + place.y);
		
		//capture stones?
		var i;
		var a;
		for (i in place.adjacentPlaces) {
			a = place.adjacentPlaces[i];
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
	$scope.hoveredPlace = null;
	
	$scope.alert = function(s) {alert(s)};
});





