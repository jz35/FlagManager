"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FmEmpty",
  props: {
    text: { type: String, default: "暂无数据" },
    buttonText: { type: String, default: "" }
  },
  emits: ["action"]
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($props.text),
    b: $props.buttonText
  }, $props.buttonText ? {
    c: common_vendor.t($props.buttonText),
    d: common_vendor.o(($event) => _ctx.$emit("action"), "47")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-42f1f5cb"]]);
wx.createComponent(Component);
