'use strict';

/* cetak controller */
function CetakCtrl($scope, $http, $cookies, $location, loader) {
	if ( ! $scope.checkUser()) $scope.disconnect();
	$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
	
	$scope.curMenu = 3;
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
					$scope.dpm.blth = $scope.lbkb.blth = $scope.unread.blth = d[i].id;
					break;
				}
			}
			$scope.blth = d; 
		});
	}; $scope.getblth();
	
	// cetak dpm
	$scope.dpm = {};
	if ($scope.submenu == 'dpm') {
		$scope.resetDpm = function() { $scope.dpm = { unit: $scope.myUnit(), rbm: '', blth: '' };
		}; $scope.resetDpm();
		$scope.rbmList = [];
		$scope.loadRBM = function() {
			$scope.dpm.rbm = '';
			$http({ url: $scope.server + '/rbm/unit/' + $scope.dpm.unit, method: 'GET' }).
			success(function(d) { $scope.rbmList = d; });
		};
		if ($scope.myUnit() != 0) $scope.loadRBM();
		
		$scope.dpmList = [];
		$scope.loadDPM = function() {
			if ($scope.dpm.rbm == '') return alertify.error('Anda belum memilih RBM');
			loader.show();
			$http({ url: $scope.server + '/listdpm?' + jQuery.param($scope.dpm), method: 'GET' }).
			success(function(d) { loader.hide(); $scope.dpmList = d; }).
			error(function(e, s, h) { loader.hide(); });
		};
		$scope.getParam = function() { return jQuery.param($scope.dpm); };
	}
	
	// cetak lbkb
	$scope.lbkb = {};
	if ($scope.submenu == 'lbkb') {
		$scope.resetLbkb = function() { $scope.lbkb = { unit: $scope.myUnit(), rbm: '', blth: '', lbkb: '' };
		}; $scope.resetLbkb();
		
		$scope.rbmList = [];
		$scope.loadRBM = function() {
			$scope.lbkb.rbm = '';
			$http({ url: $scope.server + '/rbm/unit/' + $scope.lbkb.unit, method: 'GET' }).
			success(function(d) { $scope.rbmList = d; });
		};
		if ($scope.myUnit() != 0) $scope.loadRBM();
		
		$scope.lbkblist = [];
		$scope.getLbkb = function() {
			$http({ url: $scope.server + '/lbkb', method: 'GET' }).
			success(function(d) { 
				$scope.lbkblist.push({ id: '', kode: '', nama: '-- pilih lbkb --' });
				for (var i in d) $scope.lbkblist.push(d[i]); 
			});
		}; $scope.getLbkb();
		
		$scope.lbkbData = [];
		$scope.loadLBKBData = function() {
			$http({ url: $scope.server + '/lbkb', method: 'GET' }).
			success(function(d) { $scope.lbkbData = d; });
		}; $scope.loadLBKBData();
		
		$scope.lbkbList = [];
		$scope.loadLBKB = function() {
			if ($scope.lbkb.rbm == '') return alertify.error('Anda belum memilih RBM');
			loader.show();
			$http({ url: $scope.server + '/listlbkb?' + jQuery.param($scope.lbkb), method: 'GET' }).
			success(function(d) { 
				if (d.length == 0) alertify.error('Tidak ada data');
				loader.hide(); $scope.lbkbList = d; }).
			error(function(e, s, h) { loader.hide(); });
		};
		$scope.getParam = function() { return jQuery.param($scope.lbkb); };
	}
	
	// cetak ba
	$scope.ba = {};
	if ($scope.submenu == 'ba') {
		$scope.resetBa = function() { $scope.ba = { idpel: '' };
		}; $scope.resetBa();
		
	}
	
	// cetak pelanggan belum terbaca
	$scope.unread = {};
	if ($scope.submenu == 'unread') {
		$scope.resetUnread = function() { $scope.unread = { unit: $scope.myUnit(), rbm: '' };
		}; $scope.resetUnread();
		
		$scope.rbmList = [];
		$scope.loadRBM = function() {
			$scope.unread.rbm = '';
			$http({ url: $scope.server + '/rbm/unit/' + $scope.unread.unit, method: 'GET' }).
			success(function(d) { $scope.rbmList = d; });
		};
		if ($scope.myUnit() != 0) $scope.loadRBM();
		
		$scope.uList = [];
		$scope.loadUnread = function() {
			if ($scope.unread.rbm == '') return alertify.error('Anda belum memilih RBM');
			loader.show();
			$http({ url: $scope.server + '/listunread?' + jQuery.param($scope.unread), method: 'GET' }).
			success(function(d) { 
				if (d.length == 0) alertify.error('Tidak ada data');
				loader.hide(); $scope.uList = d; }).
			error(function(e, s, h) { loader.hide(); });
		};
		$scope.getParam = function() { return jQuery.param($scope.unread); };
	}
	
	$scope.range = function(start, end)  {
		var r = [];
		if ( ! end) {
			end = start; start = 0;
		}
		for (var i = start; i < end; i++) r.push(i);
		return r;
	};
	
	// rekap stmt
	$scope.stmt = { unit: $scope.myUnit(), cpage: 0, numpage: 0 };
	if ($scope.submenu == 'kirim') {
		$scope.stmtList = [];
		$scope.loadSTMT = function() {
			if ($scope.stmt.unit == 0) return alertify.error('Anda belum memilih unit');
			loader.show();
			$http({ url: $scope.server + '/liststmt?' + jQuery.param($scope.stmt), method: 'GET' }).
			success(function(d) {
				loader.hide(); 
				if (d.data.length == 0) alertify.error('Tidak ada data');
				$scope.stmtList = d.data; $scope.stmt.numpage = d.numpage;
			}).error(function(e, s, h) { loader.hide(); })
		};
		if ( ! $scope.needUnit()) $scope.loadSTMT();
		$scope.setPage = function() {
			$scope.stmt.cpage = this.n;
			$scope.loadSTMT();
		};
		$scope.prevPage = function() {
			if ($scope.stmt.cpage > 0)
				$scope.stmt.cpage--;
			$scope.loadSTMT();
		};
		$scope.nextPage = function() {
			if ($scope.stmt.cpage < $scope.stmt.numpage - 1)
				$scope.stmt.cpage++;
			$scope.loadSTMT();
		};
	}
	
	// rekap npde
	$scope.npde = { unit: $scope.myUnit(), cpage: 0, numpage: 0 };
	if ($scope.submenu == 'terima') {
		$scope.npdeList = [];
		$scope.loadNPDE = function() {
			if ($scope.npde.unit == 0) return alertify.error('Anda belum memilih unit');
			loader.show();
			$http({ url: $scope.server + '/listnpde?' + jQuery.param($scope.npde), method: 'GET' }).
			success(function(d) {
				loader.hide(); 
				if (d.data.length == 0) alertify.error('Tidak ada data');
				$scope.npdeList = d.data; $scope.npde.numpage = d.numpage;
			}).error(function(e, s, h) { loader.hide(); })
		};
		if ( ! $scope.needUnit()) $scope.loadNPDE();
		$scope.setPage = function() {
			$scope.npde.cpage = this.n;
			$scope.loadNPDE();
		};
		$scope.prevPage = function() {
			if ($scope.npde.cpage > 0)
				$scope.npde.cpage--;
			$scope.loadNPDE();
		};
		$scope.nextPage = function() {
			if ($scope.npde.cpage < $scope.npde.numpage - 1)
				$scope.npde.cpage++;
			$scope.loadNPDE();
		};
	}
	
	//  cetak ba daya besar
	if ($scope.submenu == 'badayabesar') {
		$scope.idpel = '';
	}
}
MainCtrl.$inject = ['$scope', '$http', '$cookies', '$location', 'loader'];