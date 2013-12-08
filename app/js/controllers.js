'use strict';

/* Controllers */

var myGoApp = angular.module('myGoApp', []);

myGoApp.controller('goBoardCtrl', function($scope) {
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
		if (place.color == "e") {
			place.color = ($scope.isBlacksTurn)?"b":"w";
			
			place.group = [place];
			
			updateArea(place);
			
			$scope.isBlacksTurn = !$scope.isBlacksTurn;
		}
	}
	
	$scope.size = size;
	$scope.xPad = 8;
	$scope.yPad = 7;
	$scope.places = places;
	$scope.board = board;
});