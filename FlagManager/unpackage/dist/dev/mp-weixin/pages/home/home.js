"use strict";
const common_vendor = require("../../common/vendor.js");
const common_utils_navbar = require("../../common/utils/navbar.js");
const common_utils_validate = require("../../common/utils/validate.js");
const common_utils_stats = require("../../common/utils/stats.js");
const _sfc_main = {
  data() {
    return {
      navBar: common_utils_navbar.getNavBarInfo(),
      pausedExpanded: false
    };
  },
  computed: {
    ...common_vendor.mapState("flag", ["flags", "stages", "checkins"]),
    ...common_vendor.mapGetters("flag", ["activeFlags", "pausedFlags"]),
    overviewItems() {
      return [
        { label: "连续打卡", value: `${common_utils_stats.getCurrentStreak(this.checkins)} 天` },
        { label: "本月打卡", value: `${common_utils_stats.getMonthCheckinCount(this.checkins)} 次` }
      ];
    },
    pendingList() {
      const pendingStages = common_utils_stats.getTodayPendingStages(this.stages, this.checkins, this.flags);
      return pendingStages.map((stage) => ({
        stage,
        flag: this.flags.find((f) => f.id === stage.flagId)
      })).filter((item) => item.flag && item.flag.status === "active");
    }
  },
  onLoad() {
    this.navBar = common_utils_navbar.getNavBarInfo();
  },
  methods: {
    ...common_vendor.mapActions("flag", ["updateFlagStatus"]),
    getProgress(flag) {
      return common_utils_stats.getFlagProgress(flag, this.stages, this.checkins);
    },
    getCurrentStageName(flagId) {
      const active = this.stages.find((s) => s.flagId === flagId && (s.status === "active" || s.status === "pending"));
      return active ? active.title : "";
    },
    goCreateFlag() {
      common_vendor.index.navigateTo({ url: "/pages/flag/create" });
    },
    goFlagDetail(flag) {
      common_vendor.index.navigateTo({ url: `/pages/flag/detail?id=${flag.id}` });
    },
    goCheckin(item) {
      if (!common_utils_validate.canFlagCheckin(item.flag)) {
        common_vendor.index.showToast({ title: "当前 Flag 不可打卡", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/checkin/create?flagId=${item.flag.id}&stageId=${item.stage.id}`
      });
    },
    goAllFlags() {
      common_vendor.index.navigateTo({ url: "/pages/flag/list" });
    },
    async resumeFlag(flag) {
      await this.updateFlagStatus({ id: flag.id, status: "active" });
      common_vendor.index.showToast({ title: "已恢复", icon: "success" });
    }
  }
};
if (!Array) {
  const _easycom_fm_stat_card2 = common_vendor.resolveComponent("fm-stat-card");
  const _easycom_fm_section2 = common_vendor.resolveComponent("fm-section");
  const _easycom_fm_flag_card2 = common_vendor.resolveComponent("fm-flag-card");
  const _easycom_fm_empty2 = common_vendor.resolveComponent("fm-empty");
  (_easycom_fm_stat_card2 + _easycom_fm_section2 + _easycom_fm_flag_card2 + _easycom_fm_empty2)();
}
const _easycom_fm_stat_card = () => "../../components/fm-stat-card/fm-stat-card.js";
const _easycom_fm_section = () => "../../components/fm-section/fm-section.js";
const _easycom_fm_flag_card = () => "../../components/fm-flag-card/fm-flag-card.js";
const _easycom_fm_empty = () => "../../components/fm-empty/fm-empty.js";
if (!Math) {
  (_easycom_fm_stat_card + _easycom_fm_section + _easycom_fm_flag_card + _easycom_fm_empty)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.navBar.navContentHeight + "px",
    b: $data.navBar.statusBarHeight + "px",
    c: common_vendor.p({
      items: $options.overviewItems
    }),
    d: common_vendor.p({
      title: "今日待打卡"
    }),
    e: $options.pendingList.length
  }, $options.pendingList.length ? {
    f: common_vendor.f($options.pendingList, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.flag.title),
        b: common_vendor.t(item.stage.title),
        c: common_vendor.t(item.stage.goal),
        d: common_vendor.o(($event) => $options.goCheckin(item), item.stage.id),
        e: item.stage.id
      };
    })
  } : {}, {
    g: common_vendor.p({
      title: "进行中的 Flag"
    }),
    h: _ctx.activeFlags.length
  }, _ctx.activeFlags.length ? {
    i: common_vendor.f(_ctx.activeFlags, (flag, k0, i0) => {
      return {
        a: flag.id,
        b: common_vendor.o(($event) => $options.goFlagDetail(flag), flag.id),
        c: "07e72d3c-3-" + i0,
        d: common_vendor.p({
          flag,
          progress: $options.getProgress(flag),
          ["current-stage"]: $options.getCurrentStageName(flag.id)
        })
      };
    })
  } : {
    j: common_vendor.p({
      text: "还没有进行中的 Flag"
    })
  }, {
    k: _ctx.pausedFlags.length
  }, _ctx.pausedFlags.length ? common_vendor.e({
    l: common_vendor.t(_ctx.pausedFlags.length),
    m: common_vendor.t($data.pausedExpanded ? "收起" : "展开"),
    n: common_vendor.o(($event) => $data.pausedExpanded = !$data.pausedExpanded, "11"),
    o: $data.pausedExpanded
  }, $data.pausedExpanded ? {
    p: common_vendor.f(_ctx.pausedFlags, (flag, k0, i0) => {
      return {
        a: common_vendor.o(($event) => $options.goFlagDetail(flag), flag.id),
        b: "07e72d3c-5-" + i0,
        c: common_vendor.p({
          flag,
          progress: $options.getProgress(flag),
          variant: "muted"
        }),
        d: common_vendor.o(($event) => $options.resumeFlag(flag), flag.id),
        e: flag.id
      };
    })
  } : {}) : {}, {
    q: common_vendor.o((...args) => $options.goAllFlags && $options.goAllFlags(...args), "51"),
    r: common_vendor.o((...args) => $options.goCreateFlag && $options.goCreateFlag(...args), "3b")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
