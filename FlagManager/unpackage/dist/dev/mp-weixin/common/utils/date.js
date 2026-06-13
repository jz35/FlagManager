"use strict";
function formatDate(date, fmt = "YYYY-MM-DD") {
  const d = typeof date === "string" ? new Date(date.replace(/-/g, "/")) : new Date(date);
  if (Number.isNaN(d.getTime()))
    return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (fmt === "YYYY.MM")
    return `${y}.${m}`;
  if (fmt === "MM.DD")
    return `${m}.${day}`;
  if (fmt === "YYYY.MM.DD")
    return `${y}.${m}.${day}`;
  return `${y}-${m}-${day}`;
}
function todayStr() {
  return formatDate(/* @__PURE__ */ new Date());
}
function isToday(dateStr) {
  return formatDate(dateStr) === todayStr();
}
function daysBetween(startDate, endDate) {
  const start = new Date(startDate.replace(/-/g, "/"));
  const end = new Date(endDate.replace(/-/g, "/"));
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1e3 * 60 * 60 * 24)));
}
exports.daysBetween = daysBetween;
exports.formatDate = formatDate;
exports.isToday = isToday;
exports.todayStr = todayStr;
