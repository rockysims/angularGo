'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myGoApp.services', []).
  value('version', '0.1');



/*

var myGo = angular.module('myGoApp', []);

myGo.factory('timer', function() {
	var shinyNewServiceInstance;
	//factory function body that constructs shinyNewServiceInstance
	return shinyNewServiceInstance;
});





//*/




