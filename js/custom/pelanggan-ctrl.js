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
		// detil atau map
		$scope.showMap = true;
		$scope.showDetail = false;
		$scope.showMapContainer = function() {
			$scope.showDetail = false;
			$scope.showMap = true;
		};
		
		$scope.tunggak = {
			unit: $scope.myUnit(), keyword: '', cpage: 0
		};
		$scope.numpage = 0;
		$scope.rbmList = [];
		$scope.loadRbm = function() {
			loader.show();
			$scope.showDetail = false;
			$http({ method: 'GET', url: $scope.server + '/tunggakan?' + jQuery.param($scope.tunggak) }).
			success(function(d) {
				loader.hide();
				$scope.rbmList = d.data;
				$scope.numpage = d.numpage;
			});
		};
		
		// pagination rbm
		$scope.setPrevious = function() {
			var p = $scope.tunggak.cpage - 1;
			if (p < 0) return;
			$scope.tunggak.cpage--;
			$scope.loadRbm();
		};
		$scope.setNext = function() {
			var n = $scope.tunggak.cpage + 1;
			if (n > $scope.tunggak.numpage - 1) return;
			$scope.tunggak.cpage++;
			$scope.loadRbm();
		};
		
		// load Detail
		$scope.listDetail = [];
		$scope.currentRbm = '';
		$scope.loadDetail = function(nama) {
			$scope.currentRbm = nama;
			loader.show();
			$scope.showDetail = false;
			$http({ method: 'GET', url: $scope.server + '/tunggakan/detail/' + nama }).
			success(function(d) {
				loader.hide();
				if (d.length == 0) return alertify.error('Tidak ada data di RBM');
				$scope.listDetail = d;
				$scope.showDetail = true;
				$scope.showMap = false;
			});
		};
		
		$scope.koordinat = {};
		$scope.resetKoordinat = function() {
			$scope.koordinat = { data: [], center: [] };
		}; $scope.resetKoordinat();
		$scope.setKoordinat = function(d) { $scope.koordinat = d; };
		
		// tombol lunas dan cetak
		$scope.setCetakLunas = function(i, t) {
			loader.show();
			$http({ url: $scope.server + '/tusbung/' + (t == 1 ? 'cetak' : 'lunas') + '/' + $scope.listDetail[i].id, method: 'GET' }).
			success(function(d) {
				loader.hide();
				if (d.status == 1) {
					$scope.listDetail[i].status = 1;
					alertify.success('Data berhasil diubah');
				}
				if (t == 2) $scope.loadDetail($scope.currentRbm);
			});
		};
	}
	
	if ($scope.submenu == 'monitoring') {
		$scope.rbmList = [];
		$scope.hp = {
			unit: $scope.myUnit(), rbm: '', tgl: new Date().toString('dd/MM/yyyy')
		};
		$scope.loadRBM = function() {
			$scope.hp.rbm = '';
			$http({ url: $scope.server + '/rbm/unit/' + $scope.hp.unit, method: 'GET' }).
			success(function(d) { $scope.rbmList = d; });
		};
		if ($scope.myUnit() != 0) $scope.loadRBM();
		
		// load data tusbung
		$scope.tusbung = [];
		$scope.loadTusbung = function() {
			loader.show();
			$http({
				url: $scope.server + '/tusbung?' + jQuery.param($scope.hp), method: 'GET'
			}).
			success(function(d) {
				loader.hide();
				if (d.length == 0) {
					$scope.tusbung = d;
					return alertify.error('Tidak ada data yang ditampilkan!');
				}
				$scope.tusbung = d;
			});
		};
		
		// tombol lunas dan cetak
		$scope.setLunas = function(i) {
			loader.show();
			$http({ url: $scope.server + '/tusbung/lunas/' + $scope.tusbung[i].id, method: 'GET' }).
			success(function(d) {
				loader.hide();
				if (d.status == 1) {
					alertify.success('Data berhasil diubah');
					$scope.loadTusbung();
				}
			});
		};
	}
	
	if ($scope.submenu == 'laporan') {
		$scope.report = {
			unit: $scope.myUnit(), blth: ''
		};
		$scope.blth = [];
		$scope.getblth = function() {
			$http({ url: $scope.server + '/blth', method: 'GET' }).
			success(function(d) { 
				for (var i in d) {
					if (d[i].status == '1') $scope.report.blth = d[i].id;
					break;
				}
				$scope.blth = d;
			});
		}; $scope.getblth();
		$scope.getParam = function() { return jQuery.param($scope.report); };
		
		// load Laporan
		$scope.data = {};
		$scope.loadGraph = 0;
		$scope.series = { tagihan: [], lembar: [] };
		$scope.categories = { tagihan: [], lembar: [] };
		$scope.loadLaporan = function() {
			if ($scope.report.unit == '') return alertify.error('Anda belum memilih unit!');
			loader.show();
			$http({ url: $scope.server + '/tusbung/laporan?' + jQuery.param($scope.report), method: 'GET' }).
			success(function(d) { 
				loader.hide();
				if (d.data.length == 0) {
					$scope.loadGraph = 0;
					$scope.data = {};
					return alertify.error('Tidak ada data pada bulan ini!');
				}
				$scope.data = d;
				$scope.loadGraph = 1;
			});
		};
	}
}
PelangganCtrl.$inject = ['$scope', '$http', '$cookies', '$location', 'loader', '$routeParams'];
