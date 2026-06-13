<template>
	<view class="checkin-create fm-page fm-page-padding">
		<view class="fm-form-item">
			<view class="fm-form-label">Flag</view>
			<view class="fm-form-display readonly">{{ flagTitle }}</view>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">阶段</view>
			<picker v-if="stageOptions.length" :range="stageOptions" range-key="title" :value="stageIndex" @change="onStageChange">
				<view class="fm-form-display stage-picker">
					<text>{{ currentStageTitle }}</text>
					<text class="stage-picker__switch">切换</text>
				</view>
			</picker>
			<view v-else class="fm-form-display readonly">暂无可用阶段</view>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">今天完成了什么？</view>
			<textarea v-model="form.content" class="fm-form-textarea" placeholder="记录今天的执行情况..." />
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">添加图片</view>
			<view class="image-placeholder" @click="pickImage">
				<text v-if="!form.images.length">+</text>
				<image v-else :src="form.images[0]" class="image-preview" mode="aspectFill" />
			</view>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">今日状态</view>
			<view class="fm-tag-group">
				<view
					v-for="mood in moods"
					:key="mood"
					:class="['fm-tag', { active: form.moodMode === mood }]"
					@click="selectMood(mood)"
				>{{ mood }}</view>
			</view>
			<input
				v-if="form.moodMode === customMoodLabel"
				v-model="form.customMood"
				class="fm-form-input custom-mood-input"
				:maxlength="moodMaxLength"
				placeholder="输入自定义状态"
				placeholder-class="fm-input-placeholder"
			/>
			<text v-if="form.moodMode === customMoodLabel" class="custom-mood-hint">最多 {{ moodMaxLength }} 字</text>
		</view>
		<view class="fm-card ai-placeholder">
			<text class="ai-placeholder__title">AI 检测</text>
			<text class="ai-placeholder__desc">暂未开启，后续支持</text>
		</view>

		<view class="fm-fixed-bottom">
			<button class="fm-btn-primary fm-btn-block" @click="submit">提交打卡</button>
		</view>
	</view>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import {
	CHECKIN_MOODS,
	CHECKIN_MOOD_CUSTOM,
	CHECKIN_MOOD_MAX_LENGTH,
	CUSTOM_MOOD_STORAGE_KEY
} from '@/common/mock/flag-data.js'
import { todayStr } from '@/common/utils/date.js'
import { validateCheckinForm, canFlagCheckin } from '@/common/utils/validate.js'

export default {
	data() {
		return {
			flagId: '',
			stageId: '',
			stageIndex: 0,
			moods: CHECKIN_MOODS,
			customMoodLabel: CHECKIN_MOOD_CUSTOM,
			moodMaxLength: CHECKIN_MOOD_MAX_LENGTH,
			form: {
				content: '',
				moodMode: '一般',
				customMood: '',
				images: []
			}
		}
	},
	computed: {
		...mapState('flag', ['stages']),
		...mapGetters('flag', ['getFlagById', 'getStagesByFlagId']),
		flag() {
			return this.getFlagById(this.flagId)
		},
		flagTitle() {
			return this.flag?.title || ''
		},
		stageOptions() {
			if (!canFlagCheckin(this.flag)) return []
			return this.getStagesByFlagId(this.flagId).filter(s => s.status === 'active' || s.status === 'pending')
		},
		currentStage() {
			return this.stageOptions[this.stageIndex] || null
		},
		currentStageTitle() {
			return this.currentStage?.title || '请选择阶段'
		},
		resolvedMood() {
			if (this.form.moodMode === CHECKIN_MOOD_CUSTOM) {
				return this.form.customMood.trim()
			}
			return this.form.moodMode
		}
	},
	onLoad(options) {
		this.flagId = options.flagId || ''
		this.stageId = options.stageId || ''
		if (!canFlagCheckin(this.flag)) {
			uni.showToast({ title: '当前 Flag 不可打卡', icon: 'none' })
			setTimeout(() => uni.navigateBack(), 800)
			return
		}
		const saved = uni.getStorageSync(CUSTOM_MOOD_STORAGE_KEY)
		if (saved) this.form.customMood = saved
		if (this.stageId) {
			const idx = this.stageOptions.findIndex(s => s.id === this.stageId)
			if (idx >= 0) this.stageIndex = idx
		}
	},
	methods: {
		...mapActions('flag', ['createCheckin']),
		selectMood(mood) {
			this.form.moodMode = mood
		},
		onStageChange(e) {
			this.stageIndex = Number(e.detail.value)
		},
		pickImage() {
			uni.chooseImage({
				count: 1,
				success: res => {
					this.form.images = [res.tempFilePaths[0]]
				}
			})
		},
		async submit() {
			const result = validateCheckinForm(this.form, {
				currentStage: this.currentStage,
				moodMaxLength: this.moodMaxLength
			})
			if (!result.ok) {
				uni.showToast({ title: result.message, icon: 'none' })
				return
			}
			if (this.form.moodMode === CHECKIN_MOOD_CUSTOM) {
				uni.setStorageSync(CUSTOM_MOOD_STORAGE_KEY, this.form.customMood.trim())
			}
			await this.createCheckin({
				flagId: this.flagId,
				stageId: this.currentStage.id,
				content: this.form.content.trim(),
				mood: this.resolvedMood,
				images: [...this.form.images],
				checkinDate: todayStr()
			})
			uni.showToast({ title: '打卡成功', icon: 'success' })
			setTimeout(() => {
				uni.navigateBack()
			}, 500)
		}
	}
}
</script>

<style lang="scss" scoped>
.checkin-create {
	padding-top: 24rpx;
	padding-bottom: 160rpx;
}

.readonly {
	color: $fm-color-text-secondary;
}

.stage-picker {
	justify-content: space-between;
	width: 100%;
}

.stage-picker__switch {
	color: $fm-color-primary;
	font-size: 26rpx;
}

.image-placeholder {
	width: 160rpx;
	height: 160rpx;
	background-color: #f3f4f6;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 48rpx;
	color: $fm-color-text-secondary;
	overflow: hidden;
}

.image-preview {
	width: 100%;
	height: 100%;
}

.custom-mood-input {
	margin-top: 16rpx;
}

.custom-mood-hint {
	display: block;
	margin-top: 8rpx;
	font-size: 22rpx;
	color: $fm-color-text-secondary;
}

.ai-placeholder {
	margin-top: 16rpx;
}

.ai-placeholder__title {
	display: block;
	font-size: 28rpx;
	font-weight: 500;
	margin-bottom: 8rpx;
}

.ai-placeholder__desc {
	font-size: 24rpx;
	color: $fm-color-text-secondary;
}
</style>
