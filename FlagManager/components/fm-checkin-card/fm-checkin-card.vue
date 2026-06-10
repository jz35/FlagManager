<template>
	<view class="fm-checkin-card">
		<view class="fm-checkin-card__header">
			<text class="fm-checkin-card__date">{{ displayDate }}</text>
			<text v-if="checkin.mood" class="fm-checkin-card__mood">{{ checkin.mood }}</text>
		</view>
		<text class="fm-checkin-card__content">{{ checkin.content }}</text>
		<view v-if="checkin.images && checkin.images.length" class="fm-checkin-card__images">
			<image
				v-for="(url, index) in checkin.images"
				:key="index"
				:src="url"
				class="fm-checkin-card__thumb"
				mode="aspectFill"
				@click="openPreview(url)"
			/>
		</view>

		<view
			v-if="previewUrl"
			class="fm-checkin-card__preview"
			@click="closePreview"
			@touchmove.stop.prevent
		>
			<image
				:src="previewUrl"
				class="fm-checkin-card__preview-img"
				mode="aspectFit"
				@click="closePreview"
			/>
		</view>
	</view>
</template>

<script>
import { formatDate, isToday } from '@/common/utils/date.js'

export default {
	name: 'FmCheckinCard',
	props: {
		checkin: { type: Object, required: true }
	},
	data() {
		return {
			previewUrl: ''
		}
	},
	computed: {
		displayDate() {
			if (isToday(this.checkin.checkinDate)) return '今天'
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)
			if (formatDate(this.checkin.checkinDate) === formatDate(yesterday)) return '昨天'
			return formatDate(this.checkin.checkinDate, 'MM.DD')
		}
	},
	methods: {
		openPreview(url) {
			this.previewUrl = url
		},
		closePreview() {
			this.previewUrl = ''
		}
	}
}
</script>

<style lang="scss" scoped>
.fm-checkin-card {
	position: relative;
	background-color: #f9fafb;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
}

.fm-checkin-card__header {
	display: flex;
	justify-content: space-between;
	margin-bottom: 8rpx;
}

.fm-checkin-card__date {
	font-size: 24rpx;
	color: $fm-color-text-secondary;
}

.fm-checkin-card__mood {
	font-size: 22rpx;
	color: $fm-color-primary;
	background-color: $fm-color-primary-light;
	padding: 2rpx 12rpx;
	border-radius: 8rpx;
}

.fm-checkin-card__content {
	font-size: 28rpx;
	color: $fm-color-text;
	line-height: 1.5;
}

.fm-checkin-card__images {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 16rpx;
}

.fm-checkin-card__thumb {
	width: 160rpx;
	height: 160rpx;
	border-radius: 12rpx;
	background-color: #e5e7eb;
}

.fm-checkin-card__preview {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10000;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(0, 0, 0, 0.88);
}

.fm-checkin-card__preview-img {
	width: 100%;
	height: 100%;
}
</style>
