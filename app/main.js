const electron = require('electron');
const {app, BrowserWindow} = electron;

app.on('ready', () => {
  const {screen} = require('electron');
  const details = screen.getPrimaryDisplay().size;
  details.frame = false;
  let mainWindow = new BrowserWindow(details);
  mainWindow.loadURL(`file://${__dirname}/pages/index.html`);
  mainWindow.webContents.openDevTools();
});

exports.openMainMenu = () => {
  console.log('hit');
  const {screen} = require('electron');
  const details = screen.getPrimaryDisplay().size;
  details.frame = false;
  let win = new BrowserWindow(details);
  win.loadURL(`file://${__dirname}/pages/mainMenu.html`);
};
