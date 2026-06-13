export function wxLogin() {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		uni.login({
			provider: 'weixin',
			success: res => {
				resolve({
					code: res.code,
					openId: `wx_${Date.now()}`
				})
			},
			fail: reject
		})
		// #endif
		// #ifndef MP-WEIXIN
		resolve({
			code: 'mock_code',
			openId: `mock_${Date.now()}`
		})
		// #endif
	})
}

export function getUserProfile() {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		uni.getUserProfile({
			desc: '用于完善用户资料',
			success: res => resolve(res.userInfo),
			fail: reject
		})
		// #endif
		// #ifndef MP-WEIXIN
		resolve({
			nickName: '微信用户',
			avatarUrl: ''
		})
		// #endif
	})
}
