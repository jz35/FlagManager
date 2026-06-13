<template>
	<view class="mine fm-page fm-page-padding">
		<view class="user-card fm-card">
			<view class="user-card__avatar">{{ avatarText }}</view>
			<view class="user-card__info">
				<text class="user-card__name">{{ user.nickname }}</text>
				<text class="user-card__bio">{{ user.bio }}</text>
				<text v-if="isLoggedIn" class="user-card__login-tag">已登录</text>
				<button v-else class="user-card__login-btn" size="mini" @click="handleLogin">微信登录</button>
			</view>
		</view>

		<fm-section title="我的数据" />
		<fm-stat-card :items="dataItems" />

		<fm-section title="功能入口" />
		<view class="fm-card menu-list">
			<view class="menu-item" @click="goFlagList">
				<text>我的 Flag</text>
				<view class="fm-chevron-right menu-item__arrow" />
			</view>
			<view class="menu-item disabled">
				<text>AI 阶段总结</text>
				<text class="menu-item__tag">规划中</text>
			</view>
			<view class="menu-item disabled">
				<text>VIP 功能</text>
				<text class="menu-item__tag">规划中</text>
			</view>
			<view class="menu-item" @click="showAbout">
				<text>关于项目</text>
				<view class="fm-chevron-right menu-item__arrow" />
			</view>
			<view v-if="isLoggedIn" class="menu-item" @click="handleLogout">
				<text>退出登录</text>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { getTotalCheckinDays } from '@/common/utils/stats.js'
import { wxLogin, getUserProfile } from '@/common/services/auth.js'

export default {
	computed: {
		...mapState('flag', ['user', 'flags', 'checkins']),
		...mapGetters('flag', ['completedFlagCount', 'isLoggedIn']),
		avatarText() {
			return (this.user.nickname || '用').slice(0, 1)
		},
		dataItems() {
			return [
				{ label: 'Flag 总数', value: String(this.flags.length) },
				{ label: '已完成', value: String(this.completedFlagCount) },
				{ label: '累计打卡', value: `${getTotalCheckinDays(this.checkins)} 天` }
			]
		}
	},
	methods: {
		...mapActions('flag', ['login', 'logout']),
		goFlagList() {
			uni.navigateTo({ url: '/pages/flag/list' })
		},
		async handleLogin() {
			try {
				const { openId } = await wxLogin()
				let profile = { nickName: '微信用户', avatarUrl: '' }
				try {
					profile = await getUserProfile()
				} catch (e) {
					// 用户拒绝授权时使用默认昵称
				}
				await this.login({
					openId,
					nickname: profile.nickName,
					avatarUrl: profile.avatarUrl
				})
				uni.showToast({ title: '登录成功', icon: 'success' })
			} catch (e) {
				uni.showToast({ title: '登录失败', icon: 'none' })
			}
		},
		handleLogout() {
			this.logout()
			uni.showToast({ title: '已退出', icon: 'none' })
		},
		showAbout() {
			uni.showModal({
				title: '关于 FlagManager',
				content: '帮助用户管理长期 Flag，通过阶段计划、打卡记录和统计视图，兑现每一个目标。',
				showCancel: false
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.mine {
	padding-top: 24rpx;
}

.user-card {
	display: flex;
	align-items: center;
}

.user-card__avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: $fm-color-primary-light;
	color: $fm-color-primary;
	font-size: 40rpx;
	font-weight: 600;
	line-height: 100rpx;
	text-align: center;
	margin-right: 24rpx;
	flex-shrink: 0;
}

.user-card__name {
	display: block;
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 8rpx;
}

.user-card__bio {
	display: block;
	font-size: 26rpx;
	color: $fm-color-text-secondary;
	margin-bottom: 12rpx;
}

.user-card__login-tag {
	font-size: 22rpx;
	color: $fm-color-primary;
}

.user-card__login-btn {
	margin: 0;
	background-color: $fm-color-primary;
	color: #fff;
	font-size: 24rpx;
}

.menu-list {
	padding: 0 28rpx;
}

.menu-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx 0;
	border-bottom: 1rpx solid $fm-color-border;
	font-size: 28rpx;

	&:last-child {
		border-bottom: none;
	}

	&.disabled {
		color: $fm-color-text-secondary;
	}
}

.menu-item__arrow {
	flex-shrink: 0;
}

.menu-item__tag {
	font-size: 24rpx;
	color: $fm-color-warning;
}
</style>
