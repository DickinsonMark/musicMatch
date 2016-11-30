const electron = require('electron');
const {app, BrowserWindow} = electron;

app.on('ready', () => {
  const {screen} = require('electron');
  const {size} = screen.getPrimaryDisplay();
  size.frame = false;
  let mainWindow = new BrowserWindow(size);
  mainWindow.loadURL(`file://${__dirname}/pages/index.html`);
  mainWindow.webContents.openDevTools();
});
