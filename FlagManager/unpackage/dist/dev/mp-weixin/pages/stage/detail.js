"use strict";
const common_vendor = require("../../common/vendor.js");
const common_utils_date = require("../../common/utils/date.js");
const common_utils_stats = require("../../common/utils/stats.js");
const common_utils_validate = require("../../common/utils/validate.js");
const STATUS_MAP = {
  pending: "未开始",
  active: "进行中",
  completed: "已完成",
  failed: "未完成"
};
const _sfc_main = {
  data() {
    return {
      stageId: "",
      resultChecked: false
    };
  },
  computed: {
    ...common_vendor.mapState("flag", ["checkins"]),
    ...common_vendor.mapGetters("flag", ["getStageById", "getCheckinsByStageId", "getFlagById"]),
    stage() {
      return this.getStageById(this.stageId);
    },
    flag() {
      return this.stage ? this.getFlagById(this.stage.flagId) : null;
    },
    checkinList() {
      return this.getCheckinsByStageId(this.stageId);
    },
    progress() {
      return this.stage ? common_utils_stats.getStageProgress(this.stage, this.checkins) : 0;
    },
    stageResult() {
      return this.stage ? common_utils_stats.evaluateStageResult(this.stage, this.checkins) : { expected: 0, actual: 0, passed: false };
    },
    dateRange() {
      if (!this.stage)
        return "";
      return `${common_utils_date.formatDate(this.stage.startDate, "MM.DD")} - ${common_utils_date.formatDate(this.stage.endDate, "MM.DD")}`;
    },
    statusText() {
      var _a;
      return STATUS_MAP[(_a = this.stage) == null ? void 0 : _a.status] || "";
    },
    statusClass() {
      var _a, _b, _c;
      if (((_a = this.stage) == null ? void 0 : _a.status) === "completed")
        return "done";
      if (((_b = this.stage) == null ? void 0 : _b.status) === "active")
        return "active";
      if (((_c = this.stage) == null ? void 0 : _c.status) === "failed")
        return "abandoned";
      return "pending";
    },
    canCheckin() {
      if (!common_utils_validate.canFlagCheckin(this.flag))
        return false;
      if (!this.stage)
        return false;
      return this.stage.status === "active" || this.stage.status === "pending";
    },
    statItems() {
      const stageCheckins = this.checkinList;
      return [
        { label: "已打卡", value: `${stageCheckins.length} 次` },
        { label: "当前连续", value: `${common_utils_stats.getCurrentStreak(stageCheckins)} 天` },
        { label: "缺卡", value: `${common_utils_stats.getStageMissCount(this.stage, this.checkins)} 次` }
      ];
    }
  },
  onLoad(options) {
    this.stageId = options.id || "";
    if (this.stage) {
      common_vendor.index.setNavigationBarTitle({ title: this.stage.title });
    }
  },
  onShow() {
    if (this.stage) {
      common_vendor.index.setNavigationBarTitle({ title: this.stage.title });
    }
    this.checkStageResult();
  },
  methods: {
    ...common_vendor.mapActions("flag", ["updateStage"]),
    goCheckin() {
      if (!common_utils_validate.canFlagCheckin(this.flag)) {
        common_vendor.index.showToast({ title: "当前 Flag 不可打卡", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/checkin/create?flagId=${this.stage.flagId}&stageId=${this.stageId}`
      });
    },
    checkStageResult() {
      if (!this.stage || this.resultChecked)
        return;
      if (this.stage.status !== "active" && this.stage.status !== "pending")
        return;
      if (!common_utils_stats.isStageEnded(this.stage))
        return;
      this.resultChecked = true;
      const { passed } = this.stageResult;
      if (passed) {
        common_vendor.index.showModal({
          title: "阶段完成",
          content: `恭喜达标！

完成奖励：${this.stage.reward || "未设置"}`,
          showCancel: false,
          success: () => {
            this.updateStage({ id: this.stageId, status: "completed" });
          }
        });
        return;
      }
      common_vendor.index.showModal({
        title: "阶段未完成",
        content: `本阶段未达标。

未完成惩罚：${this.stage.punishment || "未设置"}`,
        showCancel: false,
        success: () => {
          this.updateStage({ id: this.stageId, status: "failed" });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_fm_progress_bar2 = common_vendor.resolveComponent("fm-progress-bar");
  const _easycom_fm_section2 = common_vendor.resolveComponent("fm-section");
  const _easycom_fm_stat_card2 = common_vendor.resolveComponent("fm-stat-card");
  const _easycom_fm_checkin_card2 = common_vendor.resolveComponent("fm-checkin-card");
  (_easycom_fm_progress_bar2 + _easycom_fm_section2 + _easycom_fm_stat_card2 + _easycom_fm_checkin_card2)();
}
const _easycom_fm_progress_bar = () => "../../components/fm-progress-bar/fm-progress-bar.js";
const _easycom_fm_section = () => "../../components/fm-section/fm-section.js";
const _easycom_fm_stat_card = () => "../../components/fm-stat-card/fm-stat-card.js";
const _easycom_fm_checkin_card = () => "../../components/fm-checkin-card/fm-checkin-card.js";
if (!Math) {
  (_easycom_fm_progress_bar + _easycom_fm_section + _easycom_fm_stat_card + _easycom_fm_checkin_card)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.stage
  }, $options.stage ? common_vendor.e({
    b: common_vendor.t($options.stage.goal),
    c: common_vendor.t($options.dateRange),
    d: common_vendor.t($options.statusText),
    e: common_vendor.n($options.statusClass),
    f: common_vendor.p({
      percent: $options.progress,
      label: "阶段进度"
    }),
    g: common_vendor.p({
      title: "奖惩"
    }),
    h: common_vendor.t($options.stageResult.actual),
    i: common_vendor.t($options.stageResult.expected),
    j: common_vendor.t($options.stage.reward || "未设置"),
    k: common_vendor.t($options.stage.punishment || "未设置"),
    l: common_vendor.p({
      title: "阶段统计"
    }),
    m: common_vendor.p({
      items: $options.statItems
    }),
    n: common_vendor.p({
      title: "打卡记录"
    }),
    o: common_vendor.f($options.checkinList, (item, k0, i0) => {
      return {
        a: item.id,
        b: "e26751c2-5-" + i0,
        c: common_vendor.p({
          checkin: item
        })
      };
    }),
    p: !$options.checkinList.length
  }, !$options.checkinList.length ? {} : {}, {
    q: $options.canCheckin
  }, $options.canCheckin ? {
    r: common_vendor.o((...args) => $options.goCheckin && $options.goCheckin(...args), "a0")
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e26751c2"]]);
wx.createPage(MiniProgramPage);
