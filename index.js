console.log(1);
const app = require('electron').app;
const BrowserWindow = require('electron').BrowserWindow;
const url = require('url');
const path = require('path');
const fs = require('fs');

var user_auth = false;
function getUserPrefs() {
   if(user_auth) {
       //get info server database
   } else {
       //get info from local database  
   }
}

function appMain() {
	let win;
	
	// Создаём окно браузера.
	win = new BrowserWindow({
		width: 800,
		height: 550,
		icon: __dirname + '/binds_icon.png',
		webPreferences: {
			nodeIntegration: true
		},
		show: false
	});

	win.on('close', (event) => {
    	// Разбирает объект окна, обычно вы можете хранить окна     
    	// в массиве, если ваше приложение поддерживает несколько окон в это время,
    	// тогда вы должны удалить соответствующий элемент.
    	win.hide();
        event.preventDefault();
    });

    win.loadURL(url.format({
    	pathname: path.join(__dirname, 'view_modules/index.html'),
    	protocol: 'file:',
    	slashes: true
    }));

    //win.webContents.openDevTools();
  
  var user_prefs_file = path.join(__dirname, 'user_prefs/user_status.txt');
	fs.readFile(user_prefs_file, "utf8", function(err, data) {
		if(err) throw err;
		if(data == "auth_true") {
			user_auth = true;
		} else if(data == "auth_false") {
            user_auth = false;
		}
        getUserPrefs();
	}); 
}

app.on('ready', appMain);

app.on('window-all-closed', () => {
  // Для приложений и строки меню в macOS является обычным делом оставаться
  // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
  if (process.platform !== 'darwin') {
  	app.quit()
  }
})


