export function getNavBarInfo() {
	const sys = uni.getSystemInfoSync()
	const statusBarHeight = sys.statusBarHeight || 20
	let menuButton = {
		top: statusBarHeight + 4,
		height: 32,
		left: sys.screenWidth - 96,
		right: sys.screenWidth - 7,
		width: 87
	}

	// #ifdef MP-WEIXIN
	const rect = uni.getMenuButtonBoundingClientRect()
	if (rect && rect.width) {
		menuButton = rect
	}
	// #endif

	const gap = menuButton.top - statusBarHeight
	const navContentHeight = menuButton.height + gap * 2
	const capsulePadding = Math.max(0, sys.screenWidth - menuButton.left)

	return {
		statusBarHeight,
		navContentHeight,
		capsulePadding,
		navBarHeight: statusBarHeight + navContentHeight
	}
}
