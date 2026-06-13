"use strict";
const common_vendor = require("../../common/vendor.js");
const common_utils_stats = require("../../common/utils/stats.js");
const common_services_auth = require("../../common/services/auth.js");
const _sfc_main = {
  computed: {
    ...common_vendor.mapState("flag", ["user", "flags", "checkins"]),
    ...common_vendor.mapGetters("flag", ["completedFlagCount", "isLoggedIn"]),
    avatarText() {
      return (this.user.nickname || "用").slice(0, 1);
    },
    dataItems() {
      return [
        { label: "Flag 总数", value: String(this.flags.length) },
        { label: "已完成", value: String(this.completedFlagCount) },
        { label: "累计打卡", value: `${common_utils_stats.getTotalCheckinDays(this.checkins)} 天` }
      ];
    }
  },
  methods: {
    ...common_vendor.mapActions("flag", ["login", "logout"]),
    goFlagList() {
      common_vendor.index.navigateTo({ url: "/pages/flag/list" });
    },
    async handleLogin() {
      try {
        const { openId } = await common_services_auth.wxLogin();
        let profile = { nickName: "微信用户", avatarUrl: "" };
        try {
          profile = await common_services_auth.getUserProfile();
        } catch (e) {
        }
        await this.login({
          openId,
          nickname: profile.nickName,
          avatarUrl: profile.avatarUrl
        });
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "登录失败", icon: "none" });
      }
    },
    handleLogout() {
      this.logout();
      common_vendor.index.showToast({ title: "已退出", icon: "none" });
    },
    showAbout() {
      common_vendor.index.showModal({
        title: "关于 FlagManager",
        content: "帮助用户管理长期 Flag，通过阶段计划、打卡记录和统计视图，兑现每一个目标。",
        showCancel: false
      });
    }
  }
};
if (!Array) {
  const _easycom_fm_section2 = common_vendor.resolveComponent("fm-section");
  const _easycom_fm_stat_card2 = common_vendor.resolveComponent("fm-stat-card");
  (_easycom_fm_section2 + _easycom_fm_stat_card2)();
}
const _easycom_fm_section = () => "../../components/fm-section/fm-section.js";
const _easycom_fm_stat_card = () => "../../components/fm-stat-card/fm-stat-card.js";
if (!Math) {
  (_easycom_fm_section + _easycom_fm_stat_card)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.avatarText),
    b: common_vendor.t(_ctx.user.nickname),
    c: common_vendor.t(_ctx.user.bio),
    d: _ctx.isLoggedIn
  }, _ctx.isLoggedIn ? {} : {
    e: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args), "dc")
  }, {
    f: common_vendor.p({
      title: "我的数据"
    }),
    g: common_vendor.p({
      items: $options.dataItems
    }),
    h: common_vendor.p({
      title: "功能入口"
    }),
    i: common_vendor.o((...args) => $options.goFlagList && $options.goFlagList(...args), "ac"),
    j: common_vendor.o((...args) => $options.showAbout && $options.showAbout(...args), "74"),
    k: _ctx.isLoggedIn
  }, _ctx.isLoggedIn ? {
    l: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args), "38")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
