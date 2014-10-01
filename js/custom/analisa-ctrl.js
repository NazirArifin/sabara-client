'use strict';

/* analisa controller */
function AnalisaCtrl($scope, $http, $cookies, $location, loader) {
	if ( ! $scope.checkUser()) $scope.disconnect();
	$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
	
	$scope.curMenu = 4;
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
	$scope.loadUnit();
	
	// blth
	$scope.blth = [];
	$scope.getblth = function() {
		$http({ url: $scope.server + '/blth', method: 'GET' }).
		success(function(d) { 
			for (var i in d) {
				if (d[i].status == '1') {
					$scope.adlpd.blth = $scope.catat.blth1 = $scope.catat.blth2 = $scope.arbm.blth = $scope.atarif.blth = d[i].id;
					break;
				}
			}
			$scope.blth = d; 
		});
	}; $scope.getblth();
	
	// dlpd
	$scope.adlpd = {};
	if ($scope.submenu == 'dlpd') {
		$scope.checked = [];
		$scope.dlpd = [];
		$scope.getDlpd = function() {
			$http({ url: $scope.server + '/dlpd/filter', method: 'GET' }).
			success(function(d) { 
				for (var i = 0; i < d.length; i++)
					$scope.checked[i] = false;
				$scope.dlpd = d; 
			});
		}; $scope.getDlpd();
		$scope.resetAdlpd = function() {
			$scope.adlpd = { unit: $scope.myUnit(), blth: '', rbm: '' };
		}; $scope.resetAdlpd();
		
		$scope.rbmList = [];
		$scope.loadRBM = function() {
			$http({ url: $scope.server + '/rbm/unit/' + $scope.adlpd.unit, method: 'GET' }).
			success(function(d) { $scope.rbmList = d; });
		};
		if ($scope.myUnit() != 0) $scope.loadRBM();
		
		// periksa yang dicheck
		$scope.getChecked = function() {
			var ids = [];
			for (var i = 0; i < $scope.checked.length; i++) {
				if ($scope.checked[i]) {
					ids.push($scope.dlpd[i].id);
				}
			}
			return ids;
		};
		
		$scope.getParam = function() {
			return jQuery.param({unit: $scope.adlpd.unit, blth: $scope.adlpd.blth, dlpd: $scope.getChecked(), rbm: $scope.adlpd.rbm});
		};
		
		$scope.dlpdList = [];
		$scope.loadDLPD = function() {
			if ($scope.adlpd.unit == 0) return alertify.error('Anda belum memilih unit');
			var checked = $scope.getChecked();
			if (checked.length == 0) return alertify.error('Anda belum memilih DLPD');
			loader.show();
			var get = { unit: $scope.adlpd.unit, blth: $scope.adlpd.blth, rbm: $scope.adlpd.rbm, dlpd: checked };
			
			$http({ url: $scope.server + '/listdlpd?' + jQuery.param(get), method: 'GET' }).
			success(function(d) { 
				loader.hide(); 
				$scope.dlpdList = d;
				if (d.length == 0) alertify.error('Tidak ada data yang ditampilkan');
			}).
			error(function(e, s, h) { loader.hide(); });
		};
	}
	
	// cetak rekap pencatatan
	$scope.catat = {};
	if ($scope.submenu == 'lbkb') {
		$scope.resetCatat = function() { $scope.catat = { unit: $scope.myUnit(), blth1: '', blth2: '' };
		}; $scope.resetCatat();
		
		$scope.rekap = { data: [], total: 0 };
		$scope.loadRekap = function() {
			if ($scope.catat.unit == 0) return alertify.error('Anda belum memilih unit');
			loader.show();
			$http({ url: $scope.server + '/listrekaplbkb?' + jQuery.param($scope.catat), method: 'GET' }).
			success(function(d) {
				loader.hide(); 
				$scope.rekap = d;
				$scope.setLoadGraph(1);
			}).error(function(e, s, h) { loader.hide(); })
		};
		
		$scope.loadGraph = 0;
		$scope.setLoadGraph = function(d) { $scope.loadGraph = d; };
		$scope.getParam = function() { return jQuery.param($scope.catat); };
	}
	
	// analisa per rbm
	$scope.arbm = {};
	if ($scope.submenu == 'rbm') {
		$scope.rbmList = [];
		
		$scope.resetArbm = function() {
			$scope.arbm = { unit: $scope.myUnit(), blth: '', kdproses: '' };
		}; $scope.resetArbm();
		
		$scope.kdproses = [];
		$scope.loadKdProses = function() {
			$http({ url: $scope.server + '/kodeproses', method: 'GET' }).
			success(function(d) {
				$scope.kdproses.push({ id: '', kode: '', nama: '-- kode proses --' });
				for (var i in d) $scope.kdproses.push(d[i]);
			});
		}; $scope.loadKdProses();
		
		$scope.loadData = function() {
			if ($scope.arbm.unit == 0) return alertify.error('Anda belum memilih unit');
			if ($scope.arbm.kdproses == '') return alertify.error('Anda belum memilih kode proses');
			loader.show();
			$http({ url: $scope.server + '/analisa/rbm?' + jQuery.param($scope.arbm), method: 'GET' }).
			success(function(d) {
				loader.hide();
				$scope.rbmList = d;
			});
		};
		
		$scope.getURL = function() { return jQuery.param($scope.arbm); };
	}
	
	$scope.atarif = {};
	if ($scope.submenu == 'tarif') {
		$scope.rbmList = [];
		
		$scope.resetAtarif = function() {
			$scope.atarif = { unit: $scope.myUnit(), blth: '', kdproses: '' };
		}; $scope.resetAtarif();
		
		$scope.kdproses = [];
		$scope.loadKdProses = function() {
			$http({ url: $scope.server + '/kodeproses', method: 'GET' }).
			success(function(d) {
				$scope.kdproses.push({ id: '', kode: '', nama: '-- kode proses --' });
				for (var i in d) $scope.kdproses.push(d[i]);
			});
		}; $scope.loadKdProses();
		
		$scope.loadData = function() {
			if ($scope.arbm.unit == 0) return alertify.error('Anda belum memilih unit');
			if ($scope.arbm.kdproses == '') return alertify.error('Anda belum memilih kode proses');
			loader.show();
			$http({ url: $scope.server + '/analisa/tarif?' + jQuery.param($scope.atarif), method: 'GET' }).
			success(function(d) {
				loader.hide();
				$scope.rbmList = d;
			});
		};
		
		$scope.getURL = function() { return jQuery.param($scope.atarif); };
	}
}
AnalisaCtrl.$inject = ['$scope', '$http', '$cookies', '$location', 'loader'];