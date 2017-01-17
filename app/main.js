const electron = require('electron');
const {app, BrowserWindow} = electron;

// Create the window for the application when the program is ready.
app.on('ready', () => {
  const {screen} = require('electron');
  const details = screen.getPrimaryDisplay().size;
  details.frame = false;
  let mainWindow = new BrowserWindow(details);
  mainWindow.loadURL(`file://${__dirname}/pages/index.html`);
});
