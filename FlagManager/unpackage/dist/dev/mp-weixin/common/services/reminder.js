"use strict";
const common_vendor = require("../vendor.js");
const common_utils_stats = require("../utils/stats.js");
const common_utils_date = require("../utils/date.js");
const REMINDER_KEY = "flagmanager_last_reminder_date";
function checkDailyReminder({ stages, checkins, flags }) {
  const today = common_utils_date.todayStr();
  const last = common_vendor.index.getStorageSync(REMINDER_KEY);
  if (last === today)
    return;
  const pending = common_utils_stats.getTodayPendingStages(stages, checkins, flags);
  if (!pending.length)
    return;
  common_vendor.index.setStorageSync(REMINDER_KEY, today);
  const names = pending.slice(0, 3).map((s) => s.title).join("、");
  const suffix = pending.length > 3 ? " 等" : "";
  common_vendor.index.showModal({
    title: "今日待打卡",
    content: `你还有 ${pending.length} 个阶段待打卡：${names}${suffix}`,
    confirmText: "知道了",
    showCancel: false
  });
}
exports.checkDailyReminder = checkDailyReminder;
