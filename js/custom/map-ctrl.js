'use strict';

/* map controller */
function MapCtrl($scope, $http, $cookies, $location, loader, $routeParams) {
	if ( ! $scope.checkUser()) $scope.disconnect();
	$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
	
	$scope.type = '';
	$scope.param = '';
	$scope.getMapType = function() {
		var path = $location.path().split('/');
		$scope.type = path[2];
		$scope.param = path[3];
	}; $scope.getMapType();
}