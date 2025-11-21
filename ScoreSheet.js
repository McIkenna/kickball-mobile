import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const ScoreSheet = ({
    score,
    setScore,
    difficulty,
    setDifficulty,
    time,
    setTime,
    isPlaying,
    setIsPlaying,
    restartGame,
    points,
    setPoints,
    notification,
    shotsRemaining,
    highScore
}) => {
    // const formatTime = (seconds) => {
    //     const mins = Math.floor(seconds / 60);
    //     const secs = seconds % 60;
    //     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    // };

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Notification */}
            {notification && (
                <View style={styles.notificationContainer}>
                    <LinearGradient
                        colors={notification.type === 'success' 
                            ? ['#88eebbff', '#88eebbff'] 
                            : ['#e92f6dff', '#e92f6dff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.notificationGradient}
                    >
                        <Text style={styles.notificationText}>
                            {notification.message}
                        </Text>
                    </LinearGradient>
                </View>
            )}

            {/* Top Section: Score and Timer */}
            <View style={styles.topSection} pointerEvents="none">
                <View style={styles.scoreContainer}>
                    <Text style={styles.label}>GOALS</Text>
                    <Text style={styles.scoreValue}>{score}</Text>
                    
                    <View style={styles.pointsRow}>
                        <Text style={styles.pointsLabel}>Points</Text>
                        <Text style={styles.pointsValue}>{points}</Text>
                    </View>

                    {highScore > 0 && (
                        <View style={styles.highScoreRow}>
                            <Text style={styles.highScoreLabel}>HIGHEST SCORE</Text>
                            <Text style={styles.highScoreValue}>{highScore}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Difficulty Control */}
            <View style={styles.difficultySection} pointerEvents="auto">
                <View style={styles.difficultyContainer}>
                <Text style={styles.difficultyLabel}>DIFFICULTY</Text>
               
                    
                    
                    <View style={styles.difficultyButtons}>
                        {[1, 2, 3, 4, 5].map((level) => (
                            <TouchableOpacity
                                key={level}
                                onPress={() => setDifficulty(level)}
                                style={[
                                    styles.difficultyButton,
                                    difficulty === level && styles.difficultyButtonActive
                                ]}
                            >
                                <Text style={[
                                    styles.difficultyButtonText,
                                    difficulty === level && styles.difficultyButtonTextActive
                                ]}>
                                    {level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Shots Remaining (Top Right) */}
            <View style={styles.shotsContainer} pointerEvents="none">
                <Text style={styles.label}>SHOTS LEFT</Text>
                <Text style={[
                    styles.shotsValue,
                    { color: shotsRemaining === 0 ? '#ff0055' : shotsRemaining === 1 ? '#ffaa00' : '#00d4ff' }
                ]}>
                    {shotsRemaining}
                </Text>

                <View style={styles.instructions}>
                    <Text style={styles.instructionsTitle}>HOW TO PLAY</Text>
                    <Text style={styles.instructionText}>🖱️ Click & hold the ball</Text>
                    <Text style={styles.instructionText}>⚡ Longer hold = stronger kick</Text>
                    <Text style={styles.instructionText}>🥅 Score past the keeper!</Text>
                    <Text style={styles.instructionText}>You have only 3 attempts!</Text>
                </View>
            </View>

            {/* Restart Button */}
            <View style={styles.restartSection} pointerEvents="auto">
                <TouchableOpacity
                    onPress={restartGame}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.restartButton}
                    >
                        <Text style={styles.restartButtonText}>RESTART GAME</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    notificationContainer: {
        position: 'absolute',
        top: '20%',
        left: '40%',
        transform: [{ translateX: -width * 0.35 }],
        zIndex: 100,
    },
    notificationGradient: {
        paddingVertical: 30,
        paddingHorizontal: 50,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 10,
    },
    notificationText: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        letterSpacing: 2,
    },
    topSection: {
        position: 'absolute',
        top: 150,
        left: 10,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: -10,
    },
    scoreContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    label: {
        fontSize: 11,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 5,
        fontWeight: '600',
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#00ff88',
        fontFamily: 'monospace',
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    pointsLabel: {
        fontSize: 9,
        color: '#f3f0f0',
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '600',
        marginRight: 10,
    },
    pointsValue: {
        fontSize: 9,
        fontWeight: '900',
        color: '#00ff88',
        fontFamily: 'monospace',
    },
    highScoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    highScoreLabel: {
        fontSize: 7,
        color: '#f3f0f0',
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '600',
        marginRight: 10,
    },
    highScoreValue: {
        fontSize: 7,
        fontWeight: '900',
        color: '#00ff88',
        fontFamily: 'monospace',
    },
    difficultySection: {
        position: 'absolute',
        top: 70,
        left: 120,
        transform: [{ translateX: -width * 0.25 }],
        zIndex: 10,
    },
    difficultyContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    difficultyLabel: {
        fontSize: 10,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: 5,
    },
    difficultyValue: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    difficultyButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    difficultyButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    difficultyButtonActive: {
        backgroundColor: 'rgba(0, 255, 136, 0.3)',
        borderColor: '#00ff88',
    },
    difficultyButtonText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
    },
    difficultyButtonTextActive: {
        color: '#00ff88',
        fontWeight: '700',
    },
    shotsContainer: {
        position: 'absolute',
        top: 70,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        maxWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16
    },
    shotsValue: {
        fontSize: 24,
        fontWeight: '900',
        fontFamily: 'monospace',
        marginBottom: 5,
    },
    instructions: {
        marginTop: 10,
    },
    instructionsTitle: {
        color: '#00ff88',
        fontWeight: '700',
        marginBottom: 8,
        fontSize: 11,
    },
    instructionText: {
        fontSize: 10,
        color: '#aaa',
        lineHeight: 16,
        marginBottom: 2,
    },
    restartSection: {
        position: 'absolute',
        bottom: 30,
        left: '63%',
        transform: [{ translateX: -width * 0.4 }],
        zIndex: 10,
    },
    restartButton: {
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    restartButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
});