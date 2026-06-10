<template>
	<view class="fm-stage-card" @click="$emit('click', stage)">
		<view class="fm-stage-card__header">
			<text class="fm-stage-card__title">{{ stage.title }}</text>
			<text :class="['fm-status-tag', statusClass]">{{ statusText }}</text>
		</view>
		<fm-progress-bar :percent="progress" />
		<view class="fm-stage-card__rewards">
			<text class="fm-stage-card__reward">奖励：{{ stage.reward || '未设置' }}</text>
			<text class="fm-stage-card__punishment">惩罚：{{ stage.punishment || '未设置' }}</text>
		</view>
	</view>
</template>

<script>
const STATUS_MAP = {
	pending: '未开始',
	active: '进行中',
	completed: '已完成',
	failed: '未完成'
}

export default {
	name: 'FmStageCard',
	props: {
		stage: { type: Object, required: true },
		progress: { type: Number, default: 0 }
	},
	emits: ['click'],
	computed: {
		statusText() {
			return STATUS_MAP[this.stage.status] || this.stage.status
		},
		statusClass() {
			if (this.stage.status === 'active') return 'active'
			if (this.stage.status === 'completed') return 'done'
			return 'pending'
		}
	}
}
</script>

<style lang="scss" scoped>
.fm-stage-card {
	background-color: $fm-color-card;
	border-radius: $fm-radius-card;
	padding: 28rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.fm-stage-card__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.fm-stage-card__title {
	font-size: 28rpx;
	font-weight: 500;
	color: $fm-color-text;
}

.fm-stage-card__rewards {
	margin-top: 12rpx;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.fm-stage-card__reward {
	font-size: 24rpx;
	color: $fm-color-warning;
}

.fm-stage-card__punishment {
	font-size: 24rpx;
	color: $fm-color-danger;
}
</style>
