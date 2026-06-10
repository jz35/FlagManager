<template>
	<view class="fm-progress">
		<view v-if="label" class="fm-progress__header">
			<text class="fm-progress__label">{{ label }}</text>
			<text class="fm-progress__percent">{{ percent }}%</text>
		</view>
		<view class="fm-progress__track">
			<view class="fm-progress__bar" :style="{ width: percent + '%' }" />
		</view>
	</view>
</template>

<script>
export default {
	name: 'FmProgressBar',
	props: {
		percent: { type: Number, default: 0 },
		label: { type: String, default: '' }
	}
}
</script>

<style lang="scss" scoped>
.fm-progress {
	width: 100%;
}

.fm-progress__header {
	display: flex;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.fm-progress__label {
	font-size: 26rpx;
	color: $fm-color-text-secondary;
}

.fm-progress__percent {
	font-size: 26rpx;
	color: $fm-color-primary;
	font-weight: 500;
}

.fm-progress__track {
	height: 12rpx;
	background-color: #e5e7eb;
	border-radius: 6rpx;
	overflow: hidden;
}

.fm-progress__bar {
	height: 100%;
	background-color: $fm-color-primary;
	border-radius: 6rpx;
	transition: width 0.3s;
}
</style>
