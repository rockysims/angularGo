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
				'liberties': "",
				'x': x,
				'y': y
			};
			places[x*size+y] = board[x][y];
		}
	}
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
	
	var updateAdjacent = function(place) {
		var adjacents = getAdjacentPlaces(place);
		for (var i in adjacents) {
			place = adjacents[i];
			if (place.color != "e")
				place.liberties = calcLiberties(place);
		}
	};
	
	$scope.isBlacksTurn = true;
	$scope.placeStone = function(place) {
		if (place.color == "e") {
			place.color = ($scope.isBlacksTurn)?"b":"w";
			
			place.liberties = calcLiberties(place);
			updateAdjacent(place);
			
			$scope.isBlacksTurn = !$scope.isBlacksTurn;
		}
	}
	
	$scope.size = size;
	$scope.xPad = 8;
	$scope.yPad = 7;
	$scope.places = places;
	$scope.board = board;
});