"use strict";
const common_vendor = require("../../common/vendor.js");
const common_mock_flagData = require("../../common/mock/flag-data.js");
const common_utils_date = require("../../common/utils/date.js");
const common_utils_validate = require("../../common/utils/validate.js");
const common_services_ai = require("../../common/services/ai.js");
const _sfc_main = {
  data() {
    return {
      flagId: "",
      frequencies: common_mock_flagData.CHECKIN_FREQUENCIES,
      periodOptions: common_mock_flagData.FREQUENCY_PERIOD_OPTIONS,
      timesOptions: common_mock_flagData.FREQUENCY_TIMES_OPTIONS,
      frequencyMode: "daily",
      customPeriod: "week",
      customTimesIndex: 2,
      form: {
        title: "",
        goal: "",
        startDate: common_utils_date.todayStr(),
        endDate: "",
        reward: "",
        punishment: ""
      }
    };
  },
  computed: {
    ...common_vendor.mapGetters("flag", ["getFlagById"]),
    flag() {
      return this.getFlagById(this.flagId);
    },
    flagTitle() {
      var _a;
      return ((_a = this.flag) == null ? void 0 : _a.title) || "";
    },
    periodLabel() {
      const item = this.periodOptions.find((p) => p.value === this.customPeriod);
      return item ? item.label : "日";
    },
    checkinFrequency() {
      if (this.frequencyMode === "custom") {
        return common_mock_flagData.buildCustomFrequency(this.customPeriod, this.timesOptions[this.customTimesIndex]);
      }
      return this.frequencyMode;
    }
  },
  onLoad(options) {
    this.flagId = options.flagId || "";
  },
  methods: {
    ...common_vendor.mapActions("flag", ["createStage"]),
    selectFrequency(value) {
      this.frequencyMode = value;
    },
    onTimesChange(e) {
      this.customTimesIndex = Number(e.detail.value);
    },
    showAiSuggest() {
      if (!this.flag)
        return;
      const suggestions = common_services_ai.suggestStages(this.flag.title, this.flag.category);
      common_vendor.index.showModal({
        title: "AI 阶段建议",
        content: common_services_ai.formatStageSuggestions(suggestions),
        confirmText: "填入第一项",
        success: (res) => {
          if (res.confirm && suggestions[0]) {
            const first = suggestions[0];
            this.form.title = first.title;
            this.form.goal = first.goal;
            this.form.reward = first.reward;
            this.form.punishment = first.punishment;
          }
        }
      });
    },
    async submit() {
      const result = common_utils_validate.validateStageForm(this.form);
      if (!result.ok) {
        common_vendor.index.showToast({ title: result.message, icon: "none" });
        return;
      }
      await this.createStage({
        flagId: this.flagId,
        ...this.form,
        title: this.form.title.trim(),
        goal: this.form.goal.trim(),
        reward: this.form.reward.trim(),
        punishment: this.form.punishment.trim(),
        checkinFrequency: this.checkinFrequency
      });
      common_vendor.index.showToast({ title: "创建成功", icon: "success" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.flagTitle),
    b: common_vendor.o((...args) => $options.showAiSuggest && $options.showAiSuggest(...args), "8c"),
    c: $data.form.title,
    d: common_vendor.o(($event) => $data.form.title = $event.detail.value, "ac"),
    e: $data.form.goal,
    f: common_vendor.o(($event) => $data.form.goal = $event.detail.value, "d7"),
    g: common_vendor.t($data.form.startDate),
    h: $data.form.startDate,
    i: common_vendor.o((e) => $data.form.startDate = e.detail.value, "d4"),
    j: common_vendor.t($data.form.endDate || "请选择日期"),
    k: $data.form.endDate,
    l: common_vendor.o((e) => $data.form.endDate = e.detail.value, "ee"),
    m: common_vendor.f($data.frequencies, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.value,
        c: common_vendor.n({
          active: $data.frequencyMode === item.value
        }),
        d: common_vendor.o(($event) => $options.selectFrequency(item.value), item.value)
      };
    }),
    n: $data.frequencyMode === "custom"
  }, $data.frequencyMode === "custom" ? {
    o: common_vendor.f($data.periodOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.value,
        c: common_vendor.n({
          active: $data.customPeriod === item.value
        }),
        d: common_vendor.o(($event) => $data.customPeriod = item.value, item.value)
      };
    }),
    p: common_vendor.t($data.timesOptions[$data.customTimesIndex]),
    q: $data.timesOptions,
    r: $data.customTimesIndex,
    s: common_vendor.o((...args) => $options.onTimesChange && $options.onTimesChange(...args), "16"),
    t: common_vendor.t($options.periodLabel),
    v: common_vendor.t($data.timesOptions[$data.customTimesIndex])
  } : {}, {
    w: $data.form.reward,
    x: common_vendor.o(($event) => $data.form.reward = $event.detail.value, "a7"),
    y: $data.form.punishment,
    z: common_vendor.o(($event) => $data.form.punishment = $event.detail.value, "e6"),
    A: common_vendor.o((...args) => $options.submit && $options.submit(...args), "20")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-70dc1132"]]);
wx.createPage(MiniProgramPage);
