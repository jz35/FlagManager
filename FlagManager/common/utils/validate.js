export function isNotEmpty(value) {
	return typeof value === 'string' && value.trim().length > 0
}

export function isDateRangeValid(startDate, endDate) {
	if (!startDate || !endDate) return false
	return endDate >= startDate
}

export function validateFlagForm(form) {
	if (!isNotEmpty(form.title)) {
		return { ok: false, message: '请填写 Flag 名称' }
	}
	if (form.category === '自定义' && !isNotEmpty(form.customCategory)) {
		return { ok: false, message: '请输入自定义分类' }
	}
	if (!form.targetDate) {
		return { ok: false, message: '请选择目标完成日期' }
	}
	if (!isDateRangeValid(form.startDate, form.targetDate)) {
		return { ok: false, message: '完成日期不能早于开始日期' }
	}
	return { ok: true }
}

export function validateStageForm(form) {
	if (!isNotEmpty(form.title)) {
		return { ok: false, message: '请填写阶段名称' }
	}
	if (!isNotEmpty(form.goal)) {
		return { ok: false, message: '请填写阶段目标' }
	}
	if (!form.endDate) {
		return { ok: false, message: '请选择结束日期' }
	}
	if (!isDateRangeValid(form.startDate, form.endDate)) {
		return { ok: false, message: '结束日期不能早于开始日期' }
	}
	return { ok: true }
}

export function validateCheckinForm(form, options = {}) {
	if (!options.currentStage) {
		return { ok: false, message: '请先添加阶段' }
	}
	if (!isNotEmpty(form.content)) {
		return { ok: false, message: '请填写打卡内容' }
	}
	if (form.moodMode === '自定义' && !isNotEmpty(form.customMood)) {
		return { ok: false, message: '请填写自定义状态' }
	}
	if (form.moodMode === '自定义' && form.customMood.trim().length > (options.moodMaxLength || 6)) {
		return { ok: false, message: `自定义状态不超过 ${options.moodMaxLength || 6} 字` }
	}
	return { ok: true }
}

export function canFlagCheckin(flag) {
	return flag && flag.status === 'active'
}
