import type { ReactNode } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { IconSymbol } from '@/ui/primitives/icon-symbol';
import { Sidebar, type SidebarItem } from '@/ui/components/Sidebar';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingScale } from '@/ui/tokens/spacing';
import { getCurrentBreakpoint } from '@/ui/tokens/breakpoints';
import { getSidebarWidthForBreakpoint, default as layoutTokens } from '@/ui/tokens/layout';
import { GlobalContainer } from '@/ui/primitives/GlobalContainer';
import { ContentSizeProvider } from '@/contexts/ContentSizeContext';
import { shadowTokens } from '@/ui/tokens/shadows';
import { componentElevation, getElevation } from '@/ui/tokens/elevation';

const sidebarItems: SidebarItem[] = [
	{
		id: 'play',
		title: 'Play',
		icon: 'gamecontroller.fill',
		route: '/',
	},
	{
		id: 'puzzle',
		title: 'Puzzle',
		icon: 'brain.head.profile',
		route: '/puzzle',
	},
	{
		id: 'learn',
		title: 'Learn',
		icon: 'book.fill',
		route: '/learn',
	},
	{
		id: 'social',
		title: 'Social',
		icon: 'person.2.fill',
		route: '/social/friends',
	},
	{
		id: 'settings',
		title: 'Settings',
		icon: 'gearshape.fill',
		route: '/settings',
	},
];

interface GlobalLayoutProps {
	children: ReactNode;
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
	const { colors, mode } = useThemeTokens();

	const { width, height } = useWindowDimensions();
	const isLandscape = width > height;

	const breakpoint = getCurrentBreakpoint();
	const sidebarWebWidth = getSidebarWidthForBreakpoint(breakpoint);
	const sidebarWidth = Platform.OS === 'web' ? sidebarWebWidth : undefined;

	const isMobileSize = width < 576;
	const shouldShowSidebarOnWeb = !isMobileSize && sidebarWebWidth > 0;
	const [sidebarVisible, setSidebarVisible] = useState(() => (Platform.OS === 'web' ? shouldShowSidebarOnWeb : false));

	useEffect(() => {
		if (Platform.OS === 'web') {
			const currentBreakpoint = getCurrentBreakpoint();
			const currentIsMobile = width < 576;
			const shouldShow = !currentIsMobile && getSidebarWidthForBreakpoint(currentBreakpoint) > 0;
			setSidebarVisible(shouldShow);
		}
	}, [width]);

	const contentPaddingHorizontal = Platform.OS === 'ios' && isLandscape ? spacingScale.xl : spacingScale.gutter;

	const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(null);
	const handleLayout = useCallback((e: any) => {
		const { width: w, height: h } = e.nativeEvent.layout;
		setContentSize({ width: Math.round(w), height: Math.round(h) });
	}, []);

	const currentBreakpoint = getCurrentBreakpoint();
	const isMobileWidth = width < 576;
	const showHamburgerOnWeb = Platform.OS === 'web' && (currentBreakpoint === 'xs' || isMobileWidth);
	const showOverlay = (Platform.OS !== 'web' || showHamburgerOnWeb) && sidebarVisible;

	return (
		<GlobalContainer style={[styles.container, { backgroundColor: colors.background.primary }]}>
			{sidebarVisible && (
				<View
					style={[
						styles.sidebar,
						(Platform.OS !== 'web' || showHamburgerOnWeb) && styles.sidebarMobile,
						{
							...(Platform.OS === 'web' && !showHamburgerOnWeb && sidebarWidth ? { width: sidebarWidth } : {}),
							backgroundColor: mode === 'dark' ? colors.background.primary : colors.background.secondary,
							borderRightColor: colors.background.tertiary,
						},
					]}
				>
					<Sidebar items={sidebarItems} onItemPress={() => {
						if (Platform.OS !== 'web' || showHamburgerOnWeb) {
							setSidebarVisible(false);
						}
					}} />
				</View>
			)}

			<ContentSizeProvider value={contentSize}>
				<View style={[styles.content, { paddingHorizontal: contentPaddingHorizontal }]} onLayout={handleLayout}>
					{children}
				</View>
			</ContentSizeProvider>

			{showOverlay && (
				<TouchableOpacity
					style={[styles.overlay, { backgroundColor: colors.overlay }]}
					activeOpacity={1}
					onPress={() => setSidebarVisible(false)}
					accessibilityLabel="Close Menu"
				/>
			)}

			{(Platform.OS !== 'web' || showHamburgerOnWeb) && !sidebarVisible && (
				<TouchableOpacity
					style={[
						styles.hamburger,
						{
							backgroundColor: colors.accent.primary,
							borderColor: colors.accent.primary + '30',
							...shadowTokens.lg,
							zIndex: getElevation(componentElevation.fab).zIndex,
						},
					]}
					activeOpacity={0.85}
					onPress={() => setSidebarVisible(true)}
					accessibilityLabel="Open Menu"
					accessibilityRole="button"
				>
					<IconSymbol size={24} name="line.3.horizontal" color={colors.accentForeground.primary} />
				</TouchableOpacity>
			)}

		</GlobalContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
	},
	sidebar: {
		borderRightWidth: 1,
		flexShrink: 0,
		...Platform.select({
			web: {
				position: 'relative',
				height: '100%',
			},
		}),
	},
	sidebarMobile: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		zIndex: 1000,
		width: layoutTokens.sidebar.mobileWidth,
		shadowOffset: { width: 2, height: 0 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 10,
	},
	content: {
		flex: 1,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 999,
	},
	hamburger: {
		position: 'absolute',
		bottom: layoutTokens.controls.hamburgerOffset,
		right: layoutTokens.controls.hamburgerOffset,
		width: layoutTokens.controls.hamburgerSize,
		height: layoutTokens.controls.hamburgerSize,
		borderRadius: layoutTokens.controls.hamburgerSize / 2,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
	},
});
