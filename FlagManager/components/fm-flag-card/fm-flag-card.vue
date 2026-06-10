<template>
	<view :class="['fm-flag-card', `fm-flag-card--${variant}`]" @click="$emit('click', flag)">
		<view class="fm-flag-card__header">
			<text class="fm-flag-card__title">{{ flag.title }}</text>
			<text v-if="showStatus" :class="['fm-status-tag', statusClass]">{{ statusText }}</text>
			<text v-else class="fm-flag-card__category">{{ flag.category }}</text>
		</view>
		<text class="fm-flag-card__date">{{ dateRange }}</text>
		<fm-progress-bar v-if="showProgress" :percent="progress" label="进度" />
		<text v-if="currentStage && variant === 'default'" class="fm-flag-card__stage">当前阶段：{{ currentStage }}</text>
	</view>
</template>

<script>
import { formatDate } from '@/common/utils/date.js'
import { FLAG_STATUS_LABELS } from '@/common/mock/flag-data.js'

export default {
	name: 'FmFlagCard',
	props: {
		flag: { type: Object, required: true },
		progress: { type: Number, default: 0 },
		currentStage: { type: String, default: '' },
		variant: {
			type: String,
			default: 'default',
			validator: value => ['default', 'muted', 'archived'].includes(value)
		},
		showStatus: { type: Boolean, default: false },
		showProgress: { type: Boolean, default: true }
	},
	emits: ['click'],
	computed: {
		dateRange() {
			return `${formatDate(this.flag.startDate, 'YYYY.MM.DD')} - ${formatDate(this.flag.targetDate, 'YYYY.MM.DD')}`
		},
		statusText() {
			return FLAG_STATUS_LABELS[this.flag.status] || this.flag.status
		},
		statusClass() {
			if (this.flag.status === 'completed') return 'done'
			if (this.flag.status === 'active') return 'active'
			if (this.flag.status === 'paused') return 'paused'
			if (this.flag.status === 'abandoned') return 'abandoned'
			return 'pending'
		}
	}
}
</script>

<style lang="scss" scoped>
.fm-flag-card {
	background-color: $fm-color-card;
	border-radius: $fm-radius-card;
	padding: 28rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.fm-flag-card--muted {
	background-color: #f3f4f6;
	box-shadow: none;
}

.fm-flag-card--archived {
	background-color: #f9fafb;
	box-shadow: none;
	opacity: 0.92;
}

.fm-flag-card__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.fm-flag-card__title {
	font-size: 30rpx;
	font-weight: 600;
	color: $fm-color-text;
	flex: 1;
	margin-right: 16rpx;
}

.fm-flag-card--archived .fm-flag-card__title {
	color: $fm-color-text-secondary;
}

.fm-flag-card__category {
	font-size: 22rpx;
	color: $fm-color-primary;
	background-color: $fm-color-primary-light;
	padding: 4rpx 16rpx;
	border-radius: 8rpx;
	margin-left: 16rpx;
	flex-shrink: 0;
}

.fm-flag-card__date {
	font-size: 24rpx;
	color: $fm-color-text-secondary;
	margin-bottom: 16rpx;
	display: block;
}

.fm-flag-card__stage {
	font-size: 24rpx;
	color: $fm-color-text-secondary;
	margin-top: 12rpx;
	display: block;
}
</style>
