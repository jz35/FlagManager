"use strict";
const common_vendor = require("../../common/vendor.js");
const STATUS_MAP = {
  pending: "未开始",
  active: "进行中",
  completed: "已完成",
  failed: "未完成"
};
const _sfc_main = {
  name: "FmStageCard",
  props: {
    stage: { type: Object, required: true },
    progress: { type: Number, default: 0 }
  },
  emits: ["click"],
  computed: {
    statusText() {
      return STATUS_MAP[this.stage.status] || this.stage.status;
    },
    statusClass() {
      if (this.stage.status === "active")
        return "active";
      if (this.stage.status === "completed")
        return "done";
      return "pending";
    }
  }
};
if (!Array) {
  const _easycom_fm_progress_bar2 = common_vendor.resolveComponent("fm-progress-bar");
  _easycom_fm_progress_bar2();
}
const _easycom_fm_progress_bar = () => "../fm-progress-bar/fm-progress-bar.js";
if (!Math) {
  _easycom_fm_progress_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($props.stage.title),
    b: common_vendor.t($options.statusText),
    c: common_vendor.n($options.statusClass),
    d: common_vendor.p({
      percent: $props.progress
    }),
    e: common_vendor.t($props.stage.reward || "未设置"),
    f: common_vendor.t($props.stage.punishment || "未设置"),
    g: common_vendor.o(($event) => _ctx.$emit("click", $props.stage), "78")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-44b55fec"]]);
wx.createComponent(Component);
