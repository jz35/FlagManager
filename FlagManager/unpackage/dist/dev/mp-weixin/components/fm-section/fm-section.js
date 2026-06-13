"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FmSection",
  props: {
    title: { type: String, default: "" },
    actionText: { type: String, default: "" }
  },
  emits: ["action"]
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($props.title),
    b: $props.actionText
  }, $props.actionText ? {
    c: common_vendor.t($props.actionText),
    d: common_vendor.o(($event) => _ctx.$emit("action"), "19")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1a291c55"]]);
wx.createComponent(Component);
