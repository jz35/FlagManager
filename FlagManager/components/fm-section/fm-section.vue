<template>
	<view class="fm-section">
		<view class="fm-section__header">
			<text class="fm-section__title">{{ title }}</text>
			<text v-if="actionText" class="fm-section__action" @click="$emit('action')">{{ actionText }}</text>
		</view>
		<slot />
	</view>
</template>

<script>
export default {
	name: 'FmSection',
	props: {
		title: { type: String, default: '' },
		actionText: { type: String, default: '' }
	},
	emits: ['action']
}
</script>

<style lang="scss" scoped>
.fm-section {
	margin-bottom: 32rpx;
}

.fm-section__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	padding: 0 4rpx;
}

.fm-section__title {
	font-size: 32rpx;
	font-weight: 600;
	color: $fm-color-text;
}

.fm-section__action {
	font-size: 26rpx;
	color: $fm-color-primary;
}
</style>
