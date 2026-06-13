"use strict";
const common_mock_flagData = require("../common/mock/flag-data.js");
const store_persist = require("./persist.js");
let idCounter = 100;
function syncIdCounter(flags, stages, checkins) {
  const ids = [
    ...flags.map((f) => f.id),
    ...stages.map((s) => s.id),
    ...checkins.map((c) => c.id)
  ];
  ids.forEach((id) => {
    const num = Number(String(id).split("_").pop());
    if (!Number.isNaN(num) && num > idCounter)
      idCounter = num;
  });
}
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}
const persisted = store_persist.loadPersistedState();
const initialFlags = (persisted == null ? void 0 : persisted.flags) || [...common_mock_flagData.mockFlags];
const initialStages = (persisted == null ? void 0 : persisted.stages) || [...common_mock_flagData.mockStages];
const initialCheckins = (persisted == null ? void 0 : persisted.checkins) || [...common_mock_flagData.mockCheckins];
syncIdCounter(initialFlags, initialStages, initialCheckins);
const flagModule = {
  namespaced: true,
  state: {
    user: (persisted == null ? void 0 : persisted.user) || { ...common_mock_flagData.mockUser, loggedIn: false, openId: "" },
    flags: initialFlags,
    stages: initialStages,
    checkins: initialCheckins,
    currentFlagId: null
  },
  getters: {
    activeFlags(state) {
      return state.flags.filter((f) => f.status === "active");
    },
    pausedFlags(state) {
      return state.flags.filter((f) => f.status === "paused");
    },
    getFlagsByStatus: (state) => (status) => {
      if (!status || status === "all")
        return [...state.flags];
      return state.flags.filter((f) => f.status === status);
    },
    getFlagById: (state) => (id) => state.flags.find((f) => f.id === id),
    getStagesByFlagId: (state) => (flagId) => state.stages.filter((s) => s.flagId === flagId),
    getStageById: (state) => (id) => state.stages.find((s) => s.id === id),
    getCheckinsByFlagId: (state) => (flagId) => state.checkins.filter((c) => c.flagId === flagId).sort((a, b) => b.checkinDate.localeCompare(a.checkinDate)),
    getCheckinsByStageId: (state) => (stageId) => state.checkins.filter((c) => c.stageId === stageId).sort((a, b) => b.checkinDate.localeCompare(a.checkinDate)),
    completedFlagCount(state) {
      return state.flags.filter((f) => f.status === "completed").length;
    },
    isLoggedIn(state) {
      return !!state.user.loggedIn;
    }
  },
  mutations: {
    SET_CURRENT_FLAG(state, id) {
      state.currentFlagId = id;
    },
    SET_USER(state, user) {
      state.user = { ...state.user, ...user };
    },
    ADD_FLAG(state, flag) {
      state.flags.unshift(flag);
    },
    UPDATE_FLAG(state, flag) {
      const idx = state.flags.findIndex((f) => f.id === flag.id);
      if (idx >= 0)
        state.flags.splice(idx, 1, { ...state.flags[idx], ...flag });
    },
    ADD_STAGE(state, stage) {
      state.stages.push(stage);
    },
    UPDATE_STAGE(state, stage) {
      const idx = state.stages.findIndex((s) => s.id === stage.id);
      if (idx >= 0)
        state.stages.splice(idx, 1, { ...state.stages[idx], ...stage });
    },
    ADD_CHECKIN(state, checkin) {
      state.checkins.push(checkin);
    }
  },
  actions: {
    createFlag({ commit, state }, payload) {
      const flag = {
        id: nextId("flag"),
        userId: state.user.id,
        status: "active",
        cover: "",
        ...payload
      };
      commit("ADD_FLAG", flag);
      return flag;
    },
    updateFlag({ commit, getters }, payload) {
      const flag = getters.getFlagById(payload.id);
      if (!flag)
        return null;
      const updated = { ...flag, ...payload };
      commit("UPDATE_FLAG", updated);
      return updated;
    },
    createStage({ commit }, payload) {
      const stage = {
        id: nextId("stage"),
        status: "pending",
        reward: "",
        punishment: "",
        ...payload
      };
      commit("ADD_STAGE", stage);
      return stage;
    },
    updateStage({ commit, getters }, payload) {
      const stage = getters.getStageById(payload.id);
      if (!stage)
        return null;
      const updated = { ...stage, ...payload };
      commit("UPDATE_STAGE", updated);
      return updated;
    },
    createCheckin({ commit, getters }, payload) {
      var _a;
      const stage = getters.getStageById(payload.stageId);
      const checkin = {
        id: nextId("checkin"),
        userId: ((_a = getters.getFlagById(payload.flagId)) == null ? void 0 : _a.userId) || "user_1",
        images: [],
        createdAt: payload.checkinDate,
        ...payload
      };
      commit("ADD_CHECKIN", checkin);
      if (stage && stage.status === "pending") {
        commit("UPDATE_STAGE", { ...stage, status: "active" });
      }
      return checkin;
    },
    updateFlagStatus({ commit, getters }, { id, status }) {
      const flag = getters.getFlagById(id);
      if (flag)
        commit("UPDATE_FLAG", { ...flag, status });
    },
    login({ commit }, { openId, nickname, avatarUrl }) {
      commit("SET_USER", {
        openId,
        nickname: nickname || "微信用户",
        avatarUrl: avatarUrl || "",
        loggedIn: true
      });
    },
    logout({ commit, state }) {
      commit("SET_USER", {
        ...state.user,
        loggedIn: false,
        openId: ""
      });
    }
  }
};
exports.flagModule = flagModule;
