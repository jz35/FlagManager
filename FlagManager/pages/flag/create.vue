<template>
	<view class="flag-create fm-page fm-page-padding">
		<view class="fm-form-item">
			<view class="fm-form-label">Flag 名称</view>
			<input
				v-model="form.title"
				class="fm-form-input"
				placeholder="例如：完成考研英语"
				placeholder-class="fm-input-placeholder"
			/>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">Flag 描述</view>
			<textarea v-model="form.description" class="fm-form-textarea" placeholder="写下你为什么要做这件事..." />
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">分类</view>
			<view class="fm-tag-group">
				<view
					v-for="cat in categories"
					:key="cat"
					:class="['fm-tag', { active: form.category === cat }]"
					@click="selectCategory(cat)"
				>{{ cat }}</view>
			</view>
			<input
				v-if="form.category === '自定义'"
				v-model="form.customCategory"
				class="fm-form-input custom-input"
				placeholder="请输入自定义分类"
				placeholder-class="fm-input-placeholder"
			/>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">开始日期</view>
			<picker mode="date" :value="form.startDate" @change="onStartChange">
				<view class="fm-form-display">{{ form.startDate }}</view>
			</picker>
		</view>
		<view class="fm-form-item">
			<view class="fm-form-label">目标完成日期</view>
			<picker mode="date" :value="form.targetDate" @change="onTargetChange">
				<view class="fm-form-display">{{ form.targetDate || '请选择日期' }}</view>
			</picker>
		</view>

		<view class="fm-fixed-bottom">
			<button class="fm-btn-primary fm-btn-block" @click="submit">创建 Flag</button>
		</view>
	</view>
</template>

<script>
import { mapActions } from 'vuex'
import { FLAG_CATEGORIES } from '@/common/mock/flag-data.js'
import { todayStr } from '@/common/utils/date.js'

export default {
	data() {
		const today = todayStr()
		return {
			categories: FLAG_CATEGORIES,
			form: {
				title: '',
				description: '',
				category: '学习',
				customCategory: '',
				startDate: today,
				targetDate: ''
			}
		}
	},
	methods: {
		...mapActions('flag', ['createFlag']),
		selectCategory(cat) {
			this.form.category = cat
			if (cat !== '自定义') {
				this.form.customCategory = ''
			}
		},
		onStartChange(e) {
			this.form.startDate = e.detail.value
		},
		onTargetChange(e) {
			this.form.targetDate = e.detail.value
		},
		async submit() {
			if (!this.form.title.trim()) {
				uni.showToast({ title: '请填写 Flag 名称', icon: 'none' })
				return
			}
			if (this.form.category === '自定义' && !this.form.customCategory.trim()) {
				uni.showToast({ title: '请输入自定义分类', icon: 'none' })
				return
			}
			if (!this.form.targetDate) {
				uni.showToast({ title: '请选择目标完成日期', icon: 'none' })
				return
			}
			if (this.form.targetDate < this.form.startDate) {
				uni.showToast({ title: '完成日期不能早于开始日期', icon: 'none' })
				return
			}
			const category = this.form.category === '自定义'
				? this.form.customCategory.trim()
				: this.form.category
			const flag = await this.createFlag({
				title: this.form.title.trim(),
				description: this.form.description,
				category,
				startDate: this.form.startDate,
				targetDate: this.form.targetDate
			})
			uni.showToast({ title: '创建成功', icon: 'success' })
			setTimeout(() => {
				uni.redirectTo({ url: `/pages/flag/detail?id=${flag.id}` })
			}, 500)
		}
	}
}
</script>

<style lang="scss" scoped>
.flag-create {
	padding-top: 24rpx;
	padding-bottom: 160rpx;
}

.custom-input {
	margin-top: 20rpx;
}
</style>
