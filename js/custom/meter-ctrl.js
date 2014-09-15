'use strict';

/* meter controller */
function MeterCtrl($scope, $http, $cookies, $location, loader) {
	if ( ! $scope.checkUser()) $scope.disconnect();
	$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
	
	$scope.curMenu = 2;
	$scope.submenu = $scope.getSubMenu();
	$scope.getParentTitle = function() { return $scope.menu[$scope.curMenu].title; };
	$scope.getItemTitle = function(i) { return $scope.menu[$scope.curMenu].item[i].title; };
	$scope.file = null;
	
	// cari bulan tahun
	$scope.blth = [];
	$scope.getblth = function() {
		$http({ url: $scope.server + '/blth', method: 'GET' }).
		success(function(d) { $scope.blth = d; });
	}; $scope.getblth();
	$scope.setBlth = function(d) { $scope.blth = d; };
	
	if ($scope.submenu == 'blth') { 
		$scope.bt = {};
		$scope.resetBt = function() { 
			$scope.bt = { id: 0, nama: '', status: 1 }; 
		}; $scope.resetBt();
		$scope.editBlth = function(i) { 
			var s = $scope.blth[i];
			$scope.bt = { id: s.id, nama: s.nama, status: s.status };
		};
	}
	
	// unit
	$scope.unit = [];
	$scope.loadUnit = function() {
		$http({ url: $scope.server + '/unit', method: 'GET' }).
		success(function(d) { 
			$scope.unit.push({ id: 0, kode: '', nama: '-- pilih unit --' });
			for (var i in d) { $scope.unit.push(d[i]); }
		});
	};
	
	// entry dan koreksi
	$scope.entry = {};
	$scope.koreksi = {};
	if ($scope.submenu == 'entry') {
		$scope.rbmList = [];
		$scope.loadUnit();
		
		$scope.resetEntry = function() {
			$scope.entry = { unit: $scope.myUnit(), rbm: '', idpel: '', nometer: '' };
		}; $scope.resetEntry();
		
		// apakah ganda
		$scope.isGanda = function(tarif, daya) {
			if (tarif.length == 0) return;
			var d = parseInt(daya), t = tarif.toLowerCase();
			return (d > 200000 || t == 'i2');
		};
		
		$scope.loadRBM = function() {
			$http({ url: $scope.server + '/rbm/unit/' + $scope.entry.unit, method: 'GET' }).
			success(function(d) { $scope.rbmList = d; });
		};
		if ($scope.myUnit() != 0) $scope.loadRBM();
		
		$scope.ketbaca = [];
		$scope.loadKetBaca = function() {
			$http({ url: $scope.server + '/ketbaca', method: 'GET' }).
			success(function(d) { $scope.ketbaca = d; });
		}; $scope.loadKetBaca();
		
		// list pelanggan
		$scope.pelangganList = [];
		$scope.setPelangganList = function(d) { $scope.pelangganList = d; };
		$scope.resetPelangganList = function() { $scope.pelangganList = []; };
		
		// pelanggan
		$scope.pelanggan = {};
		$scope.resetPelanggan = function() {
			$scope.pelanggan = { idpel: '', nama: '', tarif: '', daya: '', alamat: '', latitude: '', longitude: '', lwbp0: '', lwbp: '', plwbp: '', wbp0: '', wbp: '', pwbp: '', kvarh0: '', kvarh: '', pkvarh: '', ketbaca: '' }
		}; $scope.resetPelanggan();
		$scope.setPelanggan = function(d) { $scope.pelanggan = d; };
		
		// koreksi
		$scope.resetKoreksi = function() {
			$scope.koreksi = { idpel: '', nometer: '' };
		}; $scope.resetKoreksi();
		
		// pelanggan untuk koreksi
		$scope.plggn = {};
		$scope.resetPlggn = function() {
			$scope.plggn = { idpel: '', nama: '', tarif: '', daya: '', alamat: '', latitude: '', longitude: '', lwbp0: '', lwbp: '', plwbp: '', wbp0: '', wbp: '', pwbp: '', kvarh0: '', kvarh: '', pkvarh: '', ketbaca: '', foto: '' }
		}; $scope.resetPlggn();
		$scope.setPlggn = function(d) { $scope.plggn = d; };
	}
	
	// hasil pembacaan
	$scope.hp = {}
	if ($scope.submenu == 'impor') {
		$scope.rbmList = [];
		$scope.loadUnit();
		
		$scope.resetHp = function() {
			$scope.hp = { unit: $scope.myUnit(), rbm: '', tgl: new Date().toString('dd/MM/yyyy') };
			$scope.baca = { total: 0, data: [], tidaknormal: 0 };
		}; $scope.resetHp();
		
		$scope.loadRBM = function() {
			$scope.hp.rbm = '';
			$http({ url: $scope.server + '/rbm/unit/' + $scope.hp.unit, method: 'GET' }).
			success(function(d) { $scope.rbmList = d; });
		};
		if ($scope.myUnit() != 0) $scope.loadRBM();
		
		$scope.baca = {};
		$scope.setUpload = function() { $scope.upload = ! $scope.upload; };
		
		$scope.report = { total: 0, normal: 0, keterangan: 0 };
		$scope.setReport = function(d) { $scope.report = d; };
		
		$scope.loadBaca = function() {
			if ($scope.hp.rbm == '') return alertify.error('Anda belum mengisi RBM');
			loader.show();
			$http({ url: $scope.server + '/bacarbm/' + $scope.hp.rbm + '/' + $scope.hp.tgl.replace(/\//g, ''), method: 'GET' }).
			success(function(d) { 
				$scope.baca = d;
				loader.hide();
				if (d.data.length == 0) alertify.error('Tidak ada data untuk tanggal ini');
			});
		};
	}
	
	if ($scope.submenu == 'foto') {
		$scope.numfiles = '';
		$scope.setNumFiles = function(d) { $scope.numfiles = d; };
	}
}
DataCtrl.$inject = ['$scope', '$http', '$cookies', '$location', 'loader'];