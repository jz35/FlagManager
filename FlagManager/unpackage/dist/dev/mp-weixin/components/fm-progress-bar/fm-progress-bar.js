"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FmProgressBar",
  props: {
    percent: { type: Number, default: 0 },
    label: { type: String, default: "" }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.label
  }, $props.label ? {
    b: common_vendor.t($props.label),
    c: common_vendor.t($props.percent)
  } : {}, {
    d: $props.percent + "%"
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a1ac1ed1"]]);
wx.createComponent(Component);
