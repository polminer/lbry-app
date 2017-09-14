import React from "react";
import ReactDOM from "react-dom";
import App from "component/app/index.js";
import SnackBar from "component/snackBar";
import { Provider } from "react-redux";
import store from "store.js";
import SplashScreen from "component/splash";
import { doDaemonReady } from "actions/app";
import { doNavigate } from "actions/navigation";
import { doDownloadLanguages } from "actions/settings";
import * as types from "constants/action_types";

const env = ENV;
const { remote, ipcRenderer, shell } = require("electron");
const { Menu, Tray } = require("electron").remote;
const contextMenu = remote.require("./menu/context-menu");
const app = require("./app");

window.addEventListener("contextmenu", event => {
  contextMenu.showContextMenu(
    remote.getCurrentWindow(),
    event.x,
    event.y,
    env === "development"
  );
  event.preventDefault();
});

ipcRenderer.on("open-uri-requested", (event, uri) => {
  if (uri && uri.startsWith("lbry://")) {
    app.store.dispatch(doNavigate("/show", { uri }));
  }
});

ipcRenderer.on("open-menu", (event, uri) => {
  if (uri && uri.startsWith("/help")) {
    app.store.dispatch(doNavigate("/help"));
  }
});

document.addEventListener("click", event => {
  var target = event.target;
  while (target && target !== document) {
    if (
      target.matches('a[href^="http"]') ||
      target.matches('a[href^="mailto"]')
    ) {
      event.preventDefault();
      shell.openExternal(target.href);
      return;
    }
    target = target.parentNode;
  }
});

const application = remote.app;
const dock = application.dock;
const win = remote.getCurrentWindow();

// Tear down previous event listeners when reload
win.removeAllListeners();

// Clear the badge when the window is focused
win.on("focus", () => {
  if (!dock) return;

  app.store.dispatch({ type: types.WINDOW_FOCUSED });
  dock.setBadge("");
});

const initialState = app.store.getState();

var init = function() {
  app.store.dispatch(doDownloadLanguages());

  let path = require("path");
  let iconPath = path.join(
    __dirname,
    "/root/git-repos/lbry-repos/lbry-app/build/icons/96x96.png"
  );
  let appIcon = new Tray(iconPath);
  let contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: function() {
        win.show();
      },
    },
    {
      label: "Quit",
      click: function() {
        win.close();
      },
    },
  ]);

  appIcon.setContextMenu(contextMenu);
  appIcon.setToolTip("LBRY Application");
  appIcon.setTitle("LBRY");
  win.on("close", function() {
    return false;
  });
  win.on("minimize", function(event) {
    event.preventDefault();
    win.hide();
  });
  win.on("show", function() {
    appIcon.setHighlightMode("selection");
  });

  function onDaemonReady() {
    window.sessionStorage.setItem("loaded", "y"); //once we've made it here once per session, we don't need to show splash again
    app.store.dispatch(doDaemonReady());

    ReactDOM.render(
      <Provider store={store}>
        <div><App /><SnackBar /></div>
      </Provider>,
      canvas
    );
  }

  if (window.sessionStorage.getItem("loaded") == "y") {
    onDaemonReady();
  } else {
    ReactDOM.render(
      <Provider store={store}>
        <SplashScreen onReadyToLaunch={onDaemonReady} />
      </Provider>,
      canvas
    );
  }
};

init();
