'use strict';

/* main controller */
function MainCtrl($scope, $http, $cookies, $location, loader) {
	$scope.user = {};
	$scope.setUser = function(d) {
		for (var i in d) {
			$scope.user[i] = d[i];
			$cookies[i] = d[i];
		}
	};
	$scope.checkUser = function() {
		if ( ! angular.isUndefined($cookies.id)) {
			for (var i in $cookies) {
				$scope.user[i] = $cookies[i];
			}
			return true;
		} else return false;
	};
	$scope.disconnect = function() {
		$scope.user = $scope.petugas = {};
		if ($scope.showSitemap) $scope.showSitemap = false;
		for (var i in $cookies) delete $cookies[i];
		$location.path('/login').replace();
	};
	
	// sitemap toggle
	$scope.showSitemap = false;
	$scope.toggleSitemap = function() {
		$scope.showSitemap = ! $scope.showSitemap;
	};
	
	// get path
	$scope.getPath = function() {
		var c = $location.path().substring(1) || 'home';
		if (c.indexOf('/') != -1)
			return c.split('/')[0];
		return c;
	};
	
	// tampilkan menu berdasarkan hak
	$scope.menuShow = function(arr, id) {
		id = parseInt(id);
		return jQuery.inArray(id, arr) != -1;
	};
	
	// mencari submenu
	$scope.getSubMenu = function() { 
		var l = $location.path().split('/');
		return l[l.length-1];
	};
	
	// apakah admin
	$scope.needUnit = function() { return angular.isUndefined($scope.user.id_unit); };
	$scope.myUnit = function() { 
		return (typeof($scope.user.id_unit) == 'undefined' ? 0 : $scope.user.id_unit); 
	};
	
	// password
	$scope.passtoedit = {};
	$scope.resetPassToEdit = function() {
		$scope.passtoedit = { pass1: '', pass2: '' };
	}; $scope.resetPassToEdit();
}
MainCtrl.$inject = ['$scope', '$http', '$cookies', '$location'];
  
/* login controller */
function LoginCtrl($scope, $location, $http, loader) {
	if ($scope.checkUser()) {
		$location.path('/home').replace();
	}
	
	// ping
	$scope.ping = function() {
		loader.show();
		$http({ url: $scope.server + '/ping?version=' + $scope.versi + '&subversion=' + $scope.subversi, method: 'GET' }).
		success(function(d) { 
			if (d.status == 'PASSED') loader.hide();
			else {
				loader.hide();
				$('#old-version').fadeIn();
			}
		}).
		error(function(e, s, h) {
			alertify.log('Tidak dapat terhubung dengan server. Pastikan Anda terhubung dengan internet', 'error', 0);
		});
	};
	$scope.ping();
	
	// login
	$scope.userform = { username: '', password: '' };
}
LoginCtrl.$inject = ['$scope', '$location', '$http', 'loader'];

/* home controller */
function HomeCtrl($scope, $location, $http, $routeParams, $cookies) {
	if ( ! $scope.checkUser()) $scope.disconnect();
	$scope.submenu = new Number($routeParams.menuId) || 0;
	
	
}
HomeCtrl.$inject = ['$scope', '$location', '$http', '$routeParams', '$cookies'];

