<template>
	<view class="fm-stat-card">
		<view v-for="(item, index) in items" :key="index" class="fm-stat-card__item">
			<text class="fm-stat-card__value">{{ item.value }}</text>
			<text class="fm-stat-card__label">{{ item.label }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'FmStatCard',
	props: {
		items: { type: Array, default: () => [] }
	}
}
</script>

<style lang="scss" scoped>
.fm-stat-card {
	display: flex;
	background-color: $fm-color-card;
	border-radius: $fm-radius-card;
	padding: 28rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.fm-stat-card__item {
	flex: 1;
	text-align: center;
}

.fm-stat-card__value {
	display: block;
	font-size: 36rpx;
	font-weight: 600;
	color: $fm-color-text;
	margin-bottom: 8rpx;
}

.fm-stat-card__label {
	display: block;
	font-size: 24rpx;
	color: $fm-color-text-secondary;
}
</style>
