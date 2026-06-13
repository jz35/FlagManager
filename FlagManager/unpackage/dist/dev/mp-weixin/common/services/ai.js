"use strict";
const STAGE_TEMPLATES = {
  学习: [
    { title: "基础积累", goal: "每天学习 1 小时，完成基础内容", reward: "看一集纪录片", punishment: "少刷 30 分钟视频" },
    { title: "强化训练", goal: "每天完成一套练习并复盘", reward: "奖励一杯奶茶", punishment: "取消一次娱乐" }
  ],
  健身: [
    { title: "适应期", goal: "每周锻炼 3 次，每次 30 分钟", reward: "买一件运动装备", punishment: "多做 20 个深蹲" },
    { title: "提升期", goal: "每周锻炼 4 次，增加力量训练", reward: "外出徒步", punishment: "减少一顿外卖" }
  ],
  默认: [
    { title: "启动阶段", goal: "建立每日执行习惯", reward: "小奖励一次", punishment: "减少娱乐时间" },
    { title: "巩固阶段", goal: "保持稳定节奏并复盘", reward: "完成庆祝", punishment: "自我约束一次" }
  ]
};
function suggestStages(flagTitle, category) {
  const key = STAGE_TEMPLATES[category] ? category : "默认";
  const templates = STAGE_TEMPLATES[key];
  return templates.map((item, index) => ({
    ...item,
    summary: `阶段 ${index + 1}：${item.title}`
  }));
}
function formatStageSuggestions(suggestions) {
  return suggestions.map((s) => `${s.title} - ${s.goal}`).join("\n");
}
exports.formatStageSuggestions = formatStageSuggestions;
exports.suggestStages = suggestStages;
