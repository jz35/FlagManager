"use strict";
const common_vendor = require("../vendor.js");
function wxLogin() {
  return new Promise((resolve, reject) => {
    common_vendor.index.login({
      provider: "weixin",
      success: (res) => {
        resolve({
          code: res.code,
          openId: `wx_${Date.now()}`
        });
      },
      fail: reject
    });
  });
}
function getUserProfile() {
  return new Promise((resolve, reject) => {
    common_vendor.index.getUserProfile({
      desc: "用于完善用户资料",
      success: (res) => resolve(res.userInfo),
      fail: reject
    });
  });
}
exports.getUserProfile = getUserProfile;
exports.wxLogin = wxLogin;
