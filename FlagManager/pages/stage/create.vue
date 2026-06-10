<template>
	<view class="stage-create fm-page fm-page-padding">
		<view class="fm-form-item">
			<view class="fm-form-label">所属 Flag</view>
			<view class="fm-form-display readonly">{{ flagTitle }}</view>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">阶段名称</view>
			<input
				v-model="form.title"
				class="fm-form-input"
				placeholder="例如：单词强化"
				placeholder-class="fm-input-placeholder"
			/>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">阶段目标</view>
			<textarea v-model="form.goal" class="fm-form-textarea" placeholder="每天背50个单词..." />
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">阶段开始日期</view>
			<picker mode="date" :value="form.startDate" @change="e => form.startDate = e.detail.value">
				<view class="fm-form-display">{{ form.startDate }}</view>
			</picker>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">阶段结束日期</view>
			<picker mode="date" :value="form.endDate" @change="e => form.endDate = e.detail.value">
				<view class="fm-form-display">{{ form.endDate || '请选择日期' }}</view>
			</picker>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">打卡频率</view>
			<view class="fm-tag-group">
				<view
					v-for="item in frequencies"
					:key="item.value"
					:class="['fm-tag', { active: frequencyMode === item.value }]"
					@click="selectFrequency(item.value)"
				>{{ item.label }}</view>
			</view>
			<view v-if="frequencyMode === 'custom'" class="custom-frequency">
				<view class="custom-frequency__row">
					<text class="custom-frequency__label">周期</text>
					<view class="fm-tag-group">
						<view
							v-for="item in periodOptions"
							:key="item.value"
							:class="['fm-tag', 'fm-tag--sm', { active: customPeriod === item.value }]"
							@click="customPeriod = item.value"
						>{{ item.label }}</view>
					</view>
				</view>
				<view class="custom-frequency__row">
					<text class="custom-frequency__label">次数</text>
					<picker :range="timesOptions" :value="customTimesIndex" @change="onTimesChange">
						<view class="fm-form-display custom-frequency__picker">{{ timesOptions[customTimesIndex] }} 次</view>
					</picker>
				</view>
				<text class="custom-frequency__preview">每{{ periodLabel }}打卡 {{ timesOptions[customTimesIndex] }} 次</text>
			</view>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">完成奖励</view>
			<input
				v-model="form.reward"
				class="fm-form-input"
				placeholder="看一场电影"
				placeholder-class="fm-input-placeholder"
			/>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">未完成惩罚</view>
			<input
				v-model="form.punishment"
				class="fm-form-input"
				placeholder="周末少玩1小时游戏"
				placeholder-class="fm-input-placeholder"
			/>
		</view>

		<view class="fm-fixed-bottom">
			<button class="fm-btn-primary fm-btn-block" @click="submit">创建阶段</button>
		</view>
	</view>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
	CHECKIN_FREQUENCIES,
	FREQUENCY_PERIOD_OPTIONS,
	FREQUENCY_TIMES_OPTIONS,
	buildCustomFrequency
} from '@/common/mock/flag-data.js'
import { todayStr } from '@/common/utils/date.js'

export default {
	data() {
		return {
			flagId: '',
			frequencies: CHECKIN_FREQUENCIES,
			periodOptions: FREQUENCY_PERIOD_OPTIONS,
			timesOptions: FREQUENCY_TIMES_OPTIONS,
			frequencyMode: 'daily',
			customPeriod: 'week',
			customTimesIndex: 2,
			form: {
				title: '',
				goal: '',
				startDate: todayStr(),
				endDate: '',
				reward: '',
				punishment: ''
			}
		}
	},
	computed: {
		...mapGetters('flag', ['getFlagById']),
		flagTitle() {
			return this.getFlagById(this.flagId)?.title || ''
		},
		periodLabel() {
			const item = this.periodOptions.find(p => p.value === this.customPeriod)
			return item ? item.label : '日'
		},
		checkinFrequency() {
			if (this.frequencyMode === 'custom') {
				return buildCustomFrequency(this.customPeriod, this.timesOptions[this.customTimesIndex])
			}
			return this.frequencyMode
		}
	},
	onLoad(options) {
		this.flagId = options.flagId || ''
	},
	methods: {
		...mapActions('flag', ['createStage']),
		selectFrequency(value) {
			this.frequencyMode = value
		},
		onTimesChange(e) {
			this.customTimesIndex = Number(e.detail.value)
		},
		async submit() {
			if (!this.form.title.trim()) {
				uni.showToast({ title: '请填写阶段名称', icon: 'none' })
				return
			}
			if (!this.form.endDate) {
				uni.showToast({ title: '请选择结束日期', icon: 'none' })
				return
			}
			if (this.form.endDate < this.form.startDate) {
				uni.showToast({ title: '结束日期不能早于开始日期', icon: 'none' })
				return
			}
			await this.createStage({
				flagId: this.flagId,
				...this.form,
				title: this.form.title.trim(),
				checkinFrequency: this.checkinFrequency
			})
			uni.showToast({ title: '创建成功', icon: 'success' })
			setTimeout(() => {
				uni.navigateBack()
			}, 500)
		}
	}
}
</script>

<style lang="scss" scoped>
.stage-create {
	padding-top: 24rpx;
	padding-bottom: 160rpx;
}

.readonly {
	color: $fm-color-text-secondary;
}

.custom-frequency {
	margin-top: 24rpx;
	padding: 24rpx;
	background-color: #f9fafb;
	border-radius: 16rpx;
}

.custom-frequency__row {
	margin-bottom: 20rpx;
}

.custom-frequency__label {
	display: block;
	font-size: 26rpx;
	color: $fm-color-text-secondary;
	margin-bottom: 12rpx;
}

.custom-frequency__picker {
	min-height: 72rpx;
}

.custom-frequency__preview {
	font-size: 24rpx;
	color: $fm-color-primary;
}

.fm-tag--sm {
	padding: 8rpx 24rpx;
}
</style>
