import { getTodayPendingStages } from '@/common/utils/stats.js'
import { todayStr } from '@/common/utils/date.js'

const REMINDER_KEY = 'flagmanager_last_reminder_date'

export function checkDailyReminder({ stages, checkins, flags }) {
	const today = todayStr()
	const last = uni.getStorageSync(REMINDER_KEY)
	if (last === today) return

	const pending = getTodayPendingStages(stages, checkins, flags)
	if (!pending.length) return

	uni.setStorageSync(REMINDER_KEY, today)
	const names = pending.slice(0, 3).map(s => s.title).join('、')
	const suffix = pending.length > 3 ? ' 等' : ''
	uni.showModal({
		title: '今日待打卡',
		content: `你还有 ${pending.length} 个阶段待打卡：${names}${suffix}`,
		confirmText: '知道了',
		showCancel: false
	})
}
