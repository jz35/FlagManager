"use strict";
const common_vendor = require("../../common/vendor.js");
const common_utils_stats = require("../../common/utils/stats.js");
const common_utils_date = require("../../common/utils/date.js");
const _sfc_main = {
  data() {
    return {
      filterIndex: 0
    };
  },
  computed: {
    ...common_vendor.mapState("flag", ["flags", "stages", "checkins"]),
    ...common_vendor.mapGetters("flag", ["activeFlags"]),
    filterOptions() {
      return [{ label: "全部 Flag", value: "" }, ...this.flags.map((f) => ({ label: f.title, value: f.id }))];
    },
    filteredCheckins() {
      const flagId = this.filterOptions[this.filterIndex].value;
      if (!flagId)
        return this.checkins;
      return this.checkins.filter((c) => c.flagId === flagId);
    },
    heatmapDays() {
      return common_utils_stats.buildHeatmapDays(this.filteredCheckins);
    },
    weeklyChart() {
      const checkins = this.filteredCheckins;
      const today = new Date(common_utils_date.todayStr().replace(/-/g, "/"));
      const weeks = [];
      for (let w = 3; w >= 0; w--) {
        const end = new Date(today);
        end.setDate(end.getDate() - w * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        const startStr = common_utils_date.formatDate(start);
        const endStr = common_utils_date.formatDate(end);
        const count = checkins.filter((c) => c.checkinDate >= startStr && c.checkinDate <= endStr).length;
        weeks.push({
          label: `${common_utils_date.formatDate(start, "MM.DD")}-${common_utils_date.formatDate(end, "MM.DD")}`,
          count,
          percent: 0
        });
      }
      const max = Math.max(...weeks.map((w) => w.count), 1);
      return weeks.map((w) => ({ ...w, percent: Math.round(w.count / max * 100) }));
    },
    overviewItems() {
      const checkins = this.filteredCheckins;
      return [
        { label: "累计打卡", value: `${common_utils_stats.getTotalCheckinDays(checkins)} 天` },
        { label: "当前连续", value: `${common_utils_stats.getCurrentStreak(checkins)} 天` },
        { label: "最长连续", value: `${common_utils_stats.getLongestStreak(checkins)} 天` },
        { label: "本月打卡", value: `${common_utils_stats.getMonthCheckinCount(checkins)} 次` }
      ];
    },
    displayFlags() {
      const flagId = this.filterOptions[this.filterIndex].value;
      if (!flagId)
        return this.activeFlags.length ? this.activeFlags : this.flags;
      return this.flags.filter((f) => f.id === flagId);
    }
  },
  methods: {
    onFilterChange(e) {
      this.filterIndex = Number(e.detail.value);
    },
    getProgress(flag) {
      if (flag.status === "abandoned")
        return 0;
      return common_utils_stats.getFlagProgress(flag, this.stages, this.checkins);
    },
    onDayClick(day) {
      if (!day.count) {
        common_vendor.index.showToast({ title: `${common_utils_date.formatDate(day.date, "MM.DD")} 无打卡`, icon: "none" });
        return;
      }
      const list = common_utils_stats.getCheckinsByDate(this.filteredCheckins, day.date);
      const content = list.map((c) => c.content).join("\n");
      common_vendor.index.showModal({
        title: `${common_utils_date.formatDate(day.date, "MM.DD")} 打卡记录`,
        content: content || "无内容",
        showCancel: false
      });
    }
  }
};
if (!Array) {
  const _easycom_fm_section2 = common_vendor.resolveComponent("fm-section");
  const _easycom_fm_heatmap2 = common_vendor.resolveComponent("fm-heatmap");
  const _easycom_fm_stat_card2 = common_vendor.resolveComponent("fm-stat-card");
  const _easycom_fm_progress_bar2 = common_vendor.resolveComponent("fm-progress-bar");
  (_easycom_fm_section2 + _easycom_fm_heatmap2 + _easycom_fm_stat_card2 + _easycom_fm_progress_bar2)();
}
const _easycom_fm_section = () => "../../components/fm-section/fm-section.js";
const _easycom_fm_heatmap = () => "../../components/fm-heatmap/fm-heatmap.js";
const _easycom_fm_stat_card = () => "../../components/fm-stat-card/fm-stat-card.js";
const _easycom_fm_progress_bar = () => "../../components/fm-progress-bar/fm-progress-bar.js";
if (!Math) {
  (_easycom_fm_section + _easycom_fm_heatmap + _easycom_fm_stat_card + _easycom_fm_progress_bar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.filterOptions[$data.filterIndex].label),
    b: $options.filterOptions,
    c: $data.filterIndex,
    d: common_vendor.o((...args) => $options.onFilterChange && $options.onFilterChange(...args), "0a"),
    e: common_vendor.p({
      title: "打卡热力图"
    }),
    f: common_vendor.o($options.onDayClick, "3a"),
    g: common_vendor.p({
      days: $options.heatmapDays
    }),
    h: common_vendor.p({
      title: "近4周打卡"
    }),
    i: common_vendor.f($options.weeklyChart, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.percent + "%",
        c: common_vendor.t(item.count),
        d: item.label
      };
    }),
    j: common_vendor.p({
      title: "数据概览"
    }),
    k: common_vendor.p({
      items: $options.overviewItems
    }),
    l: common_vendor.p({
      title: "Flag 进度"
    }),
    m: common_vendor.f($options.displayFlags, (flag, k0, i0) => {
      return {
        a: common_vendor.t(flag.title),
        b: common_vendor.t($options.getProgress(flag)),
        c: "3598459f-6-" + i0,
        d: common_vendor.p({
          percent: $options.getProgress(flag)
        }),
        e: flag.id
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3598459f"]]);
wx.createPage(MiniProgramPage);
