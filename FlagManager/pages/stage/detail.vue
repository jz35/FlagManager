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
				<text class="reward-card__progress">打卡进度：{{ stageResult.actual }} / {{ stageResult.expected }} 次</text>
				<text class="reward-card__item">完成奖励：{{ stage.reward || '未设置' }}</text>
				<text class="reward-card__item">未完成惩罚：{{ stage.punishment || '未设置' }}</text>
			</view>

			<fm-section title="阶段统计" />
			<fm-stat-card :items="statItems" />

			<fm-section title="打卡记录" />
			<fm-checkin-card v-for="item in checkinList" :key="item.id" :checkin="item" />
			<view v-if="!checkinList.length" class="fm-card empty-tip">暂无打卡记录</view>
		</view>

		<view v-if="canCheckin" class="fm-fixed-bottom">
			<button class="fm-btn-primary fm-btn-block" @click="goCheckin">打卡</button>
		</view>
	</view>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import { formatDate } from '@/common/utils/date.js'
import {
	getStageProgress,
	getStageMissCount,
	getCurrentStreak,
	evaluateStageResult,
	isStageEnded
} from '@/common/utils/stats.js'
import { canFlagCheckin } from '@/common/utils/validate.js'

const STATUS_MAP = {
	pending: '未开始',
	active: '进行中',
	completed: '已完成',
	failed: '未完成'
}

export default {
	data() {
		return {
			stageId: '',
			resultChecked: false
		}
	},
	computed: {
		...mapState('flag', ['checkins']),
		...mapGetters('flag', ['getStageById', 'getCheckinsByStageId', 'getFlagById']),
		stage() {
			return this.getStageById(this.stageId)
		},
		flag() {
			return this.stage ? this.getFlagById(this.stage.flagId) : null
		},
		checkinList() {
			return this.getCheckinsByStageId(this.stageId)
		},
		progress() {
			return this.stage ? getStageProgress(this.stage, this.checkins) : 0
		},
		stageResult() {
			return this.stage ? evaluateStageResult(this.stage, this.checkins) : { expected: 0, actual: 0, passed: false }
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
			if (this.stage?.status === 'failed') return 'abandoned'
			return 'pending'
		},
		canCheckin() {
			if (!canFlagCheckin(this.flag)) return false
			if (!this.stage) return false
			return this.stage.status === 'active' || this.stage.status === 'pending'
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
	onShow() {
		if (this.stage) {
			uni.setNavigationBarTitle({ title: this.stage.title })
		}
		this.checkStageResult()
	},
	methods: {
		...mapActions('flag', ['updateStage']),
		goCheckin() {
			if (!canFlagCheckin(this.flag)) {
				uni.showToast({ title: '当前 Flag 不可打卡', icon: 'none' })
				return
			}
			uni.navigateTo({
				url: `/pages/checkin/create?flagId=${this.stage.flagId}&stageId=${this.stageId}`
			})
		},
		checkStageResult() {
			if (!this.stage || this.resultChecked) return
			if (this.stage.status !== 'active' && this.stage.status !== 'pending') return
			if (!isStageEnded(this.stage)) return

			this.resultChecked = true
			const { passed } = this.stageResult
			if (passed) {
				uni.showModal({
					title: '阶段完成',
					content: `恭喜达标！\n\n完成奖励：${this.stage.reward || '未设置'}`,
					showCancel: false,
					success: () => {
						this.updateStage({ id: this.stageId, status: 'completed' })
					}
				})
				return
			}
			uni.showModal({
				title: '阶段未完成',
				content: `本阶段未达标。\n\n未完成惩罚：${this.stage.punishment || '未设置'}`,
				showCancel: false,
				success: () => {
					this.updateStage({ id: this.stageId, status: 'failed' })
				}
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

.reward-card__progress {
	display: block;
	font-size: 26rpx;
	color: $fm-color-primary;
	font-weight: 500;
	margin-bottom: 16rpx;
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
