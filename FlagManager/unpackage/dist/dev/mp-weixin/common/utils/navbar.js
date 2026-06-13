"use strict";
const common_vendor = require("../vendor.js");
function getNavBarInfo() {
  const sys = common_vendor.index.getSystemInfoSync();
  const statusBarHeight = sys.statusBarHeight || 20;
  let menuButton = {
    top: statusBarHeight + 4,
    height: 32,
    left: sys.screenWidth - 96,
    right: sys.screenWidth - 7,
    width: 87
  };
  const rect = common_vendor.index.getMenuButtonBoundingClientRect();
  if (rect && rect.width) {
    menuButton = rect;
  }
  const gap = menuButton.top - statusBarHeight;
  const navContentHeight = menuButton.height + gap * 2;
  const capsulePadding = Math.max(0, sys.screenWidth - menuButton.left);
  return {
    statusBarHeight,
    navContentHeight,
    capsulePadding,
    navBarHeight: statusBarHeight + navContentHeight
  };
}
exports.getNavBarInfo = getNavBarInfo;
