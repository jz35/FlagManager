<template>
	<view class="stats fm-page fm-page-padding">
		<view class="filter-bar fm-card">
			<text class="filter-bar__label">筛选</text>
			<picker :range="filterOptions" range-key="label" :value="filterIndex" @change="onFilterChange">
				<view class="filter-bar__picker">
					<text>{{ filterOptions[filterIndex].label }}</text>
					<text class="filter-bar__arrow">▼</text>
				</view>
			</picker>
		</view>

		<fm-section title="打卡热力图" />
		<view class="fm-card">
			<fm-heatmap :days="heatmapDays" @dayClick="onDayClick" />
		</view>

		<fm-section title="近4周打卡" />
		<view class="fm-card week-chart">
			<view v-for="item in weeklyChart" :key="item.label" class="week-chart__row">
				<text class="week-chart__label">{{ item.label }}</text>
				<view class="week-chart__bar-wrap">
					<view class="week-chart__bar" :style="{ width: item.percent + '%' }" />
				</view>
				<text class="week-chart__count">{{ item.count }}</text>
			</view>
		</view>

		<fm-section title="数据概览" />
		<fm-stat-card :items="overviewItems" />

		<fm-section title="Flag 进度" />
		<view class="fm-card" v-for="flag in displayFlags" :key="flag.id">
			<view class="flag-row">
				<text class="flag-row__title">{{ flag.title }}</text>
				<text class="flag-row__percent">{{ getProgress(flag) }}%</text>
			</view>
			<fm-progress-bar :percent="getProgress(flag)" />
		</view>
	</view>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import {
	buildHeatmapDays,
	getTotalCheckinDays,
	getCurrentStreak,
	getLongestStreak,
	getMonthCheckinCount,
	getFlagProgress,
	getCheckinsByDate
} from '@/common/utils/stats.js'
import { formatDate } from '@/common/utils/date.js'
import { todayStr } from '@/common/utils/date.js'

export default {
	data() {
		return {
			filterIndex: 0
		}
	},
	computed: {
		...mapState('flag', ['flags', 'stages', 'checkins']),
		...mapGetters('flag', ['activeFlags']),
		filterOptions() {
			return [{ label: '全部 Flag', value: '' }, ...this.flags.map(f => ({ label: f.title, value: f.id }))]
		},
		filteredCheckins() {
			const flagId = this.filterOptions[this.filterIndex].value
			if (!flagId) return this.checkins
			return this.checkins.filter(c => c.flagId === flagId)
		},
		heatmapDays() {
			return buildHeatmapDays(this.filteredCheckins)
		},
		weeklyChart() {
			const checkins = this.filteredCheckins
			const today = new Date(todayStr().replace(/-/g, '/'))
			const weeks = []
			for (let w = 3; w >= 0; w--) {
				const end = new Date(today)
				end.setDate(end.getDate() - w * 7)
				const start = new Date(end)
				start.setDate(start.getDate() - 6)
				const startStr = formatDate(start)
				const endStr = formatDate(end)
				const count = checkins.filter(c => c.checkinDate >= startStr && c.checkinDate <= endStr).length
				weeks.push({
					label: `${formatDate(start, 'MM.DD')}-${formatDate(end, 'MM.DD')}`,
					count,
					percent: 0
				})
			}
			const max = Math.max(...weeks.map(w => w.count), 1)
			return weeks.map(w => ({ ...w, percent: Math.round((w.count / max) * 100) }))
		},
		overviewItems() {
			const checkins = this.filteredCheckins
			return [
				{ label: '累计打卡', value: `${getTotalCheckinDays(checkins)} 天` },
				{ label: '当前连续', value: `${getCurrentStreak(checkins)} 天` },
				{ label: '最长连续', value: `${getLongestStreak(checkins)} 天` },
				{ label: '本月打卡', value: `${getMonthCheckinCount(checkins)} 次` }
			]
		},
		displayFlags() {
			const flagId = this.filterOptions[this.filterIndex].value
			if (!flagId) return this.activeFlags.length ? this.activeFlags : this.flags
			return this.flags.filter(f => f.id === flagId)
		}
	},
	methods: {
		onFilterChange(e) {
			this.filterIndex = Number(e.detail.value)
		},
		getProgress(flag) {
			if (flag.status === 'abandoned') return 0
			return getFlagProgress(flag, this.stages, this.checkins)
		},
		onDayClick(day) {
			if (!day.count) {
				uni.showToast({ title: `${formatDate(day.date, 'MM.DD')} 无打卡`, icon: 'none' })
				return
			}
			const list = getCheckinsByDate(this.filteredCheckins, day.date)
			const content = list.map(c => c.content).join('\n')
			uni.showModal({
				title: `${formatDate(day.date, 'MM.DD')} 打卡记录`,
				content: content || '无内容',
				showCancel: false
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.stats {
	padding-top: 24rpx;
	padding-bottom: 32rpx;
}

.filter-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.filter-bar__label {
	font-size: 28rpx;
	color: $fm-color-text;
}

.filter-bar__picker {
	display: flex;
	align-items: center;
	font-size: 28rpx;
	color: $fm-color-primary;
}

.filter-bar__arrow {
	margin-left: 8rpx;
	font-size: 20rpx;
}

.week-chart__row {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.week-chart__label {
	width: 180rpx;
	font-size: 22rpx;
	color: $fm-color-text-secondary;
	flex-shrink: 0;
}

.week-chart__bar-wrap {
	flex: 1;
	height: 20rpx;
	background-color: #f3f4f6;
	border-radius: 10rpx;
	overflow: hidden;
	margin: 0 16rpx;
}

.week-chart__bar {
	height: 100%;
	background-color: $fm-color-primary;
	border-radius: 10rpx;
	min-width: 4rpx;
}

.week-chart__count {
	width: 48rpx;
	text-align: right;
	font-size: 24rpx;
	color: $fm-color-text;
}

.flag-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.flag-row__title {
	font-size: 28rpx;
	color: $fm-color-text;
}

.flag-row__percent {
	font-size: 28rpx;
	color: $fm-color-primary;
	font-weight: 600;
}
</style>
