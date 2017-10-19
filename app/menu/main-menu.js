const { app, Menu } = require('electron');

const baseTemplate = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo',
      },
      {
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        role: 'cut',
      },
      {
        role: 'copy',
      },
      {
        role: 'paste',
      },
      {
        role: 'selectall',
      },
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Help',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.send('open-menu', '/help');
          }
        }
      }
    ]
  }
];

const macOSAppMenuTemplate = {
  label: app.getName(),
  submenu: [
    {
      role: 'about',
    },
    {
      type: 'separator',
    },
    {
      role: 'hide',
    },
    {
      role: 'hideothers',
    },
    {
      role: 'unhide',
    },
    {
      type: 'separator',
    },
    {
      role: 'quit',
    },
  ]
};

const developerMenuTemplate = {
  label: 'Developer',
  submenu: [
     {role: 'reload'},
     {role: 'forcereload'},
     {role: 'toggledevtools'},
     {type: 'separator'},
     {role: 'togglefullscreen'}
   ]
};

module.exports = () => {
    let template = baseTemplate.slice();
    (process.platform === 'darwin') && template.unshift(macOSAppMenuTemplate);
    template.push(developerMenuTemplate);
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};
