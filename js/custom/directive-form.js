'use strict';

/** tombol login **/
app.directive('saveLogin', ['$http', '$location', 'loader', function($http, $location, loader) {
	return function($scope, elm) {
		elm.on('click', function() {
			var username = $('#username').val(),
				password = $('#password').val();
			if (username.length == 0 || password.length == 0) return;
			loader.show();
			$http({
				url: $scope.server + '/login',
				method: 'POST',
				data: $scope.userform
			}).
			success(function(d) {
				loader.hide();
				$scope.setUser(d);
				return $location.path('/home').replace();
			}).
			error(function(e, s, h) {
				loader.hide();
				if (s == 401) {
					alertify.error('Data login salah!. Ulangi memasukkan data atau hubungi Administrator');
				}
				if (s == 500) {
					alertify.error('Server merespon dengan tidak benar. Hubungi Administrator');
				}
			});
		});
	};
}]);

/** aktifkan blth **/
app.directive('activateBlth', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function() {
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			loader.show();
			var s = $scope.blth[attrs.activateBlth],
				a = { id: s.id, nama: s.nama, status: 1 };
			$http({ url: $scope.server + '/blth/' + a.id, method: 'POST', data: a }).
			success(function(d) {
				loader.hide();
				$scope.setBlth(d);
			}).
			error(function(e, s, h) { loader.hide(); });
			$scope.$apply();
		});
	};
}]);

/** save blth **/
app.directive('saveBlth', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm) {
		elm.on('click', function() {
			var nama = $('#blth-nama').val();
			if (nama.length < 6) return alertify.error('Nama bulan tahun tidak boleh kosong');
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			var url = ($scope.bt.id == 0 ? $scope.server + '/blth' : $scope.server + '/blth/' + $scope.bt.id);
			
			loader.show();
			$http({ url: url , method: 'POST', data: $scope.bt }).
			success(function(d) {
				loader.hide();
				$scope.setBlth(d);
				$scope.resetBt();
			}).
			error(function(e, s, h) { loader.hide(); });
		});
	};
}]);

/** save unit */
app.directive('saveUnit', ['loader', '$http', '$cookies', function(loader, $http, $cookies) {
	return function($scope, elm) {
		elm.on('click', function() {
			var nama = $('#nama').val(),
				kode = $('#kode').val();
			if (nama.length < 2) return alertify.error('Nama unit tidak boleh kosong');
			if (kode.length < 2) return alertify.error('Kode unit tidak boleh kosong');
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			var url = ($scope.unit.id == 0 ? $scope.server + '/unit' : $scope.server + '/unit/' + $scope.unit.id);
			loader.show();
			$http({ url: url , method: 'POST', data: $scope.unit }).
			success(function(d) {
				alertify.success('Data berhasil disimpan');
				loader.hide();
				$scope.loadUnit();
				$scope.resetUnit();
			}).
			error(function(e, s, h) { loader.hide(); });
		});
	};
}]);

/** tombol save gardu */
app.directive('saveGardu', ['loader', '$http', '$cookies', function(loader, $http, $cookies) {
	return function($scope, elm) {
		elm.on('click', function() {
			var nama = $('#g-nama').val();
			if (nama.length < 2) return alertify.error('Nama gardu tidak boleh kosong');
			if ($scope.gardu.unit == 0) return alertify.error('Anda belum memilih unit');
			$scope.egardu.unit = $scope.gardu.unit;
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			var url = ($scope.egardu.id == 0 ? $scope.server + '/gardu' : $scope.server + '/gardu/' + $scope.egardu.id);
			
			loader.show();
			$http({ url: url , method: 'POST', data: $scope.egardu }).
			success(function(d) {
				alertify.success('Data berhasil disimpan');
				loader.hide();
				$scope.resetGardu();
				$scope.loadGardu();
			}).
			error(function(e, s, h) { loader.hide(); });
		});
	};
}]);

/** tombol import npde */
app.directive('saveNpde', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm) {
		var resend = function() {
			$http({ url: $scope.server + '/npde/resend', method: 'GET' }).
			success(function(d) {
				if (d.progress == 1) {
					resend();
				}
				else loader.hide();
				$scope.setProgress(d.progress);
				$scope.$apply();
			}).
			error(function(e, s, h) { loader.hide(); });
		};
		elm.on('click', function() {
			if ($scope.file === null || $scope.file.length == 0) return alertify.error('Anda belum memilih file NPDE');
			
			var fd = new FormData();
			fd.append("file", $scope.file);
			var xhr = new XMLHttpRequest();
			xhr.open('post', $scope.server + '/npde/' + $scope.impor.tipe, true);
			xhr.setRequestHeader('Authorization', 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password));
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('X-File-Name', $scope.file.name);
			xhr.setRequestHeader('X-File-Size', $scope.file.size);
			xhr.upload.onprogress = function(e) { loader.show(); };
			xhr.onload = function() {
				var r = angular.fromJson(this.responseText);
				$scope.setResult(r.result);
				$scope.setProgress(r.progress);
				if (r.progress == 1) {
					resend();
				} else {
					loader.hide();
					alertify.success('Data berhasil diproses. Periksa di menu Rekap Penerimaan Data');
				}
				$scope.$apply();
			};
			xhr.onerror = function() { loader.hide(); };
			xhr.send(fd);
		});
	};
}]);

/** tombol import npp */
app.directive('saveNpp', ['loader', '$cookies', function(loader, $cookies) {
	return function($scope, elm) {
		elm.on('click', function() {
			if ($scope.file === null || $scope.file.length == 0) return alertify.error('Anda belum memilih file');
			if ($scope.npp.jenis === '') return alertify.error('Anda belum memilih jenis data');
			
			var fd = new FormData();
			fd.append("file", $scope.file);
			var xhr = new XMLHttpRequest();
			xhr.open('post', $scope.server + '/npp/' + $scope.npp.jenis, true);
			xhr.setRequestHeader('Authorization', 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password));
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.upload.onprogress = function(e) { loader.show(); };
			xhr.onload = function() {
				var r = angular.fromJson(this.responseText);
				if (r.error.length == 0) {
					$scope.result = r;
					loader.hide();
					alertify.success('Data berhasil diproses!');
				} else alertify.error('Data gagal diproses!');
				$scope.$apply();
			};
			xhr.onerror = function() { loader.hide(); };
			xhr.send(fd);
		});
	};
}]);

/** tombol ekspor stmt */
app.directive('saveStmt', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm) {
		elm.on('click', function() {
			if ($scope.ekspor.unit == 0) return alertify.error('Anda belum memilih unit');
			if ($scope.ekspor.kode == 0) return alertify.error('Anda belum memilih kode proses');
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			loader.show();
			$http({ url: $scope.server + '/stmt?' + jQuery.param($scope.ekspor), method: 'GET' }).
			success(function(d) {
				loader.hide();
				if (d.file == '') return alertify.error('Tidak ada data yang diekspor');
				window.location = $scope.server + '/' + d.file;
			}).error(function(e, s, h) { loader.hide(); });
		});
	};
}]);

app.directive('searchStand', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm) {
		elm.on('click', function() {
			if ($scope.entry.unit == 0) return alertify.error('Anda belum memilih unit');
			if ($scope.entry.rbm == '' && $scope.entry.idpel == '' && $scope.entry.nometer == '') {
				$scope.resetPelangganList(); $scope.resetPelanggan();
				$scope.$apply();
				return alertify.error('Anda harus mengisi salah satu input');
			}
			
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			var url = $scope.server + '/liststand?' + jQuery.param($scope.entry);
			// pilih berdasarkan rbm
			if ($scope.entry.rbm != '') {
				$scope.entry.idpel = $scope.entry.nometer = '';
				loader.show();
				$http({ url: url, method: 'GET' }).
				success(function(d) {
					loader.hide();
					$scope.setPelangganList(d);
					$scope.resetPelanggan();
				}).
				error(function(e, s, h) { loader.hide(); });
				$scope.$apply();
			}
			// pilih berdasarkan idpel atau nometer
			if ($scope.entry.idpel != '') {
				$scope.entry.rbm = $scope.entry.nometer = '';
				loader.show();
				$http({ url: url, method: 'GET' }).
				success(function(d) {
					loader.hide();
					$scope.resetPelangganList();
					if (angular.isUndefined(d.idpel)) return alertify.error('Data pelanggan sudah terisi');
					$scope.setPelanggan(d);
				}).
				error(function(e, s, h) { loader.hide(); });
				$scope.$apply();
			}
			// pilih berdasarkan nometer
			if ($scope.entry.nometer != '') {
				$scope.entry.rbm = $scope.entry.idpel = '';
				loader.show();
				$http({ url: url, method: 'GET' }).
				success(function(d) {
					loader.hide();
					$scope.resetPelangganList();
					if (angular.isUndefined(d.idpel)) return alertify.error('Data pelanggan sudah terisi');
					$scope.setPelanggan(d);
				}).
				error(function(e, s, h) { loader.hide(); });
				$scope.$apply();
			}
		});
	};
}]);

app.directive('searchStandKoreksi', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm) {
		elm.on('click', function(e) {
			if ($scope.koreksi.idpel  == '' && $scope.koreksi.nometer == '') return alertify.error('Anda harus mengisi salah satu input');
			loader.show();
			$http({ url: $scope.server + '/liststandkoreksi?' + jQuery.param($scope.koreksi), method: 'GET' }).
			success(function(d) {
				loader.hide();
				if (angular.isUndefined(d.idpel)) {
					$scope.resetPlggn();
					return alertify.error('Tidak ada data pelanggan yang dapat dikoreksi');
				}
				$scope.setPlggn(d);
			}).
			error(function(e, s, h) { loader.hide(); });
			$scope.$apply();
		});
	};
}]);

/** simpan data stand waktu entry */
app.directive('saveEntryStand', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function(e) {
			if ($scope.pelanggan.ketbaca != '5') {
				if (($scope.pelanggan.lwbp == '' || $scope.pelanggan.lwbp === null)) return alertify.error('Anda belum mengisi LWBP');
			}
			if ($scope.isGanda($scope.pelanggan.tarif, $scope.pelanggan.daya)) {
				if ($scope.pelanggan.wbp == '') return alertify.error('Anda belum mengisi WBP');
			}
			
			loader.show();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			$http({ url: $scope.server + '/stand', method: 'POST', data: $scope.pelanggan }).
			success(function(d) {
				loader.hide();
				alertify.success('Data stand berhasil disimpan');
				$scope.resetPelanggan();
				if ($scope.pelangganList.length > 0) {
					$('#search-stand').click();
				} else {
					$scope.entry.idpel = $scope.entry.nometer = $scope.entry.rbm = '';
				}
			}).
			error(function(e, s, h) { alertify.error('Data gagal diproses!'); loader.hide(); });
		});
	};
}]);

/** simpan koreksi */
app.directive('saveStandKoreksi', ['loader', '$cookies', function(loader, $cookies) {
	return function($scope, elm, attrs) {
		elm.on('click', function(e) {
			if ($scope.plggn.lwbp == '') return alertify.error('Anda belum mengisi LWBP');
			if ($scope.isGanda($scope.plggn.tarif, $scope.plggn.daya)) {
				if ($scope.plggn.wbp == '') return alertify.error('Anda belum mengisi WBP');
			}
			
			var fd = new FormData();
			fd.append("file", $scope.file);
			for (var i in $scope.plggn) fd.append(i, $scope.plggn[i]);
			
			var xhr = new XMLHttpRequest();
			xhr.open('POST', $scope.server + '/koreksi', true);
			xhr.setRequestHeader('Authorization', 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password));
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.upload.onprogress = function(e) { loader.show(); };
			xhr.onload = function() {
				loader.hide();
				alertify.success('Data stand berhasil disimpan');
				$scope.resetPlggn();
				$scope.koreksi.idpel = $scope.koreksi.nometer = '';
				$scope.$apply();
			};
			xhr.onerror = function() {};
			xhr.send(fd);
		});
	};
}]);

/** simpan hasil pembacaan meter */
app.directive('saveBaca', ['loader', '$cookies', function(loader, $cookies) {
	return function($scope, elm, attrs) {
		elm.on('click', function(e) {
			if ($scope.file === null || $scope.file.length == 0) return alertify.error('Anda belum memilih file hasil pembacaan');
			var fd = new FormData();
			fd.append("file", $scope.file);
			
			var xhr = new XMLHttpRequest();
			xhr.open('POST', $scope.server + '/bacameter', true);
			xhr.setRequestHeader('Authorization', 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password));
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.upload.onprogress = function(e) { loader.show(); };
			xhr.onload = function() {
				loader.hide();
				var r = angular.fromJson(this.responseText);
				$scope.setReport(r);
				if (r.total == '0') alertify.error('Tidak ada data yang diproses')
				else alertify.success('Data berhasil diproses');
				$scope.$apply();
			};
			xhr.onerror = function() {};
			xhr.send(fd);
		});
	};
}]);

/** simpan foto pencatatan */
app.directive('saveFoto', ['loader', '$cookies', function(loader, $cookies) {
	return function($scope, elm, attrs) {
		$('#hidden_upload').on('load', function() {
			loader.hide();
			alertify.success('Data foto berhasil diproses.');
		});
		
		elm.on('click', function(e) {
			if ($('#file-foto').val().length == 0) {
				e.preventDefault();
				return alertify.error('Anda belum memilih file foto');
			}
			
			loader.show();
			var $form = $('#form-upload').attr('action', $scope.server + '/foto');
			$form.submit();

			/*
			if ($scope.file === null || $scope.file.length == 0) return alertify.error('Anda belum memilih file foto');
			var fd = new FormData();
			for (var i = 0; i < $scope.file.length; i++) {
				fd.append(i, $scope.file[i]);
			}
			
			var xhr = new XMLHttpRequest();
			xhr.open('POST', $scope.server + '/foto', true);
			xhr.setRequestHeader('Authorization', 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password));
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.upload.onprogress = function(e) { loader.show(); };
			xhr.onload = function() {
				loader.hide();
				var r = angular.fromJson(this.responseText);
				$scope.setNumFiles(r.numfiles);
				if (r.numfiles == '0') alertify.error('Tidak ada file foto yang diproses');
				else alertify.success('Data foto berhasil diproses.');
				$scope.$apply();
			};
			xhr.onerror = function() {};
			xhr.send(fd);
			*/
		});
	};
}]);

/** simpan petugas */
app.directive('savePetugas', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function(e) {
			if ($scope.modePetugas == 'edit' || $scope.modePetugas == 'show') {
				if ($scope.petugas.id_unit == 0) return alertify.error('Anda belum memilih unit');
				if ($scope.petugas.nama.length < 3) return alertify.error('Anda belum memilih mengisi nama');
				if ($scope.petugas.username.length < 4) return alertify.error('Anda belum memilih mengisi username');
			}
			if ($scope.modePetugas == 'password' || $scope.modePetugas == 'show') {
				if ($scope.petugas.password.length < 6) 
					return alertify.error('Password minimal enam karakter');
			}
			
			loader.show();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			$http({ url: $scope.server + '/' + $scope.submenu, method: 'POST', data: $scope.petugas }).
			success(function(d) {
				loader.hide();
				alertify.success('Data ' + $scope.submenu + ' berhasil disimpan');
				$scope.resetPetugas();
				$scope.loadPetugas();
			}).
			error(function(e, s, h) { alertify.error('Data gagal diproses!'); loader.hide(); });
		});
	};
}]);

/** simpan admin */
app.directive('saveAdmin', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function(e) {
			if ($scope.modeAdmin == 'edit' || $scope.modeAdmin == 'show') {
				if (angular.isUndefined($scope.admin.username)) return alertify.error('Anda belum memilih mengisi username');
				if ($scope.admin.username.length < 4) return alertify.error('Anda belum memilih mengisi username');
			}
			if ($scope.modeAdmin == 'password' || $scope.modePetugas == 'show') {
				if ($scope.admin.password.length < 6) 
					return alertify.error('Password minimal enam karakter');
			}
			
			loader.show();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			$http({ url: $scope.server + '/' + $scope.submenu, method: 'POST', data: $scope.admin }).
			success(function(d) {
				loader.hide();
				alertify.success('Data ' + $scope.submenu + ' berhasil disimpan');
				$scope.resetAdmin();
				$scope.loadAdmin();
			}).
			error(function(e, s, h) { alertify.error('Data gagal diproses!'); loader.hide(); });
		});
	};
}]);

/** simpan password */
app.directive('savePassword', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function(e) {
			if ($scope.passtoedit.pass1.length < 6) return alertify.error('Password minimal enam karakter');
			if ($scope.passtoedit.pass1 != $scope.passtoedit.pass2) return alertify.error('Password tidak sama');
			
			$('#pass-modal').modal('hide');
			loader.show();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			$http({ 
				url: $scope.server + '/password', 
				method: 'POST', 
				data: { pass1: $scope.passtoedit.pass1, pass2: $scope.passtoedit.pass2, id: $scope.user.id } 
			}).
			success(function(d) { 
				loader.hide(); alertify.success('Password Anda berhasil diubah');
				$scope.resetPassToEdit();
				$scope.disconnect();
			}).
			error(function(e, s, h) { loader.hide(); });
		});
	};
}]);

/** simpan data aduan **/
app.directive('saveAduan', ['loader', '$cookies', '$http', function(loader, $cookies, $http) {
	return function($scope, elm, attrs) {
		elm.on('click', function(e) {
			if ($scope.ap.idpel.length < 10) return alertify.error('IDPEL tidak lengkap!');
			if ($scope.ap.telepon.length < 4) return alertify.error('Telepon harus diisi!');
			if ($scope.ap.aduan.length < 4) return alertify.error('Data aduan harus diisi!');
			
			loader.show();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookies.username + ':' + $cookies.password);
			$http({ 
				url: $scope.server + '/aduan', 
				method: 'POST', 
				data: $scope.ap
			}).
			success(function(d) {
				loader.hide();
				alertify.success('Data aduan berhasil disimpan!');
				$scope.resetAp();
				$scope.loadAp();
			}).
			error(function(e, s, h) { loader.hide(); });
		});
	};
}]);
