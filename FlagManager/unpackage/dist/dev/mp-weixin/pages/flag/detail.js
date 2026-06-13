"use strict";
const common_vendor = require("../../common/vendor.js");
const common_utils_date = require("../../common/utils/date.js");
const common_utils_stats = require("../../common/utils/stats.js");
const common_utils_validate = require("../../common/utils/validate.js");
const STATUS_MAP = {
  active: "进行中",
  completed: "已完成",
  paused: "已暂停",
  abandoned: "已放弃"
};
const ACTION_MENUS = {
  active: { items: ["编辑", "暂停", "完成", "放弃"], actions: ["edit", "paused", "completed", "abandoned"] },
  paused: { items: ["编辑", "重启", "完成", "放弃"], actions: ["edit", "resume", "completed", "abandoned"] },
  completed: { items: ["编辑"], actions: ["edit"] },
  abandoned: { items: [], actions: [] }
};
const _sfc_main = {
  data() {
    return { flagId: "" };
  },
  computed: {
    ...common_vendor.mapState("flag", ["checkins"]),
    ...common_vendor.mapGetters("flag", ["getFlagById", "getStagesByFlagId", "getCheckinsByFlagId"]),
    flag() {
      return this.getFlagById(this.flagId);
    },
    stages() {
      return this.getStagesByFlagId(this.flagId);
    },
    recentCheckins() {
      return this.getCheckinsByFlagId(this.flagId).slice(0, 5);
    },
    progress() {
      return this.flag ? common_utils_stats.getFlagProgress(this.flag, this.stages, this.checkins) : 0;
    },
    heatmapDays() {
      return common_utils_stats.buildHeatmapDays(this.getCheckinsByFlagId(this.flagId));
    },
    dateRange() {
      if (!this.flag)
        return "";
      return `${common_utils_date.formatDate(this.flag.startDate, "YYYY.MM.DD")} - ${common_utils_date.formatDate(this.flag.targetDate, "YYYY.MM.DD")}`;
    },
    statusText() {
      var _a;
      return STATUS_MAP[(_a = this.flag) == null ? void 0 : _a.status] || "";
    },
    statusClass() {
      var _a, _b, _c, _d;
      if (((_a = this.flag) == null ? void 0 : _a.status) === "completed")
        return "done";
      if (((_b = this.flag) == null ? void 0 : _b.status) === "active")
        return "active";
      if (((_c = this.flag) == null ? void 0 : _c.status) === "paused")
        return "paused";
      if (((_d = this.flag) == null ? void 0 : _d.status) === "abandoned")
        return "abandoned";
      return "pending";
    },
    canAddStage() {
      var _a;
      return ((_a = this.flag) == null ? void 0 : _a.status) === "active";
    },
    showMoreMenu() {
      var _a, _b;
      return (((_b = ACTION_MENUS[(_a = this.flag) == null ? void 0 : _a.status]) == null ? void 0 : _b.items.length) || 0) > 0;
    },
    showBottomAction() {
      var _a, _b;
      return ((_a = this.flag) == null ? void 0 : _a.status) === "active" || ((_b = this.flag) == null ? void 0 : _b.status) === "paused";
    },
    bottomActionText() {
      var _a;
      return ((_a = this.flag) == null ? void 0 : _a.status) === "paused" ? "重启" : "打卡";
    }
  },
  onLoad(options) {
    this.flagId = options.id || "";
    if (this.flag) {
      common_vendor.index.setNavigationBarTitle({ title: this.flag.title });
    }
  },
  onShow() {
    if (this.flag) {
      common_vendor.index.setNavigationBarTitle({ title: this.flag.title });
    }
  },
  methods: {
    ...common_vendor.mapActions("flag", ["updateFlagStatus"]),
    getStageProgress(stage) {
      return common_utils_stats.getStageProgress(stage, this.checkins);
    },
    goCreateStage() {
      common_vendor.index.navigateTo({ url: `/pages/stage/create?flagId=${this.flagId}` });
    },
    goStageDetail(stage) {
      common_vendor.index.navigateTo({ url: `/pages/stage/detail?id=${stage.id}` });
    },
    goCheckin() {
      if (!common_utils_validate.canFlagCheckin(this.flag)) {
        common_vendor.index.showToast({ title: "当前 Flag 不可打卡", icon: "none" });
        return;
      }
      const activeStage = this.stages.find((s) => s.status === "active" || s.status === "pending");
      let url = `/pages/checkin/create?flagId=${this.flagId}`;
      if (activeStage)
        url += `&stageId=${activeStage.id}`;
      common_vendor.index.navigateTo({ url });
    },
    goEdit() {
      common_vendor.index.navigateTo({ url: `/pages/flag/create?id=${this.flagId}` });
    },
    async resumeFlag() {
      await this.updateFlagStatus({ id: this.flagId, status: "active" });
      common_vendor.index.showToast({ title: "已重启", icon: "success" });
    },
    onBottomAction() {
      var _a;
      if (((_a = this.flag) == null ? void 0 : _a.status) === "paused") {
        this.resumeFlag();
        return;
      }
      this.goCheckin();
    },
    onDayClick(day) {
      const checkins = this.getCheckinsByFlagId(this.flagId);
      if (!day.count) {
        common_vendor.index.showToast({ title: `${common_utils_date.formatDate(day.date, "MM.DD")} 无打卡`, icon: "none" });
        return;
      }
      const list = common_utils_stats.getCheckinsByDate(checkins, day.date);
      const content = list.map((c) => c.content).join("\n");
      common_vendor.index.showModal({
        title: `${common_utils_date.formatDate(day.date, "MM.DD")} 打卡记录`,
        content: content || "无内容",
        showCancel: false
      });
    },
    getAbandonPunishmentText() {
      const activeStage = this.stages.find((s) => s.status === "active" || s.status === "pending");
      if (activeStage == null ? void 0 : activeStage.punishment) {
        return `未完成惩罚：${activeStage.punishment}`;
      }
      return "放弃后将无法继续打卡，且该 Flag 将归档为已放弃状态。";
    },
    confirmAbandon() {
      common_vendor.index.showModal({
        title: "确认放弃 Flag？",
        content: `${this.getAbandonPunishmentText()}

确定要放弃「${this.flag.title}」吗？`,
        confirmText: "确认放弃",
        confirmColor: "#d9534f",
        success: (res) => {
          if (res.confirm) {
            this.updateFlagStatus({ id: this.flagId, status: "abandoned" });
            common_vendor.index.showToast({ title: "已放弃", icon: "none" });
          }
        }
      });
    },
    confirmComplete() {
      common_vendor.index.showModal({
        title: "确认完成 Flag？",
        content: `确定将「${this.flag.title}」标记为已完成吗？`,
        success: (res) => {
          if (res.confirm) {
            this.updateFlagStatus({ id: this.flagId, status: "completed" });
            common_vendor.index.showToast({ title: "已完成", icon: "success" });
          }
        }
      });
    },
    handleAction(action) {
      if (action === "edit") {
        this.goEdit();
        return;
      }
      if (action === "resume") {
        this.resumeFlag();
        return;
      }
      if (action === "paused") {
        this.updateFlagStatus({ id: this.flagId, status: "paused" });
        common_vendor.index.showToast({ title: "已暂停", icon: "success" });
        return;
      }
      if (action === "completed") {
        this.confirmComplete();
        return;
      }
      if (action === "abandoned") {
        this.confirmAbandon();
      }
    },
    showActions() {
      var _a;
      const menu = ACTION_MENUS[(_a = this.flag) == null ? void 0 : _a.status];
      if (!menu || !menu.items.length)
        return;
      common_vendor.index.showActionSheet({
        itemList: menu.items,
        success: (res) => {
          const action = menu.actions[res.tapIndex];
          this.handleAction(action);
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_fm_progress_bar2 = common_vendor.resolveComponent("fm-progress-bar");
  const _easycom_fm_section2 = common_vendor.resolveComponent("fm-section");
  const _easycom_fm_heatmap2 = common_vendor.resolveComponent("fm-heatmap");
  const _easycom_fm_stage_card2 = common_vendor.resolveComponent("fm-stage-card");
  const _easycom_fm_checkin_card2 = common_vendor.resolveComponent("fm-checkin-card");
  (_easycom_fm_progress_bar2 + _easycom_fm_section2 + _easycom_fm_heatmap2 + _easycom_fm_stage_card2 + _easycom_fm_checkin_card2)();
}
const _easycom_fm_progress_bar = () => "../../components/fm-progress-bar/fm-progress-bar.js";
const _easycom_fm_section = () => "../../components/fm-section/fm-section.js";
const _easycom_fm_heatmap = () => "../../components/fm-heatmap/fm-heatmap.js";
const _easycom_fm_stage_card = () => "../../components/fm-stage-card/fm-stage-card.js";
const _easycom_fm_checkin_card = () => "../../components/fm-checkin-card/fm-checkin-card.js";
if (!Math) {
  (_easycom_fm_progress_bar + _easycom_fm_section + _easycom_fm_heatmap + _easycom_fm_stage_card + _easycom_fm_checkin_card)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.flag
  }, $options.flag ? common_vendor.e({
    b: common_vendor.t($options.flag.title),
    c: $options.showMoreMenu
  }, $options.showMoreMenu ? {
    d: common_vendor.o((...args) => $options.showActions && $options.showActions(...args), "5f")
  } : {}, {
    e: common_vendor.t($options.flag.description),
    f: common_vendor.t($options.statusText),
    g: common_vendor.n($options.statusClass),
    h: common_vendor.t($options.dateRange),
    i: common_vendor.p({
      percent: $options.progress,
      label: "总进度"
    }),
    j: common_vendor.p({
      title: "打卡热力图"
    }),
    k: common_vendor.o($options.onDayClick, "51"),
    l: common_vendor.p({
      days: $options.heatmapDays
    }),
    m: common_vendor.o($options.goCreateStage, "46"),
    n: common_vendor.p({
      title: "阶段计划",
      ["action-text"]: $options.canAddStage ? "+ 添加阶段" : ""
    }),
    o: common_vendor.f($options.stages, (stage, k0, i0) => {
      return {
        a: stage.id,
        b: common_vendor.o(($event) => $options.goStageDetail(stage), stage.id),
        c: "7d4f87a4-4-" + i0,
        d: common_vendor.p({
          stage,
          progress: $options.getStageProgress(stage)
        })
      };
    }),
    p: $options.canAddStage && !$options.stages.length
  }, $options.canAddStage && !$options.stages.length ? {
    q: common_vendor.o((...args) => $options.goCreateStage && $options.goCreateStage(...args), "a9")
  } : {}, {
    r: !$options.canAddStage && !$options.stages.length
  }, !$options.canAddStage && !$options.stages.length ? {} : {}, {
    s: common_vendor.p({
      title: "最近打卡"
    }),
    t: common_vendor.f($options.recentCheckins, (item, k0, i0) => {
      return {
        a: item.id,
        b: "7d4f87a4-6-" + i0,
        c: common_vendor.p({
          checkin: item
        })
      };
    }),
    v: !$options.recentCheckins.length
  }, !$options.recentCheckins.length ? {} : {}, {
    w: $options.showBottomAction
  }, $options.showBottomAction ? {
    x: common_vendor.t($options.bottomActionText),
    y: common_vendor.o((...args) => $options.onBottomAction && $options.onBottomAction(...args), "70")
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7d4f87a4"]]);
wx.createPage(MiniProgramPage);
