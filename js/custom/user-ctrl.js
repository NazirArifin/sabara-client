'use strict';

/* user controller */
function UserCtrl($scope, $http, $cookies, $location, loader) {
	if ( ! $scope.checkUser()) $scope.disconnect();
	$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
	
	$scope.curMenu = 5;
	$scope.submenu = $scope.getSubMenu();
	$scope.getParentTitle = function() { return $scope.menu[$scope.curMenu].title; };
	$scope.getItemTitle = function(i) { return $scope.menu[$scope.curMenu].item[i].title; };
	
	// unit
	$scope.unit = [];
	$scope.loadUnit = function() {
		$http({ url: $scope.server + '/unit', method: 'GET' }).
		success(function(d) { 
			$scope.unit.push({ id: 0, kode: '', nama: '-- pilih unit --' });
			for (var i in d) { $scope.unit.push(d[i]); }
		});
	};
	
	$scope.range = function(start, end)  {
		var r = [];
		if ( ! end) {
			end = start; start = 0;
		}
		for (var i = start; i < end; i++) r.push(i);
		return r;
	};
	
	if ($scope.submenu == 'petugas' || $scope.submenu == 'koordinator') {
		$scope.crpetugas = {};
		$scope.loadUnit();
		$scope.modePetugas = 'show';
		$scope.crpetugas = { nama: '', unit: $scope.myUnit(), cpage: 0, numpage: 0 };
		$scope.petugasList = [];
		
		// petugas
		$scope.petugas = {};
		$scope.resetPetugas = function() {
			$scope.modePetugas = 'show';
			$scope.petugas = { id: 0, nama: '', id_unit: 0, username: '', password: '', password2: '' };
		}; $scope.resetPetugas();
		$scope.setPetugas = function(i, t) { 
			$scope.modePetugas = t;
			$scope.petugas = $scope.petugasList[i]; 
		};
		
		$scope.searchPetugas = function() {
			$scope.crpetugas.cpage = 0;
			$scope.loadPetugas();
		};
		$scope.loadPetugas = function() {
			loader.show();
			$http({ url: $scope.server + '/' + $scope.submenu + '?' + jQuery.param($scope.crpetugas), method: 'GET' }).
			success(function(d) { 
				$scope.petugasList = d.user; 
				$scope.crpetugas.numpage = d.numpage; 
				loader.hide(); 
			}).
			error(function(e, s, h) { loader.hide(); });
		};
		$scope.setPage = function() {
			$scope.crpetugas.cpage = this.n;
			$scope.loadPetugas();
		};
		$scope.prevPage = function() {
			if ($scope.crpetugas.cpage > 0)
				$scope.crpetugas.cpage--;
			$scope.loadPetugas();
		};
		$scope.nextPage = function() {
			if ($scope.crpetugas.cpage < $scope.crpetugas.numpage - 1)
				$scope.crpetugas.cpage++;
			$scope.loadPetugas();
		};
	}
	
	if ($scope.submenu == 'administrator' || $scope.submenu == 'observer') {
		$scope.modeAdmin = 'show';
		$scope.adminList = [];
		
		// admin
		$scope.admin = {};
		$scope.resetAdmin = function() {
			$scope.modeAdmin = 'show';
			$scope.admin = { id: 0, username: '', password: '', password2: '' };
		}; $scope.resetAdmin();
		$scope.setAdmin = function(i, t) { 
			$scope.modeAdmin = t;
			$scope.admin = $scope.adminList[i]; 
		};
		
		$scope.loadAdmin = function() {
			loader.show();
			$http({ url: $scope.server + '/' + $scope.submenu, method: 'GET' }).
			success(function(d) { $scope.adminList = d; loader.hide(); }).
			error(function(e, s, h) { loader.hide(); });
		}; $scope.loadAdmin();
	}
}
UserCtrl.$inject = ['$scope', '$http', '$cookies', '$location', 'loader'];