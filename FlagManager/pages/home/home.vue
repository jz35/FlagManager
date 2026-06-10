<template>
	<view class="home fm-page">
		<view class="home-header" :style="{ paddingTop: navBar.statusBarHeight + 'px' }">
			<view class="home-header__nav" :style="{ height: navBar.navContentHeight + 'px' }" />
			<view class="home-header__inner fm-page-padding">
				<text class="home-header__title">FlagManager</text>
			</view>
		</view>

		<view class="home-body fm-page-padding">
			<fm-stat-card class="home-overview" :items="overviewItems" />

			<fm-section title="今日待打卡" class="home-section-first" />
			<view v-if="pendingList.length" class="pending-list">
				<view v-for="item in pendingList" :key="item.stage.id" class="fm-card pending-card">
					<text class="pending-card__flag">{{ item.flag.title }}</text>
					<text class="pending-card__stage">阶段：{{ item.stage.title }}</text>
					<text class="pending-card__goal">目标：{{ item.stage.goal }}</text>
					<view class="pending-card__action" @click="goCheckin(item)">去打卡</view>
				</view>
			</view>
			<view v-else class="fm-card pending-empty">
				<text class="pending-empty__text">今日待打卡已全部完成</text>
			</view>

			<fm-section title="进行中的 Flag" />
			<view v-if="activeFlags.length">
				<fm-flag-card
					v-for="flag in activeFlags"
					:key="flag.id"
					:flag="flag"
					:progress="getProgress(flag)"
					:current-stage="getCurrentStageName(flag.id)"
					@click="goFlagDetail(flag)"
				/>
			</view>
			<fm-empty v-else text="还没有进行中的 Flag" />

			<view v-if="pausedFlags.length" class="paused-block">
				<view class="paused-block__header" @click="pausedExpanded = !pausedExpanded">
					<text class="paused-block__title">已暂停 ({{ pausedFlags.length }})</text>
					<text class="paused-block__toggle">{{ pausedExpanded ? '收起' : '展开' }}</text>
				</view>
				<view v-if="pausedExpanded">
					<view v-for="flag in pausedFlags" :key="flag.id" class="paused-card">
						<fm-flag-card
							:flag="flag"
							:progress="getProgress(flag)"
							variant="muted"
							@click="goFlagDetail(flag)"
						/>
						<view class="paused-card__action" @click.stop="resumeFlag(flag)">恢复</view>
					</view>
				</view>
			</view>

			<view class="home-all-flags" @click="goAllFlags">
				<text>查看全部 Flag</text>
				<view class="fm-chevron-right home-all-flags__arrow" />
			</view>
		</view>

		<view class="home-fixed-create fm-page-padding">
			<button class="fm-btn-primary fm-btn-block" @click="goCreateFlag">+ 新建 Flag</button>
		</view>
	</view>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { getNavBarInfo } from '@/common/utils/navbar.js'
import {
	getCurrentStreak,
	getMonthCheckinCount,
	getFlagProgress,
	getTodayPendingStages
} from '@/common/utils/stats.js'

export default {
	data() {
		return {
			navBar: getNavBarInfo(),
			pausedExpanded: false
		}
	},
	computed: {
		...mapState('flag', ['flags', 'stages', 'checkins']),
		...mapGetters('flag', ['activeFlags', 'pausedFlags']),
		overviewItems() {
			return [
				{ label: '连续打卡', value: `${getCurrentStreak(this.checkins)} 天` },
				{ label: '本月打卡', value: `${getMonthCheckinCount(this.checkins)} 次` }
			]
		},
		pendingList() {
			const pendingStages = getTodayPendingStages(this.stages, this.checkins)
			return pendingStages.map(stage => ({
				stage,
				flag: this.flags.find(f => f.id === stage.flagId)
			})).filter(item => item.flag)
		}
	},
	onLoad() {
		this.navBar = getNavBarInfo()
	},
	methods: {
		...mapActions('flag', ['updateFlagStatus']),
		getProgress(flag) {
			return getFlagProgress(flag, this.stages, this.checkins)
		},
		getCurrentStageName(flagId) {
			const active = this.stages.find(s => s.flagId === flagId && s.status === 'active')
			return active ? active.title : ''
		},
		goCreateFlag() {
			uni.navigateTo({ url: '/pages/flag/create' })
		},
		goFlagDetail(flag) {
			uni.navigateTo({ url: `/pages/flag/detail?id=${flag.id}` })
		},
		goCheckin(item) {
			uni.navigateTo({
				url: `/pages/checkin/create?flagId=${item.flag.id}&stageId=${item.stage.id}`
			})
		},
		goAllFlags() {
			uni.navigateTo({ url: '/pages/flag/list' })
		},
		async resumeFlag(flag) {
			await this.updateFlagStatus({ id: flag.id, status: 'active' })
			uni.showToast({ title: '已恢复', icon: 'success' })
		}
	}
}
</script>

<style lang="scss" scoped>
.home-header {
	background-color: $fm-color-card;
	padding-bottom: 20rpx;
}

.home-header__nav {
	box-sizing: border-box;
}

.home-header__inner {
	display: flex;
	justify-content: center;
	align-items: center;
}

.home-header__title {
	font-size: 40rpx;
	font-weight: 700;
	color: $fm-color-text;
}

.home-body {
	padding-top: 24rpx;
	padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

.home-overview {
	margin-bottom: 16rpx;
}

.home-section-first {
	margin-top: 48rpx;
}

.home-fixed-create {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	padding-top: 20rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	background: linear-gradient(to top, $fm-color-bg 70%, rgba(246, 247, 245, 0));
}

.pending-list {
	margin-bottom: 32rpx;
}

.pending-card {
	position: relative;
}

.pending-card__flag {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	margin-bottom: 8rpx;
}

.pending-card__stage,
.pending-card__goal {
	display: block;
	font-size: 24rpx;
	color: $fm-color-text-secondary;
	margin-bottom: 8rpx;
}

.pending-card__action {
	position: absolute;
	right: 28rpx;
	top: 50%;
	transform: translateY(-50%);
	color: $fm-color-primary;
	font-size: 28rpx;
	font-weight: 500;
}

.pending-empty__text {
	font-size: 26rpx;
	color: $fm-color-text-secondary;
}

.paused-block {
	margin-top: 16rpx;
	margin-bottom: 24rpx;
}

.paused-block__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 4rpx 20rpx;
}

.paused-block__title {
	font-size: 32rpx;
	font-weight: 600;
	color: $fm-color-text;
}

.paused-block__toggle {
	font-size: 26rpx;
	color: $fm-color-primary;
}

.paused-card {
	position: relative;
}

.paused-card__action {
	position: absolute;
	right: 28rpx;
	top: 50%;
	transform: translateY(-50%);
	z-index: 2;
	color: $fm-color-primary;
	font-size: 28rpx;
	font-weight: 500;
}

.home-all-flags {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 0 24rpx;
	font-size: 28rpx;
	color: $fm-color-primary;
}

.home-all-flags__arrow {
	border-color: $fm-color-text-secondary;
}
</style>
