const STORAGE_KEY = 'flagmanager_state'

export function loadPersistedState() {
	try {
		const raw = uni.getStorageSync(STORAGE_KEY)
		return raw ? JSON.parse(raw) : null
	} catch (e) {
		return null
	}
}

export function savePersistedState(state) {
	const payload = {
		user: state.flag.user,
		flags: state.flag.flags,
		stages: state.flag.stages,
		checkins: state.flag.checkins
	}
	uni.setStorageSync(STORAGE_KEY, JSON.stringify(payload))
}

export function createPersistPlugin() {
	return store => {
		store.subscribe((_mutation, state) => {
			savePersistedState(state)
		})
	}
}
