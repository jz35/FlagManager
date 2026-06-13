<template>
	<view v-if="flag" class="flag-detail fm-page">
		<view class="fm-page-padding detail-body">
			<view class="detail-top">
				<text class="detail-top__title">{{ flag.title }}</text>
				<text v-if="showMoreMenu" class="detail-top__more" @click="showActions">···</text>
			</view>
			<view class="fm-card info-card">
				<text class="info-card__desc">{{ flag.description }}</text>
				<view class="info-card__meta">
					<text :class="['fm-status-tag', statusClass]">{{ statusText }}</text>
					<text class="info-card__date">{{ dateRange }}</text>
				</view>
				<fm-progress-bar :percent="progress" label="总进度" />
			</view>

			<fm-section title="打卡热力图" />
			<view class="fm-card">
				<fm-heatmap :days="heatmapDays" @dayClick="onDayClick" />
			</view>

			<fm-section
				title="阶段计划"
				:action-text="canAddStage ? '+ 添加阶段' : ''"
				@action="goCreateStage"
			/>
			<fm-stage-card
				v-for="stage in stages"
				:key="stage.id"
				:stage="stage"
				:progress="getStageProgress(stage)"
				@click="goStageDetail(stage)"
			/>
			<button v-if="canAddStage && !stages.length" class="fm-btn-outline fm-btn-block" @click="goCreateStage">+ 添加阶段</button>
			<view v-if="!canAddStage && !stages.length" class="fm-card empty-tip">暂无阶段计划</view>

			<fm-section title="最近打卡" />
			<fm-checkin-card v-for="item in recentCheckins" :key="item.id" :checkin="item" />
			<view v-if="!recentCheckins.length" class="fm-card empty-tip">暂无打卡记录</view>
		</view>

		<view v-if="showBottomAction" class="fm-fixed-bottom">
			<button class="fm-btn-primary fm-btn-block" @click="onBottomAction">{{ bottomActionText }}</button>
		</view>
	</view>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import { formatDate } from '@/common/utils/date.js'
import { buildHeatmapDays, getFlagProgress, getStageProgress, getCheckinsByDate } from '@/common/utils/stats.js'
import { canFlagCheckin } from '@/common/utils/validate.js'

const STATUS_MAP = {
	active: '进行中',
	completed: '已完成',
	paused: '已暂停',
	abandoned: '已放弃'
}

const ACTION_MENUS = {
	active: { items: ['编辑', '暂停', '完成', '放弃'], actions: ['edit', 'paused', 'completed', 'abandoned'] },
	paused: { items: ['编辑', '重启', '完成', '放弃'], actions: ['edit', 'resume', 'completed', 'abandoned'] },
	completed: { items: ['编辑'], actions: ['edit'] },
	abandoned: { items: [], actions: [] }
}

export default {
	data() {
		return { flagId: '' }
	},
	computed: {
		...mapState('flag', ['checkins']),
		...mapGetters('flag', ['getFlagById', 'getStagesByFlagId', 'getCheckinsByFlagId']),
		flag() {
			return this.getFlagById(this.flagId)
		},
		stages() {
			return this.getStagesByFlagId(this.flagId)
		},
		recentCheckins() {
			return this.getCheckinsByFlagId(this.flagId).slice(0, 5)
		},
		progress() {
			return this.flag ? getFlagProgress(this.flag, this.stages, this.checkins) : 0
		},
		heatmapDays() {
			return buildHeatmapDays(this.getCheckinsByFlagId(this.flagId))
		},
		dateRange() {
			if (!this.flag) return ''
			return `${formatDate(this.flag.startDate, 'YYYY.MM.DD')} - ${formatDate(this.flag.targetDate, 'YYYY.MM.DD')}`
		},
		statusText() {
			return STATUS_MAP[this.flag?.status] || ''
		},
		statusClass() {
			if (this.flag?.status === 'completed') return 'done'
			if (this.flag?.status === 'active') return 'active'
			if (this.flag?.status === 'paused') return 'paused'
			if (this.flag?.status === 'abandoned') return 'abandoned'
			return 'pending'
		},
		canAddStage() {
			return this.flag?.status === 'active'
		},
		showMoreMenu() {
			return (ACTION_MENUS[this.flag?.status]?.items.length || 0) > 0
		},
		showBottomAction() {
			return this.flag?.status === 'active' || this.flag?.status === 'paused'
		},
		bottomActionText() {
			return this.flag?.status === 'paused' ? '重启' : '打卡'
		}
	},
	onLoad(options) {
		this.flagId = options.id || ''
		if (this.flag) {
			uni.setNavigationBarTitle({ title: this.flag.title })
		}
	},
	onShow() {
		if (this.flag) {
			uni.setNavigationBarTitle({ title: this.flag.title })
		}
	},
	methods: {
		...mapActions('flag', ['updateFlagStatus']),
		getStageProgress(stage) {
			return getStageProgress(stage, this.checkins)
		},
		goCreateStage() {
			uni.navigateTo({ url: `/pages/stage/create?flagId=${this.flagId}` })
		},
		goStageDetail(stage) {
			uni.navigateTo({ url: `/pages/stage/detail?id=${stage.id}` })
		},
		goCheckin() {
			if (!canFlagCheckin(this.flag)) {
				uni.showToast({ title: '当前 Flag 不可打卡', icon: 'none' })
				return
			}
			const activeStage = this.stages.find(s => s.status === 'active' || s.status === 'pending')
			let url = `/pages/checkin/create?flagId=${this.flagId}`
			if (activeStage) url += `&stageId=${activeStage.id}`
			uni.navigateTo({ url })
		},
		goEdit() {
			uni.navigateTo({ url: `/pages/flag/create?id=${this.flagId}` })
		},
		async resumeFlag() {
			await this.updateFlagStatus({ id: this.flagId, status: 'active' })
			uni.showToast({ title: '已重启', icon: 'success' })
		},
		onBottomAction() {
			if (this.flag?.status === 'paused') {
				this.resumeFlag()
				return
			}
			this.goCheckin()
		},
		onDayClick(day) {
			const checkins = this.getCheckinsByFlagId(this.flagId)
			if (!day.count) {
				uni.showToast({ title: `${formatDate(day.date, 'MM.DD')} 无打卡`, icon: 'none' })
				return
			}
			const list = getCheckinsByDate(checkins, day.date)
			const content = list.map(c => c.content).join('\n')
			uni.showModal({
				title: `${formatDate(day.date, 'MM.DD')} 打卡记录`,
				content: content || '无内容',
				showCancel: false
			})
		},
		getAbandonPunishmentText() {
			const activeStage = this.stages.find(s => s.status === 'active' || s.status === 'pending')
			if (activeStage?.punishment) {
				return `未完成惩罚：${activeStage.punishment}`
			}
			return '放弃后将无法继续打卡，且该 Flag 将归档为已放弃状态。'
		},
		confirmAbandon() {
			uni.showModal({
				title: '确认放弃 Flag？',
				content: `${this.getAbandonPunishmentText()}\n\n确定要放弃「${this.flag.title}」吗？`,
				confirmText: '确认放弃',
				confirmColor: '#d9534f',
				success: res => {
					if (res.confirm) {
						this.updateFlagStatus({ id: this.flagId, status: 'abandoned' })
						uni.showToast({ title: '已放弃', icon: 'none' })
					}
				}
			})
		},
		confirmComplete() {
			uni.showModal({
				title: '确认完成 Flag？',
				content: `确定将「${this.flag.title}」标记为已完成吗？`,
				success: res => {
					if (res.confirm) {
						this.updateFlagStatus({ id: this.flagId, status: 'completed' })
						uni.showToast({ title: '已完成', icon: 'success' })
					}
				}
			})
		},
		handleAction(action) {
			if (action === 'edit') {
				this.goEdit()
				return
			}
			if (action === 'resume') {
				this.resumeFlag()
				return
			}
			if (action === 'paused') {
				this.updateFlagStatus({ id: this.flagId, status: 'paused' })
				uni.showToast({ title: '已暂停', icon: 'success' })
				return
			}
			if (action === 'completed') {
				this.confirmComplete()
				return
			}
			if (action === 'abandoned') {
				this.confirmAbandon()
			}
		},
		showActions() {
			const menu = ACTION_MENUS[this.flag?.status]
			if (!menu || !menu.items.length) return
			uni.showActionSheet({
				itemList: menu.items,
				success: res => {
					const action = menu.actions[res.tapIndex]
					this.handleAction(action)
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

.detail-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.detail-top__title {
	font-size: 36rpx;
	font-weight: 700;
	flex: 1;
}

.detail-top__more {
	font-size: 36rpx;
	color: $fm-color-text-secondary;
	padding: 0 8rpx;
}

.info-card__desc {
	display: block;
	font-size: 28rpx;
	color: $fm-color-text;
	line-height: 1.6;
	margin-bottom: 20rpx;
}

.info-card__meta {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 20rpx;
}

.info-card__date {
	font-size: 24rpx;
	color: $fm-color-text-secondary;
}

.empty-tip {
	font-size: 26rpx;
	color: $fm-color-text-secondary;
	text-align: center;
}
</style>
