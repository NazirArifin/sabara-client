'use strict';

/* pelanggan controller */
function PelangganCtrl($scope, $http, $cookies, $location, loader, $routeParams) {
	if ( ! $scope.checkUser()) $scope.disconnect();
	$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
	
	$scope.curMenu = 1;
	$scope.submenu = $scope.getSubMenu();
	$scope.getParentTitle = function() { return $scope.menu[$scope.curMenu].title; };
	$scope.getItemTitle = function(i) { return $scope.menu[$scope.curMenu].item[i].title; };
	
	$scope.file = null;
	
	// unit
	$scope.unit = [];
	$scope.loadUnit = function() {
		$http({ url: $scope.server + '/unit', method: 'GET' }).
		success(function(d) { 
			$scope.unit.push({ id: 0, kode: '', nama: '-- pilih unit --' });
			for (var i in d) { $scope.unit.push(d[i]); }
		});
	};
	$scope.loadUnit();
	
	// datapelanggan
	if ($scope.submenu == 'data') {
		$scope.datapel = {};
		$scope.resetDataPel = function(d) { $scope.datapel = { unit: $scope.myUnit(), idpel: '', nometer: '' }; };
		
		$scope.datapelanggan = [];
		$scope.setDataPel = function(d) { $scope.datapel = d; };
		
		$scope.loadPelanggan = function() {
			if ($scope.datapel.unit == 0) return alertify.error('Anda belum memilih Unit');
			if ($scope.datapel.idpel == '' && $scope.datapel.nometer == '') return alertify.error('Anda harus mengisi salah satu input');
			loader.show();
			$http({ url: $scope.server + '/listpelanggan?' + jQuery.param($scope.datapel), method: 'GET' }).
			success(function(d) {
				loader.hide();
				if (d.length == 0)  {
					alertify.error('Tidak ada data yang ditampilkan');
					$scope.datapelanggan = d;
				} else {
					$scope.datapelanggan = d;
				}
			}).
			error(function(e, s, h) { loader.hide(); });
		}
		
		if (angular.isUndefined($scope.datapel.unit)) $scope.resetDataPel();
	}
	
	// detail
	if ($scope.submenu == 'detail') {
		$scope.detail = {};
		$scope.historyList = [];
		$scope.history = {};
		$scope.resetHistory = function() { 
			$scope.history = { id: $routeParams.Idpel, cpage: 0, numpage: 0 };
		}; $scope.resetHistory();
		$scope.showHistory = false;
		$scope.toggleHistory = function() { $scope.showHistory = ! $scope.showHistory; };
		$scope.loadHistory = function() {
			loader.show();
			$http({ url: $scope.server + '/history?' + jQuery.param($scope.history), method: 'GET' }).
			success(function(d) {
				loader.hide();
				$scope.historyList = d.data;
				$scope.history.numpage = d.numpage;
			}).error(function(e, s, h) { loader.hide(); });
		}; $scope.loadHistory();
		$scope.loadDetail = function() {
			$http({ url: $scope.server + '/pelanggan/detail/' + $routeParams.Idpel, method: 'GET' }).
			success(function(d) { $scope.detail = d; });
		}; $scope.loadDetail();
		
		$scope.getId = function() { return $routeParams.Idpel; };
		
		// pagination history
		$scope.range = function(start, end)  {
			var r = [];
			if ( ! end) {
				end = start; start = 0;
			}
			for (var i = start; i < end; i++) r.push(i);
			return r;
		};
		$scope.setPage = function() {
			$scope.history.cpage = this.n;
			$scope.loadHistory();
		};
		$scope.prevPage = function() {
			if ($scope.history.cpage > 0)
				$scope.history.cpage--;
			$scope.loadHistory();
		};
		$scope.nextPage = function() {
			if ($scope.history.cpage < $scope.history.numpage - 1)
				$scope.history.cpage++;
			$scope.loadHistory();
		};
	}
	
	// impor tusbung
	if ($scope.submenu == 'npp') {
		$scope.npp = { jenis: '' };
		$scope.result = { file: '', numdata: 0 };
	}
	
	// tunggak
	if ($scope.submenu == 'tunggak') {
		$scope.tunggak = {
			unit: $scope.myUnit(), keyword: ''
		};
	}
}
PelangganCtrl.$inject = ['$scope', '$http', '$cookies', '$location', 'loader', '$routeParams'];
