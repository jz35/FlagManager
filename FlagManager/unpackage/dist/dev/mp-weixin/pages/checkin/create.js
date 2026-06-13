"use strict";
const common_vendor = require("../../common/vendor.js");
const common_mock_flagData = require("../../common/mock/flag-data.js");
const common_utils_date = require("../../common/utils/date.js");
const common_utils_validate = require("../../common/utils/validate.js");
const _sfc_main = {
  data() {
    return {
      flagId: "",
      stageId: "",
      stageIndex: 0,
      moods: common_mock_flagData.CHECKIN_MOODS,
      customMoodLabel: common_mock_flagData.CHECKIN_MOOD_CUSTOM,
      moodMaxLength: common_mock_flagData.CHECKIN_MOOD_MAX_LENGTH,
      form: {
        content: "",
        moodMode: "一般",
        customMood: "",
        images: []
      }
    };
  },
  computed: {
    ...common_vendor.mapState("flag", ["stages"]),
    ...common_vendor.mapGetters("flag", ["getFlagById", "getStagesByFlagId"]),
    flag() {
      return this.getFlagById(this.flagId);
    },
    flagTitle() {
      var _a;
      return ((_a = this.flag) == null ? void 0 : _a.title) || "";
    },
    stageOptions() {
      if (!common_utils_validate.canFlagCheckin(this.flag))
        return [];
      return this.getStagesByFlagId(this.flagId).filter((s) => s.status === "active" || s.status === "pending");
    },
    currentStage() {
      return this.stageOptions[this.stageIndex] || null;
    },
    currentStageTitle() {
      var _a;
      return ((_a = this.currentStage) == null ? void 0 : _a.title) || "请选择阶段";
    },
    resolvedMood() {
      if (this.form.moodMode === common_mock_flagData.CHECKIN_MOOD_CUSTOM) {
        return this.form.customMood.trim();
      }
      return this.form.moodMode;
    }
  },
  onLoad(options) {
    this.flagId = options.flagId || "";
    this.stageId = options.stageId || "";
    if (!common_utils_validate.canFlagCheckin(this.flag)) {
      common_vendor.index.showToast({ title: "当前 Flag 不可打卡", icon: "none" });
      setTimeout(() => common_vendor.index.navigateBack(), 800);
      return;
    }
    const saved = common_vendor.index.getStorageSync(common_mock_flagData.CUSTOM_MOOD_STORAGE_KEY);
    if (saved)
      this.form.customMood = saved;
    if (this.stageId) {
      const idx = this.stageOptions.findIndex((s) => s.id === this.stageId);
      if (idx >= 0)
        this.stageIndex = idx;
    }
  },
  methods: {
    ...common_vendor.mapActions("flag", ["createCheckin"]),
    selectMood(mood) {
      this.form.moodMode = mood;
    },
    onStageChange(e) {
      this.stageIndex = Number(e.detail.value);
    },
    pickImage() {
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          this.form.images = [res.tempFilePaths[0]];
        }
      });
    },
    async submit() {
      const result = common_utils_validate.validateCheckinForm(this.form, {
        currentStage: this.currentStage,
        moodMaxLength: this.moodMaxLength
      });
      if (!result.ok) {
        common_vendor.index.showToast({ title: result.message, icon: "none" });
        return;
      }
      if (this.form.moodMode === common_mock_flagData.CHECKIN_MOOD_CUSTOM) {
        common_vendor.index.setStorageSync(common_mock_flagData.CUSTOM_MOOD_STORAGE_KEY, this.form.customMood.trim());
      }
      await this.createCheckin({
        flagId: this.flagId,
        stageId: this.currentStage.id,
        content: this.form.content.trim(),
        mood: this.resolvedMood,
        images: [...this.form.images],
        checkinDate: common_utils_date.todayStr()
      });
      common_vendor.index.showToast({ title: "打卡成功", icon: "success" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.flagTitle),
    b: $options.stageOptions.length
  }, $options.stageOptions.length ? {
    c: common_vendor.t($options.currentStageTitle),
    d: $options.stageOptions,
    e: $data.stageIndex,
    f: common_vendor.o((...args) => $options.onStageChange && $options.onStageChange(...args), "aa")
  } : {}, {
    g: $data.form.content,
    h: common_vendor.o(($event) => $data.form.content = $event.detail.value, "15"),
    i: !$data.form.images.length
  }, !$data.form.images.length ? {} : {
    j: $data.form.images[0]
  }, {
    k: common_vendor.o((...args) => $options.pickImage && $options.pickImage(...args), "7e"),
    l: common_vendor.f($data.moods, (mood, k0, i0) => {
      return {
        a: common_vendor.t(mood),
        b: mood,
        c: common_vendor.n({
          active: $data.form.moodMode === mood
        }),
        d: common_vendor.o(($event) => $options.selectMood(mood), mood)
      };
    }),
    m: $data.form.moodMode === $data.customMoodLabel
  }, $data.form.moodMode === $data.customMoodLabel ? {
    n: $data.moodMaxLength,
    o: $data.form.customMood,
    p: common_vendor.o(($event) => $data.form.customMood = $event.detail.value, "29")
  } : {}, {
    q: $data.form.moodMode === $data.customMoodLabel
  }, $data.form.moodMode === $data.customMoodLabel ? {
    r: common_vendor.t($data.moodMaxLength)
  } : {}, {
    s: common_vendor.o((...args) => $options.submit && $options.submit(...args), "32")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-afc22af3"]]);
wx.createPage(MiniProgramPage);
