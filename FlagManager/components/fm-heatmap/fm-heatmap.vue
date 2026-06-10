<template>
	<view class="fm-heatmap">
		<view class="fm-heatmap__grid">
			<view
				v-for="day in days"
				:key="day.date"
				:class="['fm-heatmap__cell', levelClass(day.count)]"
				@click="$emit('dayClick', day)"
			/>
		</view>
		<view class="fm-heatmap__legend">
			<text class="fm-heatmap__legend-text">少</text>
			<view class="fm-heatmap__cell level-0" />
			<view class="fm-heatmap__cell level-1" />
			<view class="fm-heatmap__cell level-2" />
			<view class="fm-heatmap__cell level-3" />
			<view class="fm-heatmap__cell level-4" />
			<view class="fm-heatmap__cell level-5" />
			<text class="fm-heatmap__legend-text">多</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'FmHeatmap',
	props: {
		days: { type: Array, default: () => [] },
		mode: { type: String, default: 'default' }
	},
	emits: ['dayClick'],
	methods: {
		levelClass(count) {
			if (count === 0) return 'level-0'
			if (count === 1) return 'level-1'
			if (count === 2) return 'level-2'
			if (count === 3) return 'level-3'
			if (count <= 5) return 'level-4'
			return 'level-5'
		}
	}
}
</script>

<style lang="scss" scoped>
.fm-heatmap__grid {
	display: flex;
	flex-wrap: wrap;
	gap: 6rpx;
}

.fm-heatmap__cell {
	width: 24rpx;
	height: 24rpx;
	border-radius: 4rpx;

	&.level-0 {
		background-color: #ebedf0;
	}

	&.level-1 {
		background-color: #c6e9cc;
	}

	&.level-2 {
		background-color: #9be9a8;
	}

	&.level-3 {
		background-color: #40c463;
	}

	&.level-4 {
		background-color: #239a4d;
	}

	&.level-5 {
		background-color: #145c32;
	}
}

.fm-heatmap__legend {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 6rpx;
	margin-top: 16rpx;
}

.fm-heatmap__legend-text {
	font-size: 20rpx;
	color: $fm-color-text-secondary;
}
</style>
