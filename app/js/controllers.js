'use strict';

/* Controllers */

var myGoApp = angular.module('myGoApp', []);
myGoApp.controller('goBoard', function($scope) {
	var EMPTY = 0;
	var BLACK = 1;
	var WHITE = 2;
	
	var board = [];
	var size = 9;
	
	for (var i = 0; i < size; i++) {
		board[i] = [];
		for (var j = 0; j < size; j++) {
			board[i][j] = i*j;
			//board[i][j] = 33; //TODO: uncomment out this line to reproduce bug where the whole board table disappears
			board[0][2] = 98765;
		}
	}
	
	
	$scope.c = $scope.c++ || 1;
	
	$scope.board = board;
});