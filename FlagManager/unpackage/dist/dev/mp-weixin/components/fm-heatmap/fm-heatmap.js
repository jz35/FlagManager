"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FmHeatmap",
  props: {
    days: { type: Array, default: () => [] },
    mode: { type: String, default: "default" }
  },
  emits: ["dayClick"],
  methods: {
    levelClass(count) {
      if (count === 0)
        return "level-0";
      if (count === 1)
        return "level-1";
      if (count === 2)
        return "level-2";
      if (count === 3)
        return "level-3";
      if (count <= 5)
        return "level-4";
      return "level-5";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($props.days, (day, k0, i0) => {
      return {
        a: day.date,
        b: common_vendor.n($options.levelClass(day.count)),
        c: common_vendor.o(($event) => _ctx.$emit("dayClick", day), day.date)
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-74e23396"]]);
wx.createComponent(Component);
