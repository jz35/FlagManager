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
			<button class="fm-btn-primary fm-btn-block" @click="submit">{{ isEdit ? '保存修改' : '创建 Flag' }}</button>
		</view>
	</view>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { FLAG_CATEGORIES } from '@/common/mock/flag-data.js'
import { todayStr } from '@/common/utils/date.js'
import { validateFlagForm } from '@/common/utils/validate.js'

export default {
	data() {
		const today = todayStr()
		return {
			flagId: '',
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
	computed: {
		...mapGetters('flag', ['getFlagById']),
		isEdit() {
			return !!this.flagId
		}
	},
	onLoad(options) {
		this.flagId = options.id || ''
		if (this.isEdit) {
			uni.setNavigationBarTitle({ title: '编辑 Flag' })
			this.loadFlag()
		}
	},
	methods: {
		...mapActions('flag', ['createFlag', 'updateFlag']),
		loadFlag() {
			const flag = this.getFlagById(this.flagId)
			if (!flag) return
			const isCustom = !FLAG_CATEGORIES.slice(0, -1).includes(flag.category)
			this.form = {
				title: flag.title,
				description: flag.description || '',
				category: isCustom ? '自定义' : flag.category,
				customCategory: isCustom ? flag.category : '',
				startDate: flag.startDate,
				targetDate: flag.targetDate
			}
		},
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
			const result = validateFlagForm(this.form)
			if (!result.ok) {
				uni.showToast({ title: result.message, icon: 'none' })
				return
			}
			const category = this.form.category === '自定义'
				? this.form.customCategory.trim()
				: this.form.category
			const payload = {
				title: this.form.title.trim(),
				description: this.form.description.trim(),
				category,
				startDate: this.form.startDate,
				targetDate: this.form.targetDate
			}
			if (this.isEdit) {
				await this.updateFlag({ id: this.flagId, ...payload })
				uni.showToast({ title: '保存成功', icon: 'success' })
				setTimeout(() => uni.navigateBack(), 500)
				return
			}
			const flag = await this.createFlag(payload)
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
