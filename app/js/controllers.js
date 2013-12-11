'use strict';

/* Utilities */
var arrayRemove = function(ary, e) {
//	if (typeof(ary) != 'array') 
//		throw "arrayRemove(): Error: typeof(ary) != 'array'.";
	var index = ary.indexOf(e);
	if (index > -1) {
	    ary.splice(index, 1);
	}
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
var Group = function(place) {
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
			}
		}
		//remove place from liberties because place is now a filled liberty
		var liberties;
		for (i in place.adjacentPlaces) {
			a = place.adjacentPlaces[i];
			liberties = a.group.liberties;
			a.group.liberties = arrayRemove(liberties, place);
		}
		
		var p;
		for (i in place.group.stones) {
			p = place.group.stones[i];
			p.group = this;
		}
	}
};





var Board = function(size) {
	this.size = size;
	this.moves = ['emptyBoard'];
	this.places = [];
	var places = this.places;
	
	//fill places[] = new Place
	var x, y;
	for (x = 0; x < size; x++) {
		for (y = 0; y < size; y++) {
			places[x*size+y] = new Place(x, y);
		}
	}
	
	//fill places[].adjacents[] = the (usually) 4 adjacent places
	var getPlaceByXY = function(x, y) {
		if (x >= 0 && x < size && y >= 0 && y < size)
			return places[x*size+y];
		else
			return null;
	};
	for (var x = 0; x < size; x++) {
		for (var y = 0; y < size; y++) {
			var a, adjacents = [];
			if ((a = getPlaceByXY(x+1, y)) != null) adjacents[adjacents.length] = a;
			if ((a = getPlaceByXY(x-1, y)) != null) adjacents[adjacents.length] = a;
			if ((a = getPlaceByXY(x, y+1)) != null) adjacents[adjacents.length] = a;
			if ((a = getPlaceByXY(x, y-1)) != null) adjacents[adjacents.length] = a;
			
			getPlaceByXY(x, y).adjacentPlaces = adjacents;
		}
	}
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
	} 
	//*
	else {
		var i;
		var p;

		for (i in this.places) {
			p = this.places[i];
			p.debug = "red";
		}
		
		for (i in place.group.liberties) {
			p = place.group.liberties[i];
			p.debug = "green";
		}
		
		for (i in place.group.stones) {
			p = place.group.stones[i];
			p.debug = "yellow";
		}
	}
	//*/
};

Board.prototype.pass = function() {
	var color = this.getTurnColor();
	this.moves.push(color + "Pass");
};
/* Go game logic ^^ */

/* Controllers */

var myGoApp = angular.module('myGoApp', []);

myGoApp.controller('testCtrl', function($scope) {
	$scope.test = 0;
});

myGoApp.controller('goBoardCtrl', function($scope) {
	var size = 9;
	$scope.board = new Board(size);
	var board = $scope.board;
	$scope.size = size;
	$scope.placeStone = function(place) {
		board.placeStone(place);
	};
	$scope.places = board.places; //shortcut
	
	$scope.alert = function(s) {alert(s)};
});




/*

var board = [];
var places = [];
var size = 9;

for (var x = 0; x < size; x++) {
	board[x] = [];
	for (var y = 0; y < size; y++) {
		board[x][y] = {
			'uniqueId': (x+1)*size+y,
			'color': "e",
			'group': [],
			'liberties': "",
			'groupLiberties': 0,
			'x': x,
			'y': y
		};
		places[x*size+y] = board[x][y];
	}
}

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

var getPlace = function(x, y) {
	if (x >= 0 && x < size && y >= 0 && y < size)
		return board[x][y];
	else
		return null;
};

var getAdjacentPlaces = function(place) {
	var adjacent = [];
	var p, x = place.x, y = place.y;
	
	p = getPlace(x+1, y);
	if (p != null) adjacent.push(p);
	p = getPlace(x-1, y);
	if (p != null) adjacent.push(p);
	p = getPlace(x, y+1);
	if (p != null) adjacent.push(p);
	p = getPlace(x, y-1);
	if (p != null) adjacent.push(p);
	
	return adjacent;
};

var calcLiberties = function(place) {
	var adjacents = getAdjacentPlaces(place);
	var liberties = 0;
	for (var i in adjacents) {
		if (adjacents[i].color == "e")
			liberties++;
	}
	
	return liberties;
};

var mergeGroups = function(g1, g2) {
	var g = arrayUnique(g1.concat(g2));
	
	for (var i in g) {
		g[i].group = g;
	}
	
	return g;
};

var updateGroupLiberties = function(place) {
	//update groupLiberties
	var p, groupLiberties = 0;
	for (var i in place.group) {
		p = place.group[i];
		groupLiberties += p.liberties;
	}
	for (var i in place.group) {
		p = place.group[i];
		p.groupLiberties = groupLiberties;
	}
}

var updateArea = function(centerPlace) {
	centerPlace.liberties = calcLiberties(centerPlace);
	
	var adjacents = getAdjacentPlaces(centerPlace);
	var place;
	
	//update adjacent stone liberties
	for (var i in adjacents) {
		place = adjacents[i];
		if (place.color != "e")
			place.liberties = calcLiberties(place);
	}
	
	//update group
	for (var i in adjacents) {
		place = adjacents[i];
		if (centerPlace.color == place.color) {
			mergeGroups(place.group, centerPlace.group);
		}
	}
	
	//update group liberties of area
	updateGroupLiberties(centerPlace);
	for (var i in adjacents) {
		place = adjacents[i];
		if (place.color != "e") {
			updateGroupLiberties(place);
		}
	}
};

$scope.isBlacksTurn = true;
$scope.placeStone = function(place) {
	//board.placeStone(place);
	if (place.color == "e") {
		place.color = ($scope.isBlacksTurn)?"b":"w";
		
		place.group = [place];
		
		updateArea(place);
		
		$scope.isBlacksTurn = !$scope.isBlacksTurn;
	}
}

$scope.size = size;
$scope.places = places;
$scope.board = board;

//*/