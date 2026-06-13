"use strict";
const common_utils_date = require("../../common/utils/date.js");
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "FmCheckinCard",
  props: {
    checkin: { type: Object, required: true }
  },
  data() {
    return {
      previewUrl: ""
    };
  },
  computed: {
    displayDate() {
      if (common_utils_date.isToday(this.checkin.checkinDate))
        return "今天";
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (common_utils_date.formatDate(this.checkin.checkinDate) === common_utils_date.formatDate(yesterday))
        return "昨天";
      return common_utils_date.formatDate(this.checkin.checkinDate, "MM.DD");
    }
  },
  methods: {
    openPreview(url) {
      this.previewUrl = url;
    },
    closePreview() {
      this.previewUrl = "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.displayDate),
    b: $props.checkin.mood
  }, $props.checkin.mood ? {
    c: common_vendor.t($props.checkin.mood)
  } : {}, {
    d: common_vendor.t($props.checkin.content),
    e: $props.checkin.images && $props.checkin.images.length
  }, $props.checkin.images && $props.checkin.images.length ? {
    f: common_vendor.f($props.checkin.images, (url, index, i0) => {
      return {
        a: index,
        b: url,
        c: common_vendor.o(($event) => $options.openPreview(url), index)
      };
    })
  } : {}, {
    g: $data.previewUrl
  }, $data.previewUrl ? {
    h: $data.previewUrl,
    i: common_vendor.o((...args) => $options.closePreview && $options.closePreview(...args), "f4"),
    j: common_vendor.o((...args) => $options.closePreview && $options.closePreview(...args), "38"),
    k: common_vendor.o(() => {
    }, "0c")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-02d97b54"]]);
wx.createComponent(Component);
