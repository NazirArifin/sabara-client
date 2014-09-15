'use strict';

/* data controller */
function DataCtrl($scope, $http, $cookies, $location, loader) {
	if ( ! $scope.checkUser()) $scope.disconnect();
	$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
	
	$scope.curMenu = 0;
	$scope.submenu = $scope.getSubMenu();
	$scope.getParentTitle = function() { return $scope.menu[$scope.curMenu].title; };
	$scope.getItemTitle = function(i) { return $scope.menu[$scope.curMenu].item[i].title; };
	$scope.getUnit = function() {
		return (angular.isUndefined($scope.user.nama_unit) ? '' : $scope.user.nama_unit);
	};
	
	// range pagination
	$scope.range = function(start, end)  {
		var r = [];
		if ( ! end) {
			end = start; start = 0;
		}
		for (var i = start; i < end; i++) r.push(i);
		return r;
	};
	
	// cari bulan tahun
	$scope.blth = [];
	$scope.getblth = function() {
		$http({ url: $scope.server + '/blth', method: 'GET' }).
		success(function(d) { 
			for (var i in d) {
				if (d[i].status == '1') {
					$scope.ekspor.blth = d[i].id;
					break;
				}
			}
			$scope.blth = d; 
		});
	};
	$scope.file = null;
	
	// unit
	if ($scope.submenu == 'unit') {
		$scope.unitList = [];
		$scope.unit = {}
		$scope.resetUnit = function() { $scope.unit = { id: 0, 'kode': '', nama: '' }; }; $scope.resetUnit();
		$scope.loadUnit = function() {
			$http({ url: $scope.server + '/unit', method: 'GET' }).
			success(function(d) { $scope.unitList = d; }).
			error(function(e, s, h) { 
				if (s.status == 401) { $scope.$apply(function() { $scope.disconnect(); }); }
			});
		};
		$scope.loadUnit();
		$scope.setUnit = function(i) { $scope.unit = $scope.unitList[i]; };
	}
	
	// gardu
	if ($scope.submenu == 'gardu') {
		$scope.unit = [];
		$scope.loadUnit = function() {
			$http({ url: $scope.server + '/unit', method: 'GET' }).
			success(function(d) { 
				$scope.unit.push({ id: 0, kode: '', nama: '-- pilih unit --' });
				for (var i in d) { $scope.unit.push(d[i]); }
			});
		};
		$scope.getcurUnit = function() {
			for (var i = 0; i < $scope.unit.length; i++) {
				if ($scope.unit[i].id == $scope.gardu.unit) 
					return $scope.unit[i].nama; 
			}
		};
		$scope.loadUnit();
		$scope.gardu = {};
		$scope.egardu = {};
		$scope.garduList = [];
		$scope.presetGardu = function() {
			$scope.gardu = { unit: $scope.myUnit(), cpage: 0, numpage: 0 };
		}; $scope.presetGardu();
		$scope.loadGardu = function() {
			loader.show();
			if ($scope.gardu.unit == 0) return alertify.error('Anda belum memilih unit');
			$http({ url: $scope.server + '/gardu?' + jQuery.param($scope.gardu), method: 'GET' }).
			success(function(d) { $scope.garduList = d.data; $scope.gardu.numpage = d.numpage; loader.hide(); }).
			error(function(e, s, h) { loader.hide(); });
		};
		if ( ! $scope.needUnit()) $scope.loadGardu();
		
		$scope.setGardu = function(i) { 
			$scope.egardu = $scope.garduList[i];
			$scope.editing = true;
		};
		$scope.resetGardu = function() { 
			$scope.egardu = { id: 0, unit: $scope.gardu.unit, nama: '' };
			$scope.editing = false;
		}; $scope.resetGardu();
		
		// pagination gardu
		$scope.setPage = function() {
			$scope.gardu.cpage = this.n;
			$scope.loadGardu();
		};
		$scope.prevPage = function() {
			if ($scope.gardu.cpage > 0)
				$scope.gardu.cpage--;
			$scope.loadGardu();
		};
		$scope.nextPage = function() {
			if ($scope.gardu.cpage < $scope.gardu.numpage - 1)
				$scope.gardu.cpage++;
			$scope.loadGardu();
		};
		
		// mode edit gardu
		$scope.editing = false;
		// load map
		$scope.koordinat = {};
		$scope.resetKoordinat = function() {
			$scope.koordinat = { data: [], center: [] };
		}; $scope.resetKoordinat();
		$scope.setKoordinat = function(d) { $scope.koordinat = d; };
		$scope.mapParams = {};
	}
	
	// rbm
	if ($scope.submenu == 'rbm') {
		$scope.rbm = {};
		$scope.erbm = {};
		$scope.rbmList = [];
		$scope.unit = [];
		$scope.resetRbm = function() { $scope.rbm =  { unit: $scope.myUnit(), keyword: '', cpage: 0, numpage: 0 }; };
		$scope.resetRbm2 = function() {
			$scope.erbm = { id: '', nama: '', petugas: '', unit: '' };
		}; $scope.resetRbm2();
		$scope.loadUnit = function() {
			$http({ url: $scope.server + '/unit', method: 'GET' }).
			success(function(d) { 
				$scope.unit.push({ id: 0, kode: '', nama: '-- pilih unit --' });
				for (var i in d) { $scope.unit.push(d[i]); }
			});
		};
		$scope.getcurUnit = function() {
			for (var i = 0; i < $scope.unit.length; i++) {
				if ($scope.unit[i].id == $scope.rbm.unit) 
					return $scope.unit[i].nama; 
			}
		};
		
		$scope.petugasList = [];
		$scope.loadPetugas = function() {
			$http({ url: $scope.server + '/petugas/unit/' + $scope.rbm.unit, method: 'GET' }).
			success(function(d) { $scope.petugasList = d; });
		};
		
		$scope.editing = false;
		$scope.row = 0;
		$scope.setPetugas = function(i) {
			if ($scope.editing) {
				$scope.editing = false;
				$scope.row = 0;
			} else {
				$scope.editing = true;
				$scope.row = i;
			}
		};
		$scope.updatePetugas = function(i) {
			loader.show();
			$http({ url: $scope.server + '/rbm', method: 'POST', data: $scope.rbmList[i] }).
			success(function(d) {
				$scope.rbmList[i] = d;
				loader.hide();
				$scope.editing = false;
				$scope.row = 0;
			}).error(function(e, s, h) { loader.hide(); });
			$scope.$apply();
		};
		
		$scope.loadRbm = function() {
			if ($scope.rbm.unit == '0') return alertify.error('Anda belum memilih unit');
			loader.show();
			$http({ url: $scope.server + '/rbm?' + jQuery.param($scope.rbm), method: 'GET' }).
			success(function(d) {
				if (d.numpage == 0) alertify.error('Tidak ada data yang ditampilkan');
				loader.hide();
				$scope.rbmList = d.data;
				$scope.rbm.numpage = d.numpage;
				$scope.loadPetugas();
			}).error(function(e, s, h) { loader.hide(); });
		};
		$scope.loadUnit();
		$scope.resetRbm();
		if ( ! $scope.needUnit()) $scope.loadRbm();
		
		// pagination rbm
		$scope.setPrevious = function() {
			var p = $scope.rbm.cpage - 1;
			if (p < 0) return;
			$scope.rbm.cpage--;
			$scope.loadRbm();
		};
		$scope.setNext = function() {
			var n = $scope.rbm.cpage + 1;
			if (n > $scope.rbm.numpage - 1) return;
			$scope.rbm.cpage++;
			$scope.loadRbm();
		};
		
		/*
		// petugas tiap unit
		$scope.petugas = [];
		$scope.loadPetugas = function() {
			$http({ url: $scope.server + '/petugas/unit/' + $scope.rbm.unit, method: 'GET' }).
			success(function(d) { $scope.petugas = d; });
		}
		$scope.$watch('rbm.unit', function(newValue, oldValue) {
			if (newValue === oldValue) return;
			if (newValue == 0) return;
			$scope.loadPetugas();
		});
		
		$scope.setRbm = function(i) { 
			$scope.erbm.id = $scope.rbmList[i].id; 
			$scope.erbm.nama = $scope.rbmList[i].nama;
			$scope.erbm.petugas = $scope.rbmList[i].petugas;
		};*/
		
		// load map
		$scope.koordinat = {};
		$scope.resetKoordinat = function() {
			$scope.koordinat = { data: [], center: [] };
		}; $scope.resetKoordinat();
		$scope.setKoordinat = function(d) { $scope.koordinat = d; };
		$scope.mapParams = {};
	}
	
	// impor data dari pln
	$scope.impor = { tipe: '1' };
	if ($scope.submenu == 'impor') {
		$scope.result = { unit: '', tipe: '', blth: '', jumlah: 0, file: '' };
		$scope.setResult = function(d) { $scope.result = d; }
		$scope.progress = 0;
		$scope.setProgress = function(d) { $scope.progress = d; }
	}

	// ekspor data ke pln
	$scope.kdproses = [];
	$scope.ekspor = { unit: $scope.myUnit(), blth: '', tgl: new Date().toString('dd/MM/yyyy'), kode: 0 };
	$scope.loadKdProses = function() {
		$http({ url: $scope.server + '/kodeproses', method: 'GET' }).
		success(function(d) {
			$scope.kdproses.push({ id: 0, kode: '', nama: '-- kode proses --' });
			for (var i in d) $scope.kdproses.push(d[i]);
		});
	};
	if ($scope.submenu == 'ekspor') {
		$scope.getblth();
		$scope.loadKdProses();
		$scope.unit = [];
		$scope.loadUnit = function() {
			$http({ url: $scope.server + '/unit', method: 'GET' }).
			success(function(d) { 
				$scope.unit.push({ id: 0, kode: '', nama: '-- pilih unit --' });
				for (var i in d) { $scope.unit.push(d[i]); }
			});
		};
		$scope.loadUnit();
	}
}
DataCtrl.$inject = ['$scope', '$http', '$cookies', '$location', 'loader'];