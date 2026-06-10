<template>
	<view class="fm-empty">
		<text class="fm-empty__text">{{ text }}</text>
		<button v-if="buttonText" class="fm-btn-outline fm-empty__btn" @click="$emit('action')">{{ buttonText }}</button>
	</view>
</template>

<script>
export default {
	name: 'FmEmpty',
	props: {
		text: { type: String, default: '暂无数据' },
		buttonText: { type: String, default: '' }
	},
	emits: ['action']
}
</script>

<style lang="scss" scoped>
.fm-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 80rpx 40rpx;
}

.fm-empty__text {
	font-size: 28rpx;
	color: $fm-color-text-secondary;
	margin-bottom: 32rpx;
}

.fm-empty__btn {
	padding: 0 48rpx;
}
</style>
