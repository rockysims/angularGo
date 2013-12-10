'use strict';

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

Place.prototype.liberties = function() {
	if (this.group != null) {
		
	} else
		return 0
	return this.group.liberties.length;
};

//Group wraps an array of places
var Group = function(place) {
	this.stones = [place];
	this.liberties = [];
	this.color = place.color;
	
	var a, i;
	
	//fill liberties[]
	for (i in place.adjacentPlaces) {
		a = place.adjacentPlaces[i];
		if (a.color == EMPTY)
			this.liberties.push(a);
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
	//merge with adjacent groups
	for (i in place.adjacentPlaces) {
		a = place.adjacentPlaces[i];
		
		//merge stones
		if (this.color == a.color) {
			//merge liberties
			this.liberties = arrayUnique(this.liberties, a.group.liberties);
			//merge stones
			this.stones = arrayUnique(this.stones, a.group.stones);
			a.group = this;
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
	var isBlacksTurn = moves[moves.length - 1].indexOf("w") == 0;
	return (isBlacksTurn)?"b":"w";
};

Board.prototype.placeStone = function(place) {
	if (place.color == EMPTY) {
		var color = this.getTurnColor();
		
		place.group = new Group(place);
		
		place.color = color;
		this.moves.push(color + place.x + "," + place.y);
	}
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