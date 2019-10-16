$(document).ready(function() {
    
    const { Tray } = require('./../node_modules/electron');
	const Datastore = require('./../node_modules/nedb');
    const path = require('path');
    const exec = require('child_process').exec;
    const fs = require('fs'); 

    console.log(Tray);


    
	var
	binds_section = $('.binds_section'),
	add_bind_name = $('#add_bind_name'),
	add_bind_config = $('#add_bind_config'),
	add_bind_config_clear = $('#add_bind_config_clear'),
	add_bind_file = $('#add_bind_file'),
	add_bind_btn = $('#add_bind_btn');




	var db = new Datastore('user_binds.db');
	db.loadDatabase(function (err) {  
		db.find({}, function(err, doc) {
			console.log(doc);
		    	doc.forEach(function(d) {
         		    binds_section.append(
         		    	'<div class="bind_div">'+
         		    	    '<span class="bind_id">' + d._id + '</span>'+
         		    	    '<span class="bind_name">' + d.name + '</span>'+
         		    	    '<span class="bind_conf">' + d.config + '</span>'+
         		    	    '<span class="bind_file">' + d.file + '</span>'+
         		    	    '<button class="btn btn-warning">Откл.</button>' +
         		    	    '<button class="btn btn-danger">Удалить</button>' +
         		    	'</div>');
          	    });
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
	});

	add_bind_config_clear.click(function() {
		add_bind_name.val('');
		add_bind_config.val('');
		add_bind_config.prop('disabled', false);
	});    

	add_bind_config.keyup(function(e) {
		if(e.keyCode == 8) {
			console.log('wwww');
			$(this).val('');
		} else if(e.keyCode == 9) {
			$(this).val($(this).val() + 'TAB+ ');
		} else if(e.keyCode == 13) {
			$(this).val($(this).val() + 'INTER+');
		} else if(e.keyCode == 16) {
			$(this).val($(this).val() + 'SHIFT+');
		} else if(e.keyCode == 17) {
			$(this).val($(this).val() + 'CTRL+');
		} else if(e.keyCode == 18) {
			$(this).val($(this).val() + 'ALT+');
		} else if(e.keyCode == 20) {
			$(this).val($(this).val() + 'CAPSLOCK+');
		} else if(e.keyCode == 255) {
			$(this).val($(this).val() + 'FN+');
		} else {
			$(this).val($(this).val() + '+');
			console.log(e.keyCode);
		}
		if(($(this).val()).split("+").length > 2) {
			console.log("ooooooof");
			$(this).val($(this).val().slice(0, -1));
			$(this).prop('disabled', true);
		}
	});

	add_bind_btn.click(function() {
		if($.trim(add_bind_name.val()).length>0 && 
		    $.trim(add_bind_config.val()).length>0 && 
		    $.trim(add_bind_file.val()).length>0) {
            
            name = $.trim(add_bind_name.val());
			config = $.trim(add_bind_config.val());
			file = add_bind_file.get(0).files[0].path;
            console.log('!!!!!!!!' + file);

            var bind = {
		  	    name: name,
		 	    config: config,
		 	    file: file
		    };

		    db.insert(bind, function(err, doc) {
		   	    console.log('Inserted', doc.name, 'with ID', doc._id);
		   	    location.reload(true);
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