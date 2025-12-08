import React, {useState, useEffect} from 'react';
import {TextInput, Share} from 'react-native';
import {useRouter} from 'expo-router';
import {
    VStack,
    RatedToggle,
    Text,
    FeatureScreenLayout,
} from '@/ui';
import {Panel} from '@/ui/primitives/Panel';
import { Button } from '@/ui/primitives/Button';
import ModeTabs from '@/ui/components/ModeTabs';
import Section from '../components/Section';
import {useAuth} from '@/contexts/AuthContext';
import {useGame} from '@/contexts/GameContext';
import {useThemeTokens, useFonts} from '@/ui';
import {useI18n} from '@/i18n/I18nContext';
import {TimeControlSelector} from '@/ui/components/TimeControlSelector';
import {PlayerColorSelector} from '@/ui/components/PlayerColorSelector';

type ChallengeMode = 'create' | 'join' | 'local';

export default function FriendChallengeScreen() {
    const router = useRouter();
    const {colors} = useThemeTokens();
    const fonts = useFonts();
    const {t} = useI18n();
    const {isAuthenticated, user} = useAuth();
    const {createFriendGame, joinFriendGame, isCreatingGame, createLocalGame} = useGame();

    const [mode, setMode] = useState<ChallengeMode>('local');
    const [gameLink, setGameLink] = useState<string>('');
    const [joinCode, setJoinCode] = useState<string>('');
    const [timeControl, setTimeControl] = useState<string>('10+0');
    const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'random'>('random');
    const [rated, setRated] = useState<boolean>(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    const handleCreateLocalGame = async () => {
        try {
            const [initialMinutes, incrementSeconds] = timeControl.split('+').map(Number);
            const gameState = await createLocalGame({
                timeControl: {
                    initialMs: initialMinutes * 60 * 1000,
                    incrementMs: incrementSeconds * 1000,
                },
                colorPreference: playerColor,
                opponentAccountId: 'local',
                rated: rated,
            });
            router.push(`/game/${gameState.gameId}`);
        } catch (error) {
            console.error('Failed to create local game:', error);
        }
    };

    const handleCreateChallenge = async () => {
        try {
            const challenge = await createFriendGame({
                timeControl,
                playerColor: playerColor === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : playerColor,
                creatorId: user?.id || '',
                rated,
            });

            const link = `chessmate://game/${challenge.gameId}?code=${challenge.inviteCode}`;
            setGameLink(link);

            await Share.share({
                message: t('game_modes.play_chess_with_me', {link}),
                title: t('game_modes.chess_challenge'),
            });
        } catch (error) {
            console.error('Failed to create friend game:', error);
        }
    };

    const handleJoinChallenge = async () => {
        if (!joinCode.trim()) return;
        try {
            const gameId = await joinFriendGame(joinCode);
            router.push(`/game/${gameId}`);
        } catch (error) {
            console.error('Failed to join friend game:', error);
        }
    };

    return (
        <FeatureScreenLayout
            title={t('game_modes.friend_challenge')}
            subtitle={t('game_modes.play_with_friends')}
            statsRow={
                <VStack>
                    <ModeTabs mode={mode} onChange={setMode} colors={colors} />
                </VStack>
            }
            maxWidth={600}
        >
            <VStack gap={3}>
                    {/* Detailed controls for selected mode */}
                {mode === 'local' && (
                    <VStack gap={3}>
                        <Section title={t('game_modes.play_with_friend')} description={t('game_modes.play_with_friends')}/>

                        <TimeControlSelector value={timeControl} onChange={setTimeControl}/>

                        <PlayerColorSelector value={playerColor} onChange={setPlayerColor} label={t('game_modes.play_as')}/>

                        <Panel variant="glass" padding={20}>
                            <VStack gap={3} style={{alignItems: 'center'}}>
                                <Text style={[{color: colors.foreground.primary}]}>{t('game_modes.game_type')}</Text>
                                <RatedToggle value={rated} onChange={setRated}/>
                            </VStack>
                        </Panel>

                        <Button onPress={handleCreateLocalGame} color={colors.accent.primary} size="md">
                            {t('game_modes.start_game')}
                        </Button>
                    </VStack>
                )}

                {mode === 'create' && (
                    <VStack gap={3}>
                        <TimeControlSelector value={timeControl} onChange={setTimeControl}/>

                        <PlayerColorSelector value={playerColor} onChange={setPlayerColor} label={t('game_modes.play_as')}/>

                        <Button onPress={handleCreateChallenge} color={colors.accent.primary} size="md" disabled={isCreatingGame}>
                            {isCreatingGame ? t('game_modes.creating') : t('game_modes.create_share_link')}
                        </Button>

                        {gameLink && (
                            <Section title={t('game_modes.challenge_link_created')}>
                                <Text variant="label" style={{fontFamily: fonts.mono, color: colors.accent.primary}} numberOfLines={1}>{gameLink}</Text>
                                <Text variant="caption" color={colors.foreground.muted}>{t('game_modes.share_link_hint')}</Text>
                            </Section>
                        )}
                    </VStack>
                )}

                {mode === 'join' && (
                    <VStack gap={3}>
                        <Section title={t('game_modes.enter_challenge_code')}>
                            <TextInput
                                style={[
                                    {backgroundColor: colors.background.secondary, color: colors.foreground.primary, borderColor: colors.background.tertiary},
                                ]}
                                placeholder={t('game_modes.paste_code_placeholder')}
                                placeholderTextColor={colors.foreground.muted}
                                value={joinCode}
                                onChangeText={setJoinCode}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Text variant="caption" color={colors.foreground.muted}>{t('game_modes.share_link_hint')}</Text>
                        </Section>

                        <Button onPress={handleJoinChallenge} color={colors.accent.primary} size="md" disabled={!joinCode.trim() || isCreatingGame}>
                            {isCreatingGame ? t('game_modes.preparing_game') : t('game_modes.join_challenge')}
                        </Button>
                    </VStack>
                )}
            </VStack>
        </FeatureScreenLayout>
    );
}
