"use strict";
const common_vendor = require("../common/vendor.js");
const store_flag = require("./flag.js");
const store_persist = require("./persist.js");
const store = common_vendor.createStore({
  modules: {
    flag: store_flag.flagModule
  },
  plugins: [store_persist.createPersistPlugin()]
});
exports.store = store;
