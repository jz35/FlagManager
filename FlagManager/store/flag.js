import { mockUser, mockFlags, mockStages, mockCheckins } from '@/common/mock/flag-data.js'

let idCounter = 100

function nextId(prefix) {
	idCounter += 1
	return `${prefix}_${idCounter}`
}

const flagModule = {
	namespaced: true,
	state: {
		user: { ...mockUser },
		flags: [...mockFlags],
		stages: [...mockStages],
		checkins: [...mockCheckins],
		currentFlagId: null
	},
	getters: {
		activeFlags(state) {
			return state.flags.filter(f => f.status === 'active')
		},
		pausedFlags(state) {
			return state.flags.filter(f => f.status === 'paused')
		},
		getFlagsByStatus: state => status => {
			if (!status || status === 'all') return [...state.flags]
			return state.flags.filter(f => f.status === status)
		},
		getFlagById: state => id => state.flags.find(f => f.id === id),
		getStagesByFlagId: state => flagId => state.stages.filter(s => s.flagId === flagId),
		getStageById: state => id => state.stages.find(s => s.id === id),
		getCheckinsByFlagId: state => flagId =>
			state.checkins.filter(c => c.flagId === flagId).sort((a, b) => b.checkinDate.localeCompare(a.checkinDate)),
		getCheckinsByStageId: state => stageId =>
			state.checkins.filter(c => c.stageId === stageId).sort((a, b) => b.checkinDate.localeCompare(a.checkinDate)),
		completedFlagCount(state) {
			return state.flags.filter(f => f.status === 'completed').length
		}
	},
	mutations: {
		SET_CURRENT_FLAG(state, id) {
			state.currentFlagId = id
		},
		ADD_FLAG(state, flag) {
			state.flags.unshift(flag)
		},
		UPDATE_FLAG(state, flag) {
			const idx = state.flags.findIndex(f => f.id === flag.id)
			if (idx >= 0) state.flags.splice(idx, 1, { ...state.flags[idx], ...flag })
		},
		ADD_STAGE(state, stage) {
			state.stages.push(stage)
		},
		ADD_CHECKIN(state, checkin) {
			state.checkins.push(checkin)
		}
	},
	actions: {
		createFlag({ commit }, payload) {
			const flag = {
				id: nextId('flag'),
				userId: 'user_1',
				status: 'active',
				cover: '',
				...payload
			}
			commit('ADD_FLAG', flag)
			return flag
		},
		createStage({ commit }, payload) {
			const stage = {
				id: nextId('stage'),
				status: 'active',
				...payload
			}
			commit('ADD_STAGE', stage)
			return stage
		},
		createCheckin({ commit }, payload) {
			const checkin = {
				id: nextId('checkin'),
				userId: 'user_1',
				images: [],
				createdAt: payload.checkinDate,
				...payload
			}
			commit('ADD_CHECKIN', checkin)
			return checkin
		},
		updateFlagStatus({ commit, getters }, { id, status }) {
			const flag = getters.getFlagById(id)
			if (flag) commit('UPDATE_FLAG', { ...flag, status })
		}
	}
}

export default flagModule
