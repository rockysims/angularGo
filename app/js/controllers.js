'use strict';

/* Controllers */

var myGoApp = angular.module('myGoApp', []);
myGoApp.controller('goBoardCtrl', function($scope) {
	var board = [];
	var places = [];
	var size = 9;
	
	for (var i = 0; i < size; i++) {
		board[i] = [];
		for (var j = 0; j < size; j++) {
			board[i][j] = {
				'id': (i+1)*j,
				'color': "e",
				'x': i,
				'y': j
			};
			places[i*size+j] = board[i][j];
		}
	}
	
	
	
	$scope.size = size;
	$scope.xPad = 7;
	$scope.yPad = 7;
	$scope.places = places;
	$scope.board = board;
});