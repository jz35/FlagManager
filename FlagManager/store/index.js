import { createStore } from 'vuex'
import flag from './flag.js'

const store = createStore({
	modules: {
		flag
	}
})

export default store
