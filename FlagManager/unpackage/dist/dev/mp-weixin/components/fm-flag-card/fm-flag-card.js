"use strict";
const common_utils_date = require("../../common/utils/date.js");
const common_mock_flagData = require("../../common/mock/flag-data.js");
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FmFlagCard",
  props: {
    flag: { type: Object, required: true },
    progress: { type: Number, default: 0 },
    currentStage: { type: String, default: "" },
    variant: {
      type: String,
      default: "default",
      validator: (value) => ["default", "muted", "archived"].includes(value)
    },
    showStatus: { type: Boolean, default: false },
    showProgress: { type: Boolean, default: true }
  },
  emits: ["click"],
  computed: {
    dateRange() {
      return `${common_utils_date.formatDate(this.flag.startDate, "YYYY.MM.DD")} - ${common_utils_date.formatDate(this.flag.targetDate, "YYYY.MM.DD")}`;
    },
    statusText() {
      return common_mock_flagData.FLAG_STATUS_LABELS[this.flag.status] || this.flag.status;
    },
    statusClass() {
      if (this.flag.status === "completed")
        return "done";
      if (this.flag.status === "active")
        return "active";
      if (this.flag.status === "paused")
        return "paused";
      if (this.flag.status === "abandoned")
        return "abandoned";
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
  return common_vendor.e({
    a: common_vendor.t($props.flag.title),
    b: $props.showStatus
  }, $props.showStatus ? {
    c: common_vendor.t($options.statusText),
    d: common_vendor.n($options.statusClass)
  } : {
    e: common_vendor.t($props.flag.category)
  }, {
    f: common_vendor.t($options.dateRange),
    g: $props.showProgress
  }, $props.showProgress ? {
    h: common_vendor.p({
      percent: $props.progress,
      label: "进度"
    })
  } : {}, {
    i: $props.currentStage && $props.variant === "default"
  }, $props.currentStage && $props.variant === "default" ? {
    j: common_vendor.t($props.currentStage)
  } : {}, {
    k: common_vendor.n(`fm-flag-card--${$props.variant}`),
    l: common_vendor.o(($event) => _ctx.$emit("click", $props.flag), "ff")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83aeb05a"]]);
wx.createComponent(Component);
