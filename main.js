$(document).ready(function() {

	const win = require('electron').remote.getCurrentWindow();
	const { remote } = require('electron');
	const app = remote.app;
	const Tray = remote.Tray;
	const Menu = remote.Menu;
	const Datastore = require('nedb');
	const path = require('path');
	const exec = require('child_process').execFile;
	const fs = require('fs');
	const ioHook = require('iohook');
	var icon_path = path.join(__dirname, './../binds_icon.png');
	var tray = new Tray(icon_path);

	var
	binds_section = $('.binds_section'),
	add_bind_name = $('#add_bind_name'),
	add_bind_config = $('#add_bind_config'),
	add_bind_config_clear = $('#add_bind_config_clear'),
	add_bind_file = $('#add_bind_file'),
	add_bind_btn = $('#add_bind_btn'),

	listener_data = [];

	function appRelaunch() {
        remote.app.relaunch();
	    remote.app.exit(0);
	}

	var db = new Datastore('user_binds.db');
	db.loadDatabase(function (err) {  

		db.find({}, function(err, doc) {
			console.log(doc);

			var tray_template = [	
			{ label: app.getName(), click: function() {
				win.show();
			}},
			{ label: 'Settings'},
			{ label: 'Help'},
			{ label: 'Quit', click: function() {
				app.exit();
			}}
			];
			//starting the keyboard listener	
			doc.forEach(function(d) {
				if(d.activated == 1) {
                var data = {
					key1: d.keys_codes[0],
					key2: d.keys_codes[1],
					file_path: d.file
				};
				listener_data.push(data);

					var tray_bind_el = {
						label: d.name + ' ' + d.config,
						type: 'radio',
						checked: true,
						click: function() {
							db.update({_id: d._id}, {$set: {activated: 0}}, function(){
								appRelaunch();
							});
						}
					};
				} else {
					var tray_bind_el = {
						label: d.name + ' ' + d.config,
						type: 'radio',
						checked: false,
						click: function() {
							db.update({_id: d._id}, {$set: {activated: 1}}, function(){
								appRelaunch();
							});
						}
					};
				}

				tray_template.unshift(tray_bind_el);

				if(d.activated == 1) {
				binds_section.append(
					'<div class="bind_div">'+
					'<span class="bind_id">' + d._id + '</span>'+
					'<span id="bind_activated_true" class="bind_name">' + d.name + '</span>'+
					'<span class="bind_conf">' + d.config + '</span>'+
					'<span class="bind_file">' + d.file + '</span>'+
					'<button id="' + d._id + '" class="btn btn-success bind_changer" value="activated_true">Откл.</button>' +
					'<button id="' + d._id + '" class="btn btn-danger bind_deleter">Удалить</button>' +
					'</div>');
				} else {
				  binds_section.append(
					'<div class="bind_div">'+
					'<span class="bind_id">' + d._id + '</span>'+
					'<span id="bind_activated_false" class="bind_name">' + d.name + '</span>'+
					'<span class="bind_conf">' + d.config + '</span>'+
					'<span class="bind_file">' + d.file + '</span>'+
					'<button id="' + d._id + '" class="btn btn-warning bind_changer" value="activated_false">Вкл.</button>' +
					'<button id="' + d._id + '" class="btn btn-danger bind_deleter">Удалить</button>' +
					'</div>');
				}
			});

			//binds change and delete listeners
 
            bind_changers = $('.bind_changer');
            bind_deleters = $('.bind_deleter');

            for(var i = 0; i < bind_changers.length; i++) {
                var bind_changer = $(bind_changers[i]);
                var bind_deleter = $(bind_deleters[i]);

                bind_changer.on('click', function() {
                    var db_id = $(this).attr("id");
                    var bind_changer_val = $(this).val();
                    if(bind_changer_val == 'activated_true') {
                        db.update({_id: db_id}, {$set: {activated: 0}}, function(){
							appRelaunch();
						});
                    } else if(bind_changer_val == 'activated_false') {
                        db.update({_id: db_id}, {$set: {activated: 1}}, function(){
							appRelaunch();
						});
                    }

                    
                });
                bind_deleter.on('click', function() {
                	var db_id = $(this).attr("id");
                	db.remove({_id: db_id}, function(err, removed_num) {
                        console.log('removed: ' + removed_num);
                        appRelaunch();
		            })
                });
            }

            console.log(bind_deleters);

			const contextMenu = Menu.buildFromTemplate(tray_template);
			tray.setToolTip('This is my application.');
			tray.setContextMenu(contextMenu);
		});
		// var scott = {
		// 	name: 'Scott',
		// 	twitter: '@ScottWRobinson'
		// };
		// var john = {
		// 	name: 'john',
		// 	twitter: '@ScottWRobinson'
		// };

		// db.insert(scott, function(err, doc) {	
		// 	console.log('Inserted', doc.name, 'with ID', doc._id);
		// });
		// db.insert(john, function(err, doc) {
		// 	console.log('Inserted', doc.name, 'with ID', doc._id);
		// });
		// db.insert(scott, function(err, doc) {
		// 	console.log('Inserted', doc.name, 'with ID', doc._id);
		// });
		// db.remove({}, function(err, removed_num) {
  //  	 		console.log(removed_num);
		// });
		// db.find({}, function(err, docs) {
  //  	 		docs.forEach(function(d) {
  //       		console.log('Found user:', d);
  //   		});
		// });
		console.log('Database loaded.');
		console.log(db);

		//starting keys listening
		ioHook.on('keydown', event => {
			console.log(listener_data);
			listener_data.forEach(function(data) {
				console.log('!!!!!!' + data.key1 + '!!!' + data.key2 + '!!!' + data.file_path);
				if(data.key1 == 'ALT') {
					if(event.altKey == true && event.rawcode == data.key2) {
						console.log('ALT checker');
						var child = exec(data.file_path);
						child.stdout.on('data', function(data) {
							result += data;
						});
						child.on('close', function() {
							console.log('done');
						});  
					}
				} else if(data.key1 == 'CTRL') {
					console.log('CTRL checker');
					if(event.ctrlKey == true && event.rawcode == data.key2) {
						var child = exec(data.file_path);
						child.stdout.on('data', function(data) {
							result += data;
						});
						child.on('close', function() {
							console.log('done');
						});  
					}
				} else if(data.key1 == 'SHIFT') {
					console.log('SHIFT checker');
					if(event.shiftKey == true && event.rawcode == data.key2) {
						var child = exec(data.file_path);
						child.stdout.on('data', function(data) {
							result += data;
						});
						child.on('close', function() {
							console.log('done');
						});  
					}
				}
			});
			if(event.ctrlKey == true && event.rawcode == 13) {
				var child = exec('C:/Users/User/Desktop/text.jpg');
				child.stdout.on('data', function(data) {
					result += data;
				});
				child.on('close', function() {
					console.log('done');

				});
			}
			    console.log(event); // { type: 'mousemove', x: 700, y: 400 }
			});
		ioHook.start(true);
	});
    
    var keys_codes = [];
	add_bind_config_clear.click(function() {
		add_bind_name.val('');
		add_bind_config.val('');
		add_bind_config.prop('disabled', false);
		keys_codes = [];
	});    

	add_bind_config.keyup(function(e) {
		if(e.keyCode == 8) {
			console.log('wwww');
			$(this).val('');
			keys_codes = [];
			console.log('190 '+keys_codes);
        } else if(e.keyCode == 32) {
			console.log('wwww');
			$(this).val($(this).val().slice(0, -1));
			console.log('!!!!!!!!!');
        }  else if(e.keyCode == 16 && ($(this).val()).split("+").length < 2) {
			$(this).val($(this).val() + 'SHIFT+');
			keys_codes.push('SHIFT');
		} else if(e.keyCode == 17 && ($(this).val()).split("+").length < 2) {
			$(this).val($(this).val() + 'CTRL+');
			keys_codes.push('CTRL');
		} else if(e.keyCode == 18 && ($(this).val()).split("+").length < 2) {
			$(this).val($(this).val() + 'ALT+');
			keys_codes.push('ALT');
		} else if(e.keyCode != 16 && e.keyCode != 17 && e.keyCode != 18) {
			if(($(this).val()).split("+").length > 1) {
				$(this).val($(this).val() + '+');
				console.log(e.keyCode);
				keys_codes.push(e.keyCode);
		    } else {
		    	$(this).val('');
		    }
		}
		if(($(this).val()).split("+").length > 2) {
			console.log("ooooooof");
			$(this).val($(this).val().slice(0, -1));
			$(this).prop('disabled', true);
		}
		console.log(($(this).val()).split("+").length);
	});

	add_bind_btn.click(function() {
		if($.trim(add_bind_name.val()).length>0 && 
			$.trim(add_bind_config.val()).length>0 && 
			$.trim(add_bind_file.val()).length>0) {

			name = $.trim(add_bind_name.val());
			config = $.trim(add_bind_config.val());
			file = add_bind_file.get(0).files[0].path;
			console.log('!!!!!!!!' + keys_codes);

		var bind = {
			name: name,
			config: config,
			keys_codes: keys_codes,
			file: file,
			activated: 1
		};

		db.insert(bind, function(err, doc) {
			console.log('Inserted', doc.name, 'with ID', doc._id);
			appRelaunch();
		});
		db.find({}, function(err, doc) {
			console.log(doc);
		});

		console.log('/////////');
		console.log(name);
		console.log(config);
		console.log(file);
		console.log('/////////');
	} else {
		console.log('fuck');
	}
});


});