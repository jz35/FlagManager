"use strict";
const common_vendor = require("../common/vendor.js");
const STORAGE_KEY = "flagmanager_state";
function loadPersistedState() {
  try {
    const raw = common_vendor.index.getStorageSync(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function savePersistedState(state) {
  const payload = {
    user: state.flag.user,
    flags: state.flag.flags,
    stages: state.flag.stages,
    checkins: state.flag.checkins
  };
  common_vendor.index.setStorageSync(STORAGE_KEY, JSON.stringify(payload));
}
function createPersistPlugin() {
  return (store) => {
    store.subscribe((_mutation, state) => {
      savePersistedState(state);
    });
  };
}
exports.createPersistPlugin = createPersistPlugin;
exports.loadPersistedState = loadPersistedState;
