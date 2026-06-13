import { createStore } from 'vuex'
import flag from './flag.js'
import { createPersistPlugin } from './persist.js'

const store = createStore({
	modules: {
		flag
	},
	plugins: [createPersistPlugin()]
})

export default store
