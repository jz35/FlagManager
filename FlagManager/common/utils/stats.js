import { formatDate, daysBetween, todayStr } from './date.js'

function uniqueDates(checkins) {
	const set = new Set(checkins.map(c => c.checkinDate))
	return [...set].sort()
}

export function getTotalCheckinDays(checkins) {
	return uniqueDates(checkins).length
}

export function getCurrentStreak(checkins) {
	const dates = uniqueDates(checkins)
	if (!dates.length) return 0
	const dateSet = new Set(dates)
	let streak = 0
	const today = new Date(todayStr().replace(/-/g, '/'))
	let cursor = new Date(today)
	if (!dateSet.has(formatDate(cursor))) {
		cursor.setDate(cursor.getDate() - 1)
	}
	while (dateSet.has(formatDate(cursor))) {
		streak++
		cursor.setDate(cursor.getDate() - 1)
	}
	return streak
}

export function getLongestStreak(checkins) {
	const dates = uniqueDates(checkins)
	if (!dates.length) return 0
	let max = 1
	let current = 1
	for (let i = 1; i < dates.length; i++) {
		const prev = new Date(dates[i - 1].replace(/-/g, '/'))
		const cur = new Date(dates[i].replace(/-/g, '/'))
		const diff = (cur - prev) / (1000 * 60 * 60 * 24)
		if (diff === 1) {
			current++
			max = Math.max(max, current)
		} else {
			current = 1
		}
	}
	return max
}

export function getMonthCheckinCount(checkins, date = new Date()) {
	const y = date.getFullYear()
	const m = date.getMonth()
	return checkins.filter(c => {
		const d = new Date(c.checkinDate.replace(/-/g, '/'))
		return d.getFullYear() === y && d.getMonth() === m
	}).length
}

import { parseCheckinFrequency } from '@/common/mock/flag-data.js'

function getExpectedCheckinCount(stage) {
	const totalDays = Math.max(1, daysBetween(stage.startDate, stage.endDate) + 1)
	const { period, times } = parseCheckinFrequency(stage.checkinFrequency)
	if (period === 'day') return totalDays * times
	if (period === 'week') return Math.ceil(totalDays / 7) * times
	if (period === 'month') return Math.ceil(totalDays / 30) * times
	return totalDays
}

export function getStageProgress(stage, checkins) {
	const stageCheckins = checkins.filter(c => c.stageId === stage.id)
	const expected = getExpectedCheckinCount(stage)
	const done = stageCheckins.length
	return Math.min(100, Math.round((done / expected) * 100))
}

export function getFlagProgress(flag, stages, checkins) {
	const flagStages = stages.filter(s => s.flagId === flag.id)
	if (!flagStages.length) {
		const totalDays = Math.max(1, daysBetween(flag.startDate, flag.targetDate) + 1)
		const elapsed = daysBetween(flag.startDate, todayStr()) + 1
		return Math.min(100, Math.round((elapsed / totalDays) * 100))
	}
	const progresses = flagStages.map(s => getStageProgress(s, checkins))
	return Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length)
}

export function buildHeatmapDays(checkins, days = 84) {
	const map = {}
	checkins.forEach(c => {
		map[c.checkinDate] = (map[c.checkinDate] || 0) + 1
	})
	const result = []
	const today = new Date(todayStr().replace(/-/g, '/'))
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(today)
		d.setDate(d.getDate() - i)
		const date = formatDate(d)
		result.push({ date, count: map[date] || 0 })
	}
	return result
}

export function getCheckinsByDate(checkins, date) {
	return checkins.filter(c => c.checkinDate === date)
}

export function getTodayPendingStages(stages, checkins) {
	const today = todayStr()
	return stages.filter(stage => {
		if (stage.status !== 'active') return false
		if (today < stage.startDate || today > stage.endDate) return false
		const hasToday = checkins.some(c => c.stageId === stage.id && c.checkinDate === today)
		return !hasToday
	})
}

export function getStageMissCount(stage, checkins) {
	const stageCheckins = checkins.filter(c => c.stageId === stage.id)
	const expected = getExpectedCheckinCount(stage)
	return Math.max(0, expected - stageCheckins.length)
}
