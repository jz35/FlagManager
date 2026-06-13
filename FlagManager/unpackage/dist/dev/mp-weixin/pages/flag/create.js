"use strict";
const common_vendor = require("../../common/vendor.js");
const common_mock_flagData = require("../../common/mock/flag-data.js");
const common_utils_date = require("../../common/utils/date.js");
const common_utils_validate = require("../../common/utils/validate.js");
const _sfc_main = {
  data() {
    const today = common_utils_date.todayStr();
    return {
      flagId: "",
      categories: common_mock_flagData.FLAG_CATEGORIES,
      form: {
        title: "",
        description: "",
        category: "学习",
        customCategory: "",
        startDate: today,
        targetDate: ""
      }
    };
  },
  computed: {
    ...common_vendor.mapGetters("flag", ["getFlagById"]),
    isEdit() {
      return !!this.flagId;
    }
  },
  onLoad(options) {
    this.flagId = options.id || "";
    if (this.isEdit) {
      common_vendor.index.setNavigationBarTitle({ title: "编辑 Flag" });
      this.loadFlag();
    }
  },
  methods: {
    ...common_vendor.mapActions("flag", ["createFlag", "updateFlag"]),
    loadFlag() {
      const flag = this.getFlagById(this.flagId);
      if (!flag)
        return;
      const isCustom = !common_mock_flagData.FLAG_CATEGORIES.slice(0, -1).includes(flag.category);
      this.form = {
        title: flag.title,
        description: flag.description || "",
        category: isCustom ? "自定义" : flag.category,
        customCategory: isCustom ? flag.category : "",
        startDate: flag.startDate,
        targetDate: flag.targetDate
      };
    },
    selectCategory(cat) {
      this.form.category = cat;
      if (cat !== "自定义") {
        this.form.customCategory = "";
      }
    },
    onStartChange(e) {
      this.form.startDate = e.detail.value;
    },
    onTargetChange(e) {
      this.form.targetDate = e.detail.value;
    },
    async submit() {
      const result = common_utils_validate.validateFlagForm(this.form);
      if (!result.ok) {
        common_vendor.index.showToast({ title: result.message, icon: "none" });
        return;
      }
      const category = this.form.category === "自定义" ? this.form.customCategory.trim() : this.form.category;
      const payload = {
        title: this.form.title.trim(),
        description: this.form.description.trim(),
        category,
        startDate: this.form.startDate,
        targetDate: this.form.targetDate
      };
      if (this.isEdit) {
        await this.updateFlag({ id: this.flagId, ...payload });
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        setTimeout(() => common_vendor.index.navigateBack(), 500);
        return;
      }
      const flag = await this.createFlag(payload);
      common_vendor.index.showToast({ title: "创建成功", icon: "success" });
      setTimeout(() => {
        common_vendor.index.redirectTo({ url: `/pages/flag/detail?id=${flag.id}` });
      }, 500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.form.title,
    b: common_vendor.o(($event) => $data.form.title = $event.detail.value, "83"),
    c: $data.form.description,
    d: common_vendor.o(($event) => $data.form.description = $event.detail.value, "38"),
    e: common_vendor.f($data.categories, (cat, k0, i0) => {
      return {
        a: common_vendor.t(cat),
        b: cat,
        c: common_vendor.n({
          active: $data.form.category === cat
        }),
        d: common_vendor.o(($event) => $options.selectCategory(cat), cat)
      };
    }),
    f: $data.form.category === "自定义"
  }, $data.form.category === "自定义" ? {
    g: $data.form.customCategory,
    h: common_vendor.o(($event) => $data.form.customCategory = $event.detail.value, "ca")
  } : {}, {
    i: common_vendor.t($data.form.startDate),
    j: $data.form.startDate,
    k: common_vendor.o((...args) => $options.onStartChange && $options.onStartChange(...args), "f5"),
    l: common_vendor.t($data.form.targetDate || "请选择日期"),
    m: $data.form.targetDate,
    n: common_vendor.o((...args) => $options.onTargetChange && $options.onTargetChange(...args), "d5"),
    o: common_vendor.t($options.isEdit ? "保存修改" : "创建 Flag"),
    p: common_vendor.o((...args) => $options.submit && $options.submit(...args), "f4")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0bb8814e"]]);
wx.createPage(MiniProgramPage);
