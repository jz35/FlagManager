"use strict";
const FLAG_CATEGORIES = ["学习", "健身", "阅读", "项目", "自定义"];
const FREQUENCY_PERIOD_OPTIONS = [
  { label: "日", value: "day" },
  { label: "周", value: "week" },
  { label: "月", value: "month" }
];
const FREQUENCY_TIMES_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
function parseCheckinFrequency(freq) {
  if (freq === "daily")
    return { period: "day", times: 1 };
  if (freq === "weekly3")
    return { period: "week", times: 3 };
  if (typeof freq === "string" && freq.startsWith("custom:")) {
    const [, period, times] = freq.split(":");
    return { period, times: Number(times) || 1 };
  }
  return { period: "day", times: 1 };
}
function buildCustomFrequency(period, times) {
  return `custom:${period}:${times}`;
}
const FLAG_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  PAUSED: "paused",
  ABANDONED: "abandoned"
};
const FLAG_STATUS_LABELS = {
  active: "进行中",
  completed: "已完成",
  paused: "已暂停",
  abandoned: "已放弃"
};
const FLAG_LIST_TABS = [
  { label: "全部", value: "all" },
  { label: "进行中", value: FLAG_STATUS.ACTIVE },
  { label: "已暂停", value: FLAG_STATUS.PAUSED },
  { label: "已完成", value: FLAG_STATUS.COMPLETED },
  { label: "已放弃", value: FLAG_STATUS.ABANDONED }
];
const CHECKIN_MOODS = ["轻松", "一般", "有点累", "自定义"];
const CHECKIN_MOOD_CUSTOM = "自定义";
const CHECKIN_MOOD_MAX_LENGTH = 6;
const CUSTOM_MOOD_STORAGE_KEY = "flagmanager_custom_moods";
const CHECKIN_FREQUENCIES = [
  { label: "每天", value: "daily" },
  { label: "每周3次", value: "weekly3" },
  { label: "自定义", value: "custom" }
];
const mockUser = {
  id: "user_1",
  nickname: "用户昵称",
  avatarUrl: "",
  bio: "大学生开发者",
  loggedIn: false,
  openId: ""
};
const mockFlags = [
  {
    id: "flag_1",
    userId: "user_1",
    title: "完成考研英语",
    description: "6个月内完成英语基础学习，通过考研英语一",
    category: "学习",
    startDate: "2026-02-01",
    targetDate: "2026-08-31",
    status: "active",
    cover: ""
  },
  {
    id: "flag_2",
    userId: "user_1",
    title: "坚持健身三个月",
    description: "每周至少锻炼3次，养成运动习惯",
    category: "健身",
    startDate: "2026-03-01",
    targetDate: "2026-06-01",
    status: "active",
    cover: ""
  },
  {
    id: "flag_3",
    userId: "user_1",
    title: "读完12本书",
    description: "今年养成阅读习惯，每月至少读一本",
    category: "阅读",
    startDate: "2026-01-01",
    targetDate: "2026-12-31",
    status: "paused",
    cover: ""
  },
  {
    id: "flag_4",
    userId: "user_1",
    title: "通过英语四级",
    description: "大一上学期完成四级备考并通过考试",
    category: "学习",
    startDate: "2025-09-01",
    targetDate: "2025-12-20",
    status: "completed",
    cover: ""
  },
  {
    id: "flag_5",
    userId: "user_1",
    title: "学会做10道菜",
    description: "掌握基础家常菜",
    category: "自定义",
    startDate: "2025-10-01",
    targetDate: "2026-01-31",
    status: "abandoned",
    cover: ""
  }
];
const mockStages = [
  {
    id: "stage_1",
    flagId: "flag_1",
    title: "单词强化",
    goal: "每天背50个单词，坚持30天",
    startDate: "2026-06-01",
    endDate: "2026-07-01",
    checkinFrequency: "daily",
    reward: "看一场电影",
    punishment: "周末少玩1小时游戏",
    status: "active"
  },
  {
    id: "stage_2",
    flagId: "flag_1",
    title: "阅读训练",
    goal: "每天完成一篇英语阅读",
    startDate: "2026-07-01",
    endDate: "2026-08-01",
    checkinFrequency: "daily",
    reward: "买一本新书",
    punishment: "减少娱乐时间",
    status: "pending"
  },
  {
    id: "stage_3",
    flagId: "flag_2",
    title: "基础适应",
    goal: "每周锻炼3次，每次30分钟",
    startDate: "2026-03-01",
    endDate: "2026-04-01",
    checkinFrequency: "weekly3",
    reward: "奖励一次聚餐",
    punishment: "少看一集剧",
    status: "active"
  }
];
function buildCheckins() {
  const checkins = [];
  const contents = [
    "背了50个单词，复习了昨天内容",
    "完成单词测试，正确率85%",
    "学习了新词根词缀",
    "做了30分钟有氧训练",
    "完成了力量训练",
    "复习昨天单词并做阅读"
  ];
  const moods = ["轻松", "一般", "有点累"];
  let id = 1;
  const today = /* @__PURE__ */ new Date();
  for (let i = 0; i < 68; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (i % 3 === 2 && i > 5)
      continue;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${day}`;
    const flagId = i % 3 === 0 ? "flag_2" : "flag_1";
    const stageId = flagId === "flag_1" ? "stage_1" : "stage_3";
    const checkinId = `checkin_${id++}`;
    checkins.push({
      id: checkinId,
      userId: "user_1",
      flagId,
      stageId,
      content: contents[i % contents.length],
      images: i % 4 === 0 ? [`https://picsum.photos/seed/${checkinId}/400/400`] : [],
      mood: moods[i % moods.length],
      checkinDate: dateStr,
      createdAt: dateStr
    });
  }
  return checkins.reverse();
}
const mockCheckins = buildCheckins();
exports.CHECKIN_FREQUENCIES = CHECKIN_FREQUENCIES;
exports.CHECKIN_MOODS = CHECKIN_MOODS;
exports.CHECKIN_MOOD_CUSTOM = CHECKIN_MOOD_CUSTOM;
exports.CHECKIN_MOOD_MAX_LENGTH = CHECKIN_MOOD_MAX_LENGTH;
exports.CUSTOM_MOOD_STORAGE_KEY = CUSTOM_MOOD_STORAGE_KEY;
exports.FLAG_CATEGORIES = FLAG_CATEGORIES;
exports.FLAG_LIST_TABS = FLAG_LIST_TABS;
exports.FLAG_STATUS_LABELS = FLAG_STATUS_LABELS;
exports.FREQUENCY_PERIOD_OPTIONS = FREQUENCY_PERIOD_OPTIONS;
exports.FREQUENCY_TIMES_OPTIONS = FREQUENCY_TIMES_OPTIONS;
exports.buildCustomFrequency = buildCustomFrequency;
exports.mockCheckins = mockCheckins;
exports.mockFlags = mockFlags;
exports.mockStages = mockStages;
exports.mockUser = mockUser;
exports.parseCheckinFrequency = parseCheckinFrequency;
