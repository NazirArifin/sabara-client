'use strict';

/** halaman login **/
app.directive('loginPanel', function() {
	return {
		restrict: 'C',
		link: function($scope, elm) {
			$('#username').val('').focus();
			KeyboardJS.on('enter', function() {
				$('#login-btn').click();
			});
		}
	};
});

/** reload page */
app.directive('reload', function() {
	return {
		restrict: 'A',
		link: function($scope, elm) {
			elm.on('click', function(e) { location.reload(true); });
		}
	};
});

/** tooltips **/
app.directive('tooltips', function() {
	return {
		restrict: 'C',
		link: function($scope, elm, attrs) { 
			return attrs.$observe('title', function(v) {
				elm.tooltip({ placement: (attrs.placement || 'top') }); 
			});
		}
	}
});

/**
 * Popover
 */
app.directive('popovers', function() {
	return {
		restrict: 'C',
		link: function($scope, elm, attrs) {
			return attrs.$observe('content', function(v) {
				elm.popover({
					placement: attrs.placement || 'top',
					animation: false,
					trigger: 'hover',
					html: true,
				});
			});
		}
	}
});

/**
 * Select2
 */
app.directive('select2', function() {
	return {
		restrict: 'C',
		link: function($scope, elm, attrs) {
			elm.select2();
		}
	};
});

/**
 * Select 2 untuk load idpel
 */
app.directive('select2Idpel', function() {
	return {
		restrict: 'C', require: '?ngModel',
		link: function($scope, elm, attrs, ctrl) {
			elm.select2({
				placeholder: 'Ketik IDPEL',
				minimumInputLength: 2,
				initSelection: function(element, callback) {
					var id = $(element).val();
				},
				ajax: {
					url: $scope.server + '/listidpel',
					type: 'GET',
					dataType: 'json',
					data: function(term, page) {
						if (angular.isUndefined(attrs.ganda))
							return { q: term, u: (angular.isUndefined($scope.user.id_unit) ? '' : $scope.user.id_unit) };
						else
							return { q: term, u: (angular.isUndefined($scope.user.id_unit) ? '' : $scope.user.id_unit), g: 1 };
					},
					results: function(data, page) {
						return { results: data };
					},
					formatResult: function(idpel) { return '' + idpel.nama + ''; },
					formatSelection: function(idpel) { return idpel.id }
				}
			}).on('change', function(e) {
				ctrl.$setViewValue(e.val)
				$scope.$apply();
			});
			$scope.$watch(attrs.ngModel, function() {
				var v = $scope.$eval(attrs.ngModel);
				elm.select2('val', v);
			});
		}
	};
});

/**
 * Select 2 untuk load rbm
 */
app.directive('select2Rbm', function() {
	return {
		restrict: 'C', require: '?ngModel',
		link: function($scope, elm, attrs, ctrl) {
			elm.select2({
				placeholder: 'Ketik RBM',
				minimumInputLength: 2,
				ajax: {
					url: $scope.server + '/listrbm',
					type: 'GET',
					dataType: 'json',
					data: function(term, page) { return { q: term, u: attrs.unit }; },
					results: function(data, page) {
						return { results: data };
					},
					formatResult: function(rbm) { return '' + rbm.nama + ''; },
					formatSelection: function(rbm) { return rbm.id }
				}
			}).on('change', function(e) {
				ctrl.$setViewValue(e.val)
				$scope.$apply();
			});
		}
	};
});

/**
 * Image Preview
 */
app.directive('imagePreview', function() {
	return {
		restrict: 'A',
		link: function($scope, elm, attrs) {
			elm.on('click', function(e) {
				e.preventDefault();
				var href = attrs.target;
				if ($('#lightbox').length > 0) {
					$('#light-content').html('<img src="' + href + '" />');
					$('#lightbox').fadeIn();
				} else {
					var lightbox = '<div id="lightbox" style="display: none">' +
							'<div id="light-content" class="scrollable">' + 
								'<img src="' + href +'" />' +
							'</div>' +    
						'</div>';
					$('body').append(lightbox);
					$('#lightbox').fadeIn();
				}
				$('#lightbox').on('click', function() {
					$('#lightbox').fadeOut();
				});
			});
		}
	};
});

/**
 * Reset Koreksi
 */
app.directive('resetKoreksi', function() {
	return function($scope, elm, attrs) {
		elm.on('click', function(e) {
			$scope.resetKoreksi();
			$(attrs.resetKoreksi).val('').select2('data', null);
			$scope.$apply();
		});
	};
});

/**
 * Reset Baca
 */
app.directive('resetBaca', function() {
	return function($scope, elm, attrs) {
		elm.on('click', function(e) {
			$scope.resetBaca();
			$(attrs.resetBaca).val('').select2('data', null);
			$scope.$apply();
		});
	};
});

/**
 * datepicker
 */
app.directive('datepicker', function() {
	return {
		require: '?ngModel',
		restrict: 'A',
		link: function($scope, elm, attrs, ctrl) {
			elm
			.keypress(function(e) { e.preventDefault(); })
			.keyup(function(e) { e.preventDefault(); })
			.datepicker({ format: 'dd/mm/yyyy', autoclose: true })
			.on('changeDate', function(evt) {
				ctrl.$setViewValue(new Date(evt.date).toString('dd/MM/yyyy'));
				$scope.$apply();
			});
		}
	};
});

/**
 * Form input related
 */
app.directive('fileInput', function() {
	return function($scope, elm, attrs) {
		if (angular.isUndefined(attrs.multiple))
			elm.on('change', function(e) { $scope.file = e.target.files[0]; });
		else
			elm.on('change', function(e) { $scope.file = e.target.files; });
	};
});

/**
 * Form input dengan preview
 */
app.directive('fileInputPreview', function() {
	return function($scope, elm, attrs) {
		elm.on('change', function(e) {
			var file = e.target.files[0];
			var reg = new RegExp('^(' + $scope.koreksi.idpel + ')_([0-9]{6,6})\.(jpg|jpeg|png)$');
			if ( ! file.name.match(reg)) {
				alertify.error('Nama file tidak sesuai');
				$(attrs.fileInputPreview).attr('src', $scope.server + '/' + $scope.plggn.foto);
				return false;
			}
			
			$scope.file = e.target.files[0];
			console.log($scope.file);
			var $btn = $(elm.closest('div').find('button')[0]);
			$btn.one('click', function(e) {
				$(attrs.fileInputPreview).attr('src', $scope.server + '/' + $scope.plggn.foto);
			});
			$scope.$apply();
			
			var reader = new FileReader();
			reader.onload = (function(tfile) {
				return function(e) {
					$(attrs.fileInputPreview).attr('src', e.target.result);
				}
			})(file);
			reader.readAsDataURL(file);
			elm.val('');
		});
	};
});

/**
 * Hitung stand
 */
app.directive('countStand', function() {
	var count = function(s, n) {
		var n0 = parseFloat(s.toString().replace(',', '.'));
		var va = parseFloat(n.replace(',', '.'));
		if (va < n0) 
			var t = (99999 - (n0 + va))
		else var t = va - n0;
		return ( ! isNaN(t) ? t.toFixed(2).toString().replace('.', ',') : '0');
	};
	return function($scope, elm, attrs) {
		elm.on('keyup', function(e) {
			var n0, n, t, va;
			var source, target;
			switch(attrs.countStand) {
				case 'lwbp': $scope.pelanggan.plwbp = count($scope.pelanggan.lwbp0, elm.val()); break;
				case 'wbp': $scope.pelanggan.pwbp = count($scope.pelanggan.wbp0, elm.val()); break;
				case 'kvarh': $scope.pelanggan.pkvarh = count($scope.pelanggan.kvarh0, elm.val()); break;
			}
			$scope.$apply();
		});
	};
});

/**
 * Hitung stand koreksi
 */
app.directive('countStandKoreksi', function() {
	var count = function(s, n) {
		var n0 = parseFloat(s.toString().replace(',', '.'));
		var va = parseFloat(n.replace(',', '.'));
		var t = va - n0;
		return ( ! isNaN(t) ? t.toFixed(2).toString().replace('.', ',') : '0');
	};
	return function($scope, elm, attrs) {
		elm.on('keyup', function(e) {
			var n0, n, t, va;
			var source, target;
			switch(attrs.countStandKoreksi) {
				case 'lwbp': $scope.plggn.plwbp = count($scope.plggn.lwbp0, elm.val()); break;
				case 'wbp': $scope.plggn.pwbp = count($scope.plggn.wbp0, elm.val()); break;
				case 'kvarh': $scope.plggn.pkvarh = count($scope.plggn.kvarh0, elm.val()); break;
			}
			$scope.$apply();
		});
	};
});

/**
 * Input angka
 */
app.directive('numberInput', function() {
	return function($scope, elm) {
		elm.keypress(function(e) {
			var c = e.keyCode || e.charCode;
			switch (c) {
				case 8: case 9: case 27: case 44: case 13: return;
				case 65:
					if (e.ctrlKey === true) return;
			}
			if (c < 45 || c > 57) {
				e.preventDefault();
			}
		});
	}
});

/**
 * Load map per rbm
 */
app.directive('loadMap', ['$cookies', '$http', function($cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			$scope.resetKoordinat();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			$http({ url: $scope.server + '/map/rbm/' + attrs.loadMap, method: 'GET' }).
			success(function(d) { 
				var $exbtn = $('#link-map-open');
				if (d.center.length == 0) return alertify.error('RBM tidak memiliki data peta');
				$exbtn.attr('href', '#/map/rbm/' + attrs.loadMap);
				
				$scope.setKoordinat(d);
				var center = d.center, 
					data = d.data,
					div = document.getElementById(attrs.container);
				
				var latlng = new google.maps.LatLng(center[0], center[1]);
				var Opts = {
					zoom: 16, center: latlng,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					mapTypeControlOptions: {
						style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
					}
				};
				var map = new google.maps.Map(div, Opts);
				google.maps.event.trigger(map, 'resize');
				
				var nodes = [];
				var iw = new google.maps.InfoWindow();
				for (var i = 0; i < data.length; i++) {
					var ds = data[i],
						pos = new google.maps.LatLng(ds.lat, ds.longt);
					var marker = new MarkerWithLabel({
						position: pos,
						map: map,
						title: ds.idpel + ' - ' + ds.nama,
						labelContent: ds.urut,
						labelAnchor: new google.maps.Point(5, 33),
						labelClass: "labels",
						labelInBackground: false,
						constring : '<TABLE ALIGN="center">' +'<TR>' +'<TH ROWSPAN=10><img src="' + $scope.server + '/img/'+ ds.idpel +'/'+ ds.bulan +'" width=180></img></TH>' +    '<TD>Tarif/Daya </TD>' + '<TD> : ' + ds.tarif + '/' + ds.daya + '</TD>' +'</TR>' +'<TR>' +'<TD>LWBP</TD>' + '<TD> : ' + ds.stan + '</TD>' +'</TR>' +'<TR>' +'<TD>Tgl Baca</TD>' + '<TD> : ' + ds.waktu + '</TD>' +'</TR>' +'<TR>' + '<TD>Koduk</TD>' + '<TD> : ' + ds.koduk + '</TD>' +'</TR>' +'</TABLE>'
					});
						
					google.maps.event.addListener(marker, 'click', function() { 
					iw.setContent(this.constring);
					iw.open(map, this); });
					nodes.push(pos);
				}
				
				var rutePath = new google.maps.Polyline({
					path: nodes,
					geodesic: true,
					strokeColor: '#FF0000',
					strokeOpacity: 1.0,
					strokeWeight: 1
				});
				rutePath.setMap(map);
			});
		});
	};
}]);

/**
 * Load map per gardu
 */
app.directive('loadMapGardu', ['$cookies', '$http', function($cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			$scope.resetKoordinat();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			$http({ url: $scope.server + '/map/gardu/' + attrs.loadMapGardu, method: 'GET' }).
			success(function(d) {
				if (d.center.length == 0) return alertify.error('Gardu tidak memiliki data peta');
				$scope.setKoordinat(d);
				$('#link-map-open').attr('href', '#/map/gardu/' + attrs.loadMapGardu);
				
				var center = d.center, 
					data = d.data,
					div = document.getElementById(attrs.container);
				
				var latlng = new google.maps.LatLng(center.lat, center.longt);
				var Opts = {
					zoom: 16, center: latlng,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					mapTypeControlOptions: {
						style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
					}
				};
				var map = new google.maps.Map(div, Opts);
				google.maps.event.trigger(map, 'resize');
				
				var nodes = [];
				var iw = new google.maps.InfoWindow();
				
				// marker untuk gardu
				var marker = new MarkerWithLabel({
					position: new google.maps.LatLng(center.lat, center.longt),
					map: map,
					title: center.nama,
					labelContent: center.nama,
					icon: 'img/tiang.png'
				});
				
				for (var i = 0; i < data.length; i++) {
					var ds = data[i],
						pos = new google.maps.LatLng(ds.lat, ds.longt);
					var marker = new MarkerWithLabel({
						position: pos,
						map: map,
						title: ds.idpel + ' - ' + ds.nama,
						labelContent: ds.urut,
						labelAnchor: new google.maps.Point(5, 33),
						labelClass: "labels",
						labelInBackground: false,
						constring : '<TABLE ALIGN="center">' +'<TR>' +'<TH ROWSPAN=10><img src="' + $scope.server + '/img/'+ ds.idpel +'/'+ ds.bulan +'" width=180></img></TH>' +    '<TD>Tarif/Daya </TD>' + '<TD> : ' + ds.tarif + '/' + ds.daya + '</TD>' +'</TR>' +'<TR>' +'<TD>LWBP</TD>' + '<TD> : ' + ds.stan + '</TD>' +'</TR>' +'<TR>' +'<TD>Tgl Baca</TD>' + '<TD> : ' + ds.waktu + '</TD>' +'</TR>' +'<TR>' + '<TD>Koduk</TD>' + '<TD> : ' + ds.koduk + '</TD>' +'</TR>' +'</TABLE>'
					});
					
					google.maps.event.addListener(marker, 'click', function() { 
					iw.setContent(this.constring);
					iw.open(map, this); }); 
					
					nodes.push(pos);
				}
			});
		});
	};
}]);

/**
 * Load map 2 untuk tagihan
 */
app.directive('loadMap2', ['$cookies', '$http', function($cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			$scope.resetKoordinat();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			$http({ url: $scope.server + '/map/tagihan/' + attrs.loadMap2, method: 'GET' }).
			success(function(d) {
				if (d.center.length == 0) return alertify.error('RBM tidak memiliki data peta');
				if (d.data.length == 0) return alertify.error('RBM tidak memiliki data peta');
				$scope.setKoordinat(d);
				$scope.showMapContainer();
				
				$('#link-map-open').attr('href', '#/map/tagihan/' + attrs.loadMap2);
				
				var center = d.center, 
					data = d.data,
					div = document.getElementById(attrs.container);
				
				var latlng = new google.maps.LatLng(center.lat, center.longt);
				var Opts = {
					zoom: 16, center: latlng,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					mapTypeControlOptions: {
						style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
					}
				};
				var map = new google.maps.Map(div, Opts);
				google.maps.event.trigger(map, 'resize');
				
				var nodes = [];
				var iw = new google.maps.InfoWindow();
				
				for (var i = 0; i < data.length; i++) {
					var ds = data[i],
						pos = new google.maps.LatLng(ds.lat, ds.longt),
						color = (ds.status == 0 ? 'red' : 'blue');
					var marker = new MarkerWithLabel({
						position: pos,
						map: map,
						icon: 'http://maps.google.com/mapfiles/ms/icons/' + color + '-dot.png',
						title: ds.idpel + ' - ' + ds.nama,
						labelContent: ds.urut,
						labelAnchor: new google.maps.Point(5, 33),
						labelClass: "labels",
						labelInBackground: false,
						constring : '<TABLE ALIGN="center">' +'<TR>' +'<TH ROWSPAN=10><img src="' + $scope.server + '/img/'+ ds.idpel +'/'+ ds.bulan +'" width=180></img></TH>' +    '<TD>Tarif/Daya </TD>' + '<TD> : ' + ds.tarif + '/' + ds.daya + '</TD>' +'</TR>' +'<TR>' +'<TD>LWBP</TD>' + '<TD> : ' + ds.stan + '</TD>' +'</TR>' +'<TR>' +'<TD>Tgl Baca</TD>' + '<TD> : ' + ds.waktu + '</TD>' +'</TR>' +'<TR>' + '<TD>Koduk</TD>' + '<TD> : ' + ds.koduk + '</TD>' +'</TR>' +'</TABLE>'
					});
					
					google.maps.event.addListener(marker, 'click', function() { 
					iw.setContent(this.constring);
					iw.open(map, this); }); 
					
					nodes.push(pos);
				}
			});
		});
	};
}]);

/**
 * map loader otomatis, di halaman map
 */
app.directive('mapAutoLoader', ['$cookies', '$http', function($cookies, $http) {
	return {
		restrict: 'CA',
		link: function($scope, elm, attrs) { 
			// jika gardu
			if ($scope.type == 'gardu') {
				$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
				$http({ url: $scope.server + '/map/gardu/' + $scope.param, method: 'GET' }).
				success(function(d) {
					var center = d.center, 
						data = d.data,
						div = document.getElementById('map-container');
					
					var latlng = new google.maps.LatLng(center.lat, center.longt);
					var Opts = {
						zoom: 16, center: latlng,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						mapTypeControlOptions: {
							style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
						}
					};
					var map = new google.maps.Map(div, Opts);
					google.maps.event.trigger(map, 'resize');
					var nodes = [];
					var iw = new google.maps.InfoWindow();
					
					// marker untuk gardu
					var marker = new MarkerWithLabel({
						position: new google.maps.LatLng(center.lat, center.longt),
						map: map,
						title: center.nama,
						labelContent: center.nama,
						icon: 'img/tiang.png'
					});
					
					for (var i = 0; i < data.length; i++) {
						var ds = data[i],
							pos = new google.maps.LatLng(ds.lat, ds.longt);
						var marker = new MarkerWithLabel({
							position: pos,
							map: map,
							title: ds.idpel + ' - ' + ds.nama,
							labelContent: ds.urut,
							labelAnchor: new google.maps.Point(5, 33),
							labelClass: "labels",
							labelInBackground: false,
							constring : '<TABLE ALIGN="center">' +'<TR>' +'<TH ROWSPAN=10><img src="' + $scope.server + '/img/'+ ds.idpel +'/'+ ds.bulan +'" width=180></img></TH>' +    '<TD>Tarif/Daya </TD>' + '<TD> : ' + ds.tarif + '/' + ds.daya + '</TD>' +'</TR>' +'<TR>' +'<TD>LWBP</TD>' + '<TD> : ' + ds.stan + '</TD>' +'</TR>' +'<TR>' +'<TD>Tgl Baca</TD>' + '<TD> : ' + ds.waktu + '</TD>' +'</TR>' +'<TR>' + '<TD>Koduk</TD>' + '<TD> : ' + ds.koduk + '</TD>' +'</TR>' +'</TABLE>'
						});
						
						google.maps.event.addListener(marker, 'click', function() { 
						iw.setContent(this.constring);
						iw.open(map, this); });
						nodes.push(pos);
					}
				});
			}
			// akhir jika gardu
			
			// jika rbm
			if ($scope.type == 'rbm') {
				$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
				$http({ url: $scope.server + '/map/rbm/' + $scope.param, method: 'GET' }).
				success(function(d) { 
					if (d.center.length == 0) return alertify.error('RBM tidak memiliki data peta');
					var center = d.center, 
						data = d.data,
						div = document.getElementById('map-container');
					
					var latlng = new google.maps.LatLng(center[0], center[1]);
					var Opts = {
						zoom: 16, center: latlng,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						mapTypeControlOptions: {
							style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
						}
					};
					var map = new google.maps.Map(div, Opts);
					google.maps.event.trigger(map, 'resize');
					var nodes = [];
					var iw = new google.maps.InfoWindow();
					
					for (var i = 0; i < data.length; i++) {
						var ds = data[i],
							pos = new google.maps.LatLng(ds.lat, ds.longt);
						var marker = new MarkerWithLabel({
							position: pos,
							map: map,
							title: ds.idpel + ' - ' + ds.nama,
							labelContent: ds.urut,
							labelAnchor: new google.maps.Point(5, 33),
							labelClass: "labels",
							labelInBackground: false,
							constring : '<TABLE ALIGN="center">' +'<TR>' +'<TH ROWSPAN=10><img src="' + $scope.server + '/img/'+ ds.idpel +'/'+ ds.bulan +'" width=180></img></TH>' +    '<TD>Tarif/Daya </TD>' + '<TD> : ' + ds.tarif + '/' + ds.daya + '</TD>' +'</TR>' +'<TR>' +'<TD>LWBP</TD>' + '<TD> : ' + ds.stan + '</TD>' +'</TR>' +'<TR>' +'<TD>Tgl Baca</TD>' + '<TD> : ' + ds.waktu + '</TD>' +'</TR>' +'<TR>' + '<TD>Koduk</TD>' + '<TD> : ' + ds.koduk + '</TD>' +'</TR>' +'</TABLE>'
						});
						
						google.maps.event.addListener(marker, 'click', function() { 
						iw.setContent(this.constring);
						iw.open(map, this); });	
						nodes.push(pos);
					}
					
					var rutePath = new google.maps.Polyline({
						path: nodes,
						geodesic: true,
						strokeColor: '#FF0000',
						strokeOpacity: 1.0,
						strokeWeight: 1
					});
					rutePath.setMap(map);
				});
			}
			// akhir dari rbm
			
			// jika tagihan
			if ($scope.type == 'tagihan') {
				$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
				$http({ url: $scope.server + '/map/tagihan/' + $scope.param, method: 'GET' }).
				success(function(d) {
					var center = d.center, 
						data = d.data,
						div = document.getElementById('map-container');
					
					var latlng = new google.maps.LatLng(center.lat, center.longt);
					var Opts = {
						zoom: 16, center: latlng,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						mapTypeControlOptions: {
							style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
						}
					};
					var map = new google.maps.Map(div, Opts);
					google.maps.event.trigger(map, 'resize');
					
					var nodes = [];
					var iw = new google.maps.InfoWindow();
					
					for (var i = 0; i < data.length; i++) {
						var ds = data[i],
							pos = new google.maps.LatLng(ds.lat, ds.longt),
							color = (ds.status == 0 ? 'red' : 'blue');
						var marker = new MarkerWithLabel({
							position: pos,
							map: map,
							icon: 'http://maps.google.com/mapfiles/ms/icons/' + color + '-dot.png',
							title: ds.idpel + ' - ' + ds.nama,
							labelContent: ds.urut,
							labelAnchor: new google.maps.Point(5, 33),
							labelClass: "labels",
							labelInBackground: false,
							constring : '<TABLE ALIGN="center">' +'<TR>' +'<TH ROWSPAN=10><img src="' + $scope.server + '/img/'+ ds.idpel +'/'+ ds.bulan +'" width=180></img></TH>' +    '<TD>Tarif/Daya </TD>' + '<TD> : ' + ds.tarif + '/' + ds.daya + '</TD>' +'</TR>' +'<TR>' +'<TD>LWBP</TD>' + '<TD> : ' + ds.stan + '</TD>' +'</TR>' +'<TR>' +'<TD>Tgl Baca</TD>' + '<TD> : ' + ds.waktu + '</TD>' +'</TR>' +'<TR>' + '<TD>Koduk</TD>' + '<TD> : ' + ds.koduk + '</TD>' +'</TR>' +'</TABLE>'
						});
						
						google.maps.event.addListener(marker, 'click', function() { 
						iw.setContent(this.constring);
						iw.open(map, this); }); 
						
						nodes.push(pos);
					}
				});				
			}
			// akhir dari tagihan
		}
	};
}]);

/** load data pelanggan */
app.directive('loadPelanggan', ['$cookies', '$http', function($cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			$http({ url: $scope.server + '/stand/' + attrs.loadPelanggan , method: 'GET' }).
			success(function(d) { $scope.setPelanggan(d); $('#e2-lwbp2').focus(); });
		});
	};
}]);

/** print popup */
app.directive('printPopup', ['$cookies', '$http', 'loader', function($cookies, $http, loader) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			loader.show();
			$http({ url: attrs.target, method: 'GET' }).
			success(function(d) {
				loader.hide();
				var mywindow = window.open('', 'new div', 'height=400,width=600');
				mywindow.document.write(d);
				mywindow.print();
				mywindow.close();
				return true;
			}).error(function(e, s, h) { loader.hide(); });
		});
	};
}]);

/**
 * Chart line untuk data transaksi
 */
app.directive('lineChart', ['$http', '$cookies', function($http, $cookies) {
	return {
		restrict: 'A',
		link: function($scope, elm, attrs) {
			var draw = function(title, subtitle, categories, series) {
				elm.highcharts({
					title: {
						text: title, x: -20 //center
					},
					subtitle: {
						text: subtitle, x: -20
					},
					xAxis: {
						categories: categories
					},
					credits: {
						enabled: true,
						text: 'SABARA',
						href: 'http://nazoftware.blogspot.com',
					},
					yAxis: {
						title: {
							text: attrs.ytitle
						},
						plotLines: [{
							value: 0, width: 1, color: '#808080'
						}]
					},
					legend: {
						layout: 'vertical', align: 'right', verticalAlign: 'middle', borderWidth: 0
					},
					series: series
				});
			};
			var loadData = function() {
				elm.fadeOut();
				$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
				$http({ url: attrs.target, method: "GET" }).
				success(function(d) { 
					elm.fadeIn();
					draw(d.title, d.subtitle, d.categories, d.series); $scope.setLoadGraph(0); 
				}).error(function(e, s, h) { elm.show(); });
			};
			attrs.$observe('load', function(v) { 
				if (attrs.load > 0) loadData(); 
			});
		}
	}
}]);

/**
 * Grafik tusbung
 */
app.directive('grafikTusbung', ['$http', '$cookies', function($http, $cookies) {
	return {
		restrict: 'A',
		link: function($scope, elm, attrs) {
			var draw = function(categ, series) {
				elm.highcharts({
					chart: { type: 'line' },
					title: { text: 'Grafik Kinerja Pemutusan' },
					subtitle: { text: 'DALAM ' + (attrs.grafikTusbung == 'lembar' ? 'LEMBAR' : 'RP') },
					xAxis: { categories: categ },
					yAxis: { title: { text: (attrs.grafikTusbung == 'lembar' ? 'Lembar' : 'Rp') } },
					tooltip: {
						enabled: false,
						formatter: function() {
							return this.x + ': ' + this.y;
						}
					},
					plotOptions: {
						line: { dataLabels: { enabled: true } },
						enableMouseTracking: false
					},
					credits: {
						enabled: true, text: 'SABARA', href: 'http://nazoftware.blogspot.com',
					},
					legend: {
						layout: 'vertical', align: 'right', verticalAlign: 'middle', borderWidth: 0
					},
					series: series
				});
			};
			var loadData = function() {
				$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
				$http({ url: $scope.server + '/tusbung/graph/' + attrs.grafikTusbung + '/' + $scope.report.blth, method: "GET" }).
				success(function(d) { 
					draw(d.categories, d.series);
					if (attrs.grafikTusbung == 'lembar') {
						$scope.series.lembar = d.series;
						$scope.categories.lembar = d.categories;
					} else {
						$scope.series.tagihan = d.series;
						$scope.categories.tagihan = d.categories;
					}
				}).error(function(e, s, h) {});
			};
			attrs.$observe('load', function(v) {
				if (attrs.load > 0) loadData();
			});
		}
	};
}]);

/**
 * HAPUS ( TOMBOL DELETE )
 */

/** hapus unit */
app.directive('deleteUnit', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			alertify.confirm('<strong class="text-danger">PERINGATAN: Data unit yang dihapus tidak dapat dikembalikan</strong><br><br><strong>Apakah Anda yakin?</strong>', function(e) {
				if(e) {
					$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
					loader.show();
					$http({ url: $scope.server + '/unit/' + attrs.deleteUnit, method: 'DELETE' }).
					success(function(d) {
						loader.hide();
						$scope.loadUnit();
						alertify.success('Data unit berhasil dihapus');
					}).
					error(function(e, s, h) { loader.hide(); });
					$scope.$apply();
				}
			});
		});
	};
}]);
 
/** hapus blth */
app.directive('deleteBlth', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			alertify.confirm('<strong>Apakah Anda yakin?</strong>', function(e) {
				if(e) {
					$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
					loader.show();
					$http({ url: $scope.server + '/blth/' + attrs.deleteBlth, method: 'DELETE' }).
					success(function(d) {
						loader.hide();
						$scope.setBlth(d);
						alertify.success('Data bulan tahun berhasil dihapus');
					}).
					error(function(e, s, h) { loader.hide(); });
				}
			});
		});
	};
}]);

/** hapus gardu */
app.directive('deleteGardu', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			alertify.confirm('<strong>Apakah Anda yakin?</strong>', function(e) {
				if(e) {
					$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
					loader.show();
					$http({ url: $scope.server + '/gardu/' + attrs.deleteGardu, method: 'DELETE' }).
					success(function(d) {
						loader.hide();
						$scope.loadGardu();
						alertify.success('Data gardu berhasil dihapus');
					}).
					error(function(e, s, h) { loader.hide(); });
				}
			});
		});
	};
}]);

/** hapus petugas */
app.directive('deletePetugas', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			if ($scope.submenu == 'petugas')
				var m = '<strong class="text-danger">PERINGATAN: Data petugas berhubungan dengan RBM, pastikan petugas tidak memiliki RBM.</strong><br><br><strong>Apakah Anda yakin?</strong>';
			else
				var m = '<strong class="text-danger">PERINGATAN: Data koordinator yang dihapus tidak dapat dikembalikan lagi.</strong><br><br><strong>Apakah Anda yakin?</strong>';
			
			alertify.confirm(m, function(e) {
				if(e) {
					$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
					loader.show();
					$http({ url: $scope.server + '/' + $scope.submenu + '/' + attrs.deletePetugas, method: 'DELETE' }).
					success(function(d) {
						loader.hide();
						$scope.searchPetugas();
						alertify.success('Data ' + $scope.submenu + ' berhasil dihapus');
					}).
					error(function(e, s, h) { loader.hide(); });
				}
			});
		});
	};
}]);

/** hapus admin */
app.directive('deleteAdmin', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			alertify.confirm('<strong class="text-danger">PERINGATAN: Data ' + $scope.submenu + ' yang dihapus tidak dapat dikembalikan lagi.</strong><br><br><strong>Apakah Anda yakin?</strong>', function(e) {
				if(e) {
					$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
					loader.show();
					$http({ url: $scope.server + '/' + $scope.submenu + '/' + attrs.deleteAdmin, method: 'DELETE' }).
					success(function(d) {
						loader.hide();
						$scope.loadAdmin();
						alertify.success('Data ' + $scope.submenu + ' berhasil dihapus');
					}).
					error(function(e, s, h) { loader.hide(); });
				}
			});
		});
	};
}]);

/** hapus rbm */
app.directive('deleteRbm', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			alertify.confirm('<strong class="text-danger">PERINGATAN: Data ' + $scope.submenu + ' yang dihapus tidak dapat dikembalikan lagi.</strong><br><br><strong>Apakah Anda yakin?</strong>', function(e) {
				if(e) {
					$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
					loader.show();
					$http({ url: $scope.server + '/rbm/' + attrs.deleteRbm, method: 'DELETE' }).
					success(function(d) {
						loader.hide();
						$scope.loadRbm();
						alertify.success('Data RBM berhasil dihapus');
					}).
					error(function(e, s, h) { loader.hide(); });
				}
			});
		});
	};
}]);

/** hapus aduan */
app.directive('deleteAduan', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			alertify.confirm('<strong class="text-danger">PERINGATAN: Data ' + $scope.submenu + ' yang dihapus tidak dapat dikembalikan lagi.</strong><br><br><strong>Apakah Anda yakin?</strong>', function(e) {
				if(e) {
					$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
					loader.show();
					$http({ url: $scope.server + '/aduan/' + attrs.deleteAduan, method: 'DELETE' }).
					success(function(d) {
						loader.hide();
						$scope.loadAp();
						alertify.success('Data pengaduan berhasil dihapus');
					}).
					error(function(e, s, h) { loader.hide(); });
				}
			});
		});
	};
}]);