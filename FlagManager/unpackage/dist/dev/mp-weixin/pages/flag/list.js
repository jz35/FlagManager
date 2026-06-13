"use strict";
const common_vendor = require("../../common/vendor.js");
const common_mock_flagData = require("../../common/mock/flag-data.js");
const common_utils_stats = require("../../common/utils/stats.js");
const _sfc_main = {
  data() {
    return {
      tabs: common_mock_flagData.FLAG_LIST_TABS,
      currentTab: "all"
    };
  },
  computed: {
    ...common_vendor.mapState("flag", ["stages", "checkins"]),
    ...common_vendor.mapGetters("flag", ["getFlagsByStatus"]),
    flagList() {
      return this.getFlagsByStatus(this.currentTab);
    },
    emptyText() {
      const tab = this.tabs.find((item) => item.value === this.currentTab);
      return tab && tab.value !== "all" ? `暂无${tab.label}的 Flag` : "还没有 Flag";
    }
  },
  onLoad(options) {
    if (options.status) {
      this.currentTab = options.status;
    }
  },
  methods: {
    getProgress(flag) {
      return common_utils_stats.getFlagProgress(flag, this.stages, this.checkins);
    },
    getCurrentStageName(flagId) {
      const active = this.stages.find((s) => s.flagId === flagId && s.status === "active");
      return active ? active.title : "";
    },
    getCardVariant(flag) {
      if (flag.status === "paused")
        return "muted";
      if (flag.status === "completed" || flag.status === "abandoned")
        return "archived";
      return "default";
    },
    goFlagDetail(flag) {
      common_vendor.index.navigateTo({ url: `/pages/flag/detail?id=${flag.id}` });
    }
  }
};
if (!Array) {
  const _easycom_fm_flag_card2 = common_vendor.resolveComponent("fm-flag-card");
  const _easycom_fm_empty2 = common_vendor.resolveComponent("fm-empty");
  (_easycom_fm_flag_card2 + _easycom_fm_empty2)();
}
const _easycom_fm_flag_card = () => "../../components/fm-flag-card/fm-flag-card.js";
const _easycom_fm_empty = () => "../../components/fm-empty/fm-empty.js";
if (!Math) {
  (_easycom_fm_flag_card + _easycom_fm_empty)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.label),
        b: tab.value,
        c: common_vendor.n({
          active: $data.currentTab === tab.value
        }),
        d: common_vendor.o(($event) => $data.currentTab = tab.value, tab.value)
      };
    }),
    b: $options.flagList.length
  }, $options.flagList.length ? {
    c: common_vendor.f($options.flagList, (flag, k0, i0) => {
      return {
        a: flag.id,
        b: common_vendor.o(($event) => $options.goFlagDetail(flag), flag.id),
        c: "b553fb62-0-" + i0,
        d: common_vendor.p({
          flag,
          progress: $options.getProgress(flag),
          ["current-stage"]: $options.getCurrentStageName(flag.id),
          variant: $options.getCardVariant(flag),
          ["show-status"]: flag.status !== "active",
          ["show-progress"]: flag.status !== "abandoned"
        })
      };
    })
  } : {
    d: common_vendor.p({
      text: $options.emptyText
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b553fb62"]]);
wx.createPage(MiniProgramPage);
