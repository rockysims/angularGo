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
				'x': x,
				'y': y
			};
			places[x*size+y] = board[x][y];
		}
	}
	
	$scope.isBlacksTurn = true;
	$scope.placeStone = function(place) {
		if (place.color == "e") {
			place.color = ($scope.isBlacksTurn)?"b":"w";
			$scope.isBlacksTurn = !$scope.isBlacksTurn;
		}
	}
	
	$scope.size = size;
	$scope.xPad = 8;
	$scope.yPad = 7;
	$scope.places = places;
	$scope.board = board;
});