import type { ReactNode } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { IconSymbol } from '@/ui/primitives/icon-symbol';
import { Sidebar, type SidebarItem } from '@/ui/components/Sidebar';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingScale } from '@/ui/tokens/spacing';
import { getCurrentBreakpoint } from '@/ui/tokens/breakpoints';
import { getSidebarWidthForBreakpoint, default as layoutTokens } from '@/ui/tokens/layout';
import { GlobalContainer } from '@/ui/primitives/GlobalContainer';

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

	const [sidebarVisible, setSidebarVisible] = useState(() => (Platform.OS === 'web' ? breakpoint !== 'xs' : false));

	useEffect(() => {
		if (Platform.OS === 'web') setSidebarVisible(getCurrentBreakpoint() !== 'xs');
	}, [width]);

	const contentPaddingHorizontal = Platform.OS === 'ios' && isLandscape ? spacingScale.xl : spacingScale.gutter;

	return (
		<GlobalContainer style={[styles.container, { backgroundColor: colors.background.primary }]}>
			{(sidebarVisible || (Platform.OS === 'web' && sidebarWebWidth > 0)) && (
				<View
					style={[
						styles.sidebar,
						Platform.OS !== 'web' && styles.sidebarMobile,
						{
							...(Platform.OS === 'web' && sidebarWidth ? { width: sidebarWidth } : {}),
							backgroundColor: mode === 'dark' ? colors.background.primary : colors.background.secondary,
							borderRightColor: colors.background.tertiary,
						},
					]}
				>
					<Sidebar items={sidebarItems} onItemPress={() => Platform.OS !== 'web' && setSidebarVisible(false)} />
				</View>
			)}

			<View style={[styles.content, { paddingHorizontal: contentPaddingHorizontal }]}>{children}</View>

			{Platform.OS !== 'web' && sidebarVisible && (
				<TouchableOpacity
					style={[styles.overlay, { backgroundColor: colors.overlay }]}
					activeOpacity={1}
					onPress={() => setSidebarVisible(false)}
					accessibilityLabel="Close Menu"
				/>
			)}

			{Platform.OS !== 'web' && !sidebarVisible && (
				<TouchableOpacity
					style={[styles.hamburger, { backgroundColor: colors.accent.primary }]}
					onPress={() => setSidebarVisible(true)}
					accessibilityLabel="Open Menu"
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
		...Platform.select({
			web: {
				position: 'relative',
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
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
		zIndex: 100,
	},
});
