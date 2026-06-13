"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_index = require("./store/index.js");
const common_services_reminder = require("./common/services/reminder.js");
if (!Math) {
  "./pages/home/home.js";
  "./pages/stats/stats.js";
  "./pages/mine/mine.js";
  "./pages/flag/create.js";
  "./pages/flag/detail.js";
  "./pages/flag/list.js";
  "./pages/stage/create.js";
  "./pages/stage/detail.js";
  "./pages/checkin/create.js";
}
const _sfc_main = {
  onLaunch() {
    console.log("FlagManager Launch");
  },
  onShow() {
    const state = store_index.store.state.flag;
    common_services_reminder.checkDailyReminder({
      stages: state.stages,
      checkins: state.checkins,
      flags: state.flags
    });
  },
  onHide() {
    console.log("FlagManager Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(store_index.store);
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
