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
