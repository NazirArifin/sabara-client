'use strict';

var app = angular.module('abm', ['ngCookies', 'ngRoute', 'ngAnimate', 'ngMap']).
config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
	$routeProvider.
	when('/login', { templateUrl: 'html/login.html', controller: LoginCtrl }).
	when('/home', { templateUrl: 'html/home.html', controller: HomeCtrl }).
	when('/menu/:menuId', { templateUrl: 'html/submenu.html', controller: HomeCtrl }).
	when('/data/unit', { templateUrl: 'html/data-unit.html', controller: DataCtrl }).
	when('/data/gardu', { templateUrl: 'html/data-gardu.html', controller: DataCtrl }).
	when('/data/rbm', { templateUrl: 'html/data-rbm.html', controller: DataCtrl }).
	when('/data/pln/impor', { templateUrl: 'html/data-impor.html', controller: DataCtrl }).
	when('/data/pln/ekspor', { templateUrl: 'html/data-ekspor.html', controller: DataCtrl }).
	when('/meter/blth', { templateUrl: 'html/meter-blth.html', controller: MeterCtrl }).
	when('/meter/entry', { templateUrl: 'html/meter-entry.html', controller: MeterCtrl }).
	when('/meter/impor', { templateUrl: 'html/meter-impor.html', controller: MeterCtrl }).
	when('/meter/foto', { templateUrl: 'html/meter-foto.html', controller: MeterCtrl }).
	when('/meter/rekap', { templateUrl: 'html/meter-rekap.html', controller: MeterCtrl }).
	when('/analisa/lbkb', { templateUrl: 'html/analisa-lbkb.html', controller: AnalisaCtrl }).
	when('/analisa/dlpd', { templateUrl: 'html/analisa-dlpd.html', controller: AnalisaCtrl }).
	when('/analisa/rekap/rbm', { templateUrl: 'html/analisa-rbm.html', controller: AnalisaCtrl }).
	when('/analisa/rekap/tarif', { templateUrl: 'html/analisa-tarif.html', controller: AnalisaCtrl }).
	when('/cetak/dpm', { templateUrl: 'html/cetak-dpm.html', controller: CetakCtrl }).
	when('/cetak/lbkb', { templateUrl: 'html/cetak-lbkb.html', controller: CetakCtrl }).
	when('/cetak/badayabesar', { templateUrl: 'html/cetak-ba-dayabesar.html', controller: CetakCtrl }).
	when('/cetak/unread', { templateUrl: 'html/cetak-unread.html', controller: CetakCtrl }).
	when('/cetak/rekap/kirim', { templateUrl: 'html/cetak-rekap-kirim.html', controller: CetakCtrl }).
	when('/cetak/rekap/terima', { templateUrl: 'html/cetak-rekap-terima.html', controller: CetakCtrl }).
	when('/pelanggan/data', { templateUrl: 'html/pelanggan-data.html', controller: PelangganCtrl }).
	when('/pelanggan/:Idpel/detail', { templateUrl: 'html/pelanggan-detail.html', controller: PelangganCtrl }).
	when('/user/petugas', { templateUrl: 'html/user-petugas.html', controller: UserCtrl }).
	when('/user/koordinator', { templateUrl: 'html/user-koordinator.html', controller: UserCtrl }).
	when('/user/administrator', { templateUrl: 'html/user-administrator.html', controller: UserCtrl }).
	when('/user/observer', { templateUrl: 'html/user-observer.html', controller: UserCtrl }).
	when('/map/gardu/:idGardu', { templateUrl: 'html/map.html', controller: MapCtrl }).
	when('/map/rbm/:idRbm', { templateUrl: 'html/map.html', controller: MapCtrl }).
	when('/map/tagihan/:idTagihan', { templateUrl: 'html/map.html', controller: MapCtrl }).
	otherwise({ redirectTo: '/login' });
	
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
	$httpProvider.defaults.transformRequest = [function(data) {
		return angular.isObject(data) && String(data) !== '[object File]' ? jQuery.param(data) : data;
	}];
}]).

run(['$rootScope', '$location', function($rootScope, $location, $cookies) {
	/*
	 * ---------- setting server -----------
	 */
	var protocol 	= 'http',
		host		= 'localhost',
		port		= '80';
	$rootScope.server = protocol + '://' + host + (port != '80' ? ':' + port : '');
	
	/*
	 * ----------- versi ---------------
	 */
	$rootScope.versi = 1;
	$rootScope.subversi = 0;
	
	/*
	 * ---------- data menu -----------
	 */
	$rootScope.menu = [
		{title: 'Manajemen Data', user: [1,2,3,4], icon: 'fa-hdd-o', item: [
			{url: '#/data/unit', title: 'Data Unit', user: [1]},
			{url: '#/data/gardu', title: 'Master Gardu', user: [1,2]},
			{url: '#/data/rbm', title: 'Data RBM', user: [1,2]},
			{url: '#/data/pln/impor', title: 'Impor Data Dari PLN', user: [1,2]},
			{url: '#/data/pln/ekspor', title: 'Ekspor Data ke PLN', user: [1,2,4]}
		]},
		{title: 'Data Pelanggan', user: [1,2,3,4], icon: 'fa-users', item: [
			{url: '#/pelanggan/data', title: 'Data Pelanggan & Histori', user: [1,2,3,4]}
		]},
		{title: 'Baca Meter', user: [1,2,3,4], icon: 'fa-barcode', item: [
			{url: '#/meter/blth', title: 'Set Bulan Tahun Aktif', user: [1]},
			{url: '#/meter/entry', title: 'Entry & Koreksi Stand KWH Meter', user: [1,2]},
			{url: '#/meter/impor', title: 'Hasil & Impor Pembacaan Meter', user: [1,2]},
			{url: '#/meter/foto', title: 'Unggah Foto Pembacaan', user: [1,2]},
			{url: '#/meter/rekap', title: 'Rekap Pencatatan', user: [1,2,3]}
		]},
		{title: 'Cetak & Laporan', user: [1,2,3,4], icon: 'fa-print', item: [
			{url: '#/cetak/dpm', title: 'Cetak DPM per RBM', user: [1,2,4]},
			{url: '#/cetak/lbkb', title: 'Cetak LBKB per RBM', user: [1,2,4]},
			{url: '#/cetak/unread', title: 'Cetak Pelanggan Belum Dibaca', user: [1,2,4]},
			{url: '#/cetak/badayabesar', title: 'Cetak BA Pembacaan Meter Daya Besar', user: [1,2,4]},
			{url: '#/cetak/rekap/terima', title: 'Histori Penerimaan Data', user: [1,2,3,4]},
			{url: '#/cetak/rekap/kirim', title: 'Histori Pengiriman Data', user: [1,2,3,4]}
		]},
		{title: 'Analisa Data', user: [1,2,3,4], icon: 'fa-bar-chart-o', item: [
			{url: '#/analisa/lbkb', title: 'Rekap LBKB', user: [1,2,3,4]},
			{url: '#/analisa/dlpd', title: 'Monitoring DLPD', user: [1,2,3,4]},
			{url: '#/analisa/rekap/rbm', title: 'Rekap Pelanggan Per RBM', user: [1,2,3]},
			{url: '#/analisa/rekap/tarif', title: 'Rekap Pelanggan Per Tarif', user: [1,2,3]}
		]},
		{title: 'Petugas & Pengguna', user: [1,2], icon: 'fa-user', item: [
			{url: '#/user/administrator', title: 'Administrator', user: [1]},
			{url: '#/user/koordinator', title: 'Koordinator', user: [1]},
			{url: '#/user/petugas', title: 'Petugas Pencatat', user: [1,2]},
			{url: '#/user/observer', title: 'Observer', user: [1]}
		]}
	];
	
	$rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
		$location.path('/login').replace();
	});
}]);


/** FACTORY **/
app.factory('loader', function() {
	var div = $($('.main-loader')[0]);
	var show = function() { div.fadeIn();};
	var hide = function() { div.fadeOut(); };
	return { show: show, hide: hide };
});
