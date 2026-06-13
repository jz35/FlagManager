<script>
import store from '@/store/index.js'
import { checkDailyReminder } from '@/common/services/reminder.js'

export default {
	onLaunch() {
		console.log('FlagManager Launch')
	},
	onShow() {
		const state = store.state.flag
		checkDailyReminder({
			stages: state.stages,
			checkins: state.checkins,
			flags: state.flags
		})
	},
	onHide() {
		console.log('FlagManager Hide')
	}
}
</script>

<style lang="scss">
@import '@/uni_modules/uni-scss/index.scss';
@import '@/common/styles/theme.scss';

page {
	background-color: #f6f7f5;
	height: 100%;
	font-size: 28rpx;
	color: #1f2933;
}
</style>
