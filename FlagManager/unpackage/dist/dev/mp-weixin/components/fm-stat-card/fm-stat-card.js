"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FmStatCard",
  props: {
    items: { type: Array, default: () => [] }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.items, (item, index, i0) => {
      return {
        a: common_vendor.t(item.value),
        b: common_vendor.t(item.label),
        c: index
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d1b7c9a5"]]);
wx.createComponent(Component);
