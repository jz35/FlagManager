<template>
	<view class="flag-list fm-page fm-page-padding">
		<scroll-view scroll-x class="flag-list__tabs" :show-scrollbar="false">
			<view class="flag-list__tabs-inner">
				<view
					v-for="tab in tabs"
					:key="tab.value"
					:class="['flag-list__tab', { active: currentTab === tab.value }]"
					@click="currentTab = tab.value"
				>{{ tab.label }}</view>
			</view>
		</scroll-view>

		<view v-if="flagList.length" class="flag-list__body">
			<fm-flag-card
				v-for="flag in flagList"
				:key="flag.id"
				:flag="flag"
				:progress="getProgress(flag)"
				:current-stage="getCurrentStageName(flag.id)"
				:variant="getCardVariant(flag)"
				:show-status="flag.status !== 'active'"
				:show-progress="flag.status !== 'abandoned'"
				@click="goFlagDetail(flag)"
			/>
		</view>
		<fm-empty v-else :text="emptyText" />
	</view>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { FLAG_LIST_TABS } from '@/common/mock/flag-data.js'
import { getFlagProgress } from '@/common/utils/stats.js'

export default {
	data() {
		return {
			tabs: FLAG_LIST_TABS,
			currentTab: 'all'
		}
	},
	computed: {
		...mapState('flag', ['stages', 'checkins']),
		...mapGetters('flag', ['getFlagsByStatus']),
		flagList() {
			return this.getFlagsByStatus(this.currentTab)
		},
		emptyText() {
			const tab = this.tabs.find(item => item.value === this.currentTab)
			return tab && tab.value !== 'all' ? `暂无${tab.label}的 Flag` : '还没有 Flag'
		}
	},
	onLoad(options) {
		if (options.status) {
			this.currentTab = options.status
		}
	},
	methods: {
		getProgress(flag) {
			return getFlagProgress(flag, this.stages, this.checkins)
		},
		getCurrentStageName(flagId) {
			const active = this.stages.find(s => s.flagId === flagId && s.status === 'active')
			return active ? active.title : ''
		},
		getCardVariant(flag) {
			if (flag.status === 'paused') return 'muted'
			if (flag.status === 'completed' || flag.status === 'abandoned') return 'archived'
			return 'default'
		},
		goFlagDetail(flag) {
			uni.navigateTo({ url: `/pages/flag/detail?id=${flag.id}` })
		}
	}
}
</script>

<style lang="scss" scoped>
.flag-list {
	padding-top: 24rpx;
}

.flag-list__tabs {
	margin-bottom: 24rpx;
	white-space: nowrap;
}

.flag-list__tabs-inner {
	display: inline-flex;
	gap: 16rpx;
	padding-bottom: 4rpx;
}

.flag-list__tab {
	display: inline-block;
	padding: 12rpx 28rpx;
	font-size: 26rpx;
	color: $fm-color-text-secondary;
	background-color: $fm-color-card;
	border-radius: 999rpx;
	border: 2rpx solid transparent;

	&.active {
		color: $fm-color-primary;
		background-color: $fm-color-primary-light;
		border-color: $fm-color-primary;
	}
}

.flag-list__body {
	padding-bottom: 32rpx;
}
</style>
