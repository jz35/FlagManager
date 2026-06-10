<template>
	<view v-if="stage" class="stage-detail fm-page">
		<view class="fm-page-padding detail-body">
			<view class="fm-card">
				<text class="stage-goal">{{ stage.goal }}</text>
				<view class="stage-meta">
					<text>时间：{{ dateRange }}</text>
					<text :class="['fm-status-tag', statusClass]">{{ statusText }}</text>
				</view>
				<fm-progress-bar :percent="progress" label="阶段进度" />
			</view>

			<fm-section title="奖惩" />
			<view class="fm-card reward-card">
				<text class="reward-card__item">完成奖励：{{ stage.reward || '未设置' }}</text>
				<text class="reward-card__item">未完成惩罚：{{ stage.punishment || '未设置' }}</text>
			</view>

			<fm-section title="阶段统计" />
			<fm-stat-card :items="statItems" />

			<fm-section title="打卡记录" />
			<fm-checkin-card v-for="item in checkinList" :key="item.id" :checkin="item" />
			<view v-if="!checkinList.length" class="fm-card empty-tip">暂无打卡记录</view>
		</view>

		<view class="fm-fixed-bottom">
			<button class="fm-btn-primary fm-btn-block" @click="goCheckin">打卡</button>
		</view>
	</view>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { formatDate } from '@/common/utils/date.js'
import { getStageProgress, getStageMissCount } from '@/common/utils/stats.js'
import { getCurrentStreak } from '@/common/utils/stats.js'

const STATUS_MAP = {
	pending: '未开始',
	active: '进行中',
	completed: '已完成',
	failed: '未完成'
}

export default {
	data() {
		return { stageId: '' }
	},
	computed: {
		...mapState('flag', ['checkins']),
		...mapGetters('flag', ['getStageById', 'getCheckinsByStageId']),
		stage() {
			return this.getStageById(this.stageId)
		},
		checkinList() {
			return this.getCheckinsByStageId(this.stageId)
		},
		progress() {
			return this.stage ? getStageProgress(this.stage, this.checkins) : 0
		},
		dateRange() {
			if (!this.stage) return ''
			return `${formatDate(this.stage.startDate, 'MM.DD')} - ${formatDate(this.stage.endDate, 'MM.DD')}`
		},
		statusText() {
			return STATUS_MAP[this.stage?.status] || ''
		},
		statusClass() {
			if (this.stage?.status === 'completed') return 'done'
			if (this.stage?.status === 'active') return 'active'
			return 'pending'
		},
		statItems() {
			const stageCheckins = this.checkinList
			return [
				{ label: '已打卡', value: `${stageCheckins.length} 次` },
				{ label: '当前连续', value: `${getCurrentStreak(stageCheckins)} 天` },
				{ label: '缺卡', value: `${getStageMissCount(this.stage, this.checkins)} 次` }
			]
		}
	},
	onLoad(options) {
		this.stageId = options.id || ''
		if (this.stage) {
			uni.setNavigationBarTitle({ title: this.stage.title })
		}
	},
	methods: {
		goCheckin() {
			uni.navigateTo({
				url: `/pages/checkin/create?flagId=${this.stage.flagId}&stageId=${this.stageId}`
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.detail-body {
	padding-top: 24rpx;
	padding-bottom: 160rpx;
}

.stage-goal {
	display: block;
	font-size: 28rpx;
	line-height: 1.6;
	margin-bottom: 16rpx;
}

.stage-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 24rpx;
	color: $fm-color-text-secondary;
	margin-bottom: 20rpx;
}

.reward-card__item {
	display: block;
	font-size: 28rpx;
	margin-bottom: 12rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.empty-tip {
	font-size: 26rpx;
	color: $fm-color-text-secondary;
	text-align: center;
}
</style>
