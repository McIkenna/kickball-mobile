import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export const Joystick = ({ onShoot }) => {
    const insets = useSafeAreaInsets();
    const disabled = false
    const size = 150
    const [isActive, setIsActive] = useState(false);
    const joystickPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const powerBarWidth = useRef(new Animated.Value(0)).current;

    const centerX = size / 2;
    const centerY = size / 2;
    const maxDistance = size / 2 - 20; // Max distance from center

    const holdTimer = useRef(null);
    const power = useRef(0);
    // const direction = useRef({ x: 0, z: 0 });
    const direction = new THREE.Vector3(
    joystickPosition.x,       // left/right stays the same
    0,
    -joystickPosition.y       // invert so upward pushes forward
    );

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled,
            onMoveShouldSetPanResponder: () => !disabled,

            onPanResponderGrant: (evt, gestureState) => {
                setIsActive(true);
                power.current = 0;

                // Start power accumulation
                holdTimer.current = setInterval(() => {
                    power.current = Math.min(power.current + 0.02, 1);
                    Animated.timing(powerBarWidth, {
                        toValue: power.current * 100,
                        duration: 50,
                        useNativeDriver: false
                    }).start();
                }, 50);
            },

            onPanResponderMove: (evt, gestureState) => {
                const dx = gestureState.dx;
                const dy = gestureState.dy;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Limit movement to circle
                if (distance > maxDistance) {
                    const angle = Math.atan2(dy, dx);
                    const limitedX = Math.cos(angle) * maxDistance;
                    const limitedY = Math.sin(angle) * maxDistance;

                    joystickPosition.setValue({ x: limitedX, y: limitedY });

                    // Calculate normalized direction
                    direction.current = {
                        x: limitedX / maxDistance, // Negative for correct direction
                        z: limitedY / maxDistance
                    };
                } else {
                    joystickPosition.setValue({ x: dx, y: dy });
                    direction.current = {
                        x: dx / maxDistance,
                        z: dy / maxDistance
                    };
                }
            },

            onPanResponderRelease: () => {
                setIsActive(false);

                // Clear timer
                if (holdTimer.current) {
                    clearInterval(holdTimer.current);
                    holdTimer.current = null;
                }

                // Shoot the ball
                const shootPower = power.current;
                const shootDirection = { ...direction.current };

                if (onShoot && shootPower > 0.1) {
                    onShoot({
                        power: shootPower,
                        direction: shootDirection
                    });
                }

                // Reset joystick
                Animated.spring(joystickPosition, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7
                }).start();

                Animated.timing(powerBarWidth, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false
                }).start();

                power.current = 0;
                direction.current = { x: 0, z: 0 };
            }
        })
    ).current;

    
    return (
        <View style={[styles.container, { width: size, height: size, bottom: insets.bottom + 40 }]}>
            {/* <View stle={[styles.joystickArea]}> */}
            {/* Power Bar */}
            <View style={styles.powerBarContainer}>
                <Animated.View
                    style={[
                        styles.powerBar,
                        {
                            width: powerBarWidth.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%']
                            }),
                            backgroundColor: powerBarWidth.interpolate({
                                inputRange: [0, 50, 100],
                                outputRange: ['#00ff88', '#ffaa00', '#ff0055']
                            })
                        }
                    ]}
                />
            </View>

            {/* Joystick Base */}
            <View style={[styles.joystickBase, { opacity: disabled ? 0.3 : 1 }]}>
                {/* Direction indicators */}
                <View style={styles.crosshair}>
                    <View style={styles.crosshairLine} />
                    <View style={[styles.crosshairLine, styles.crosshairLineVertical]} />
                </View>

                {/* Joystick Handle */}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.joystickHandle,
                        {
                            transform: [
                                { translateX: joystickPosition.x },
                                { translateY: joystickPosition.y }
                            ]
                        },
                        isActive && styles.joystickHandleActive
                    ]}
                >
                    <View style={styles.joystickInner} />
                </Animated.View>
            </View>
            {/* </View> */}
        </View>
    );
};

const styles =  StyleSheet.create({
        container: {
            position: 'absolute',
            left: '50%',
            transform: [{ translateX: -75 }], // half of joystick size
            width: 150,                     // Joystick base size (adjustable)
            height: 150,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
        },
       
        powerBarContainer: {
            position: 'absolute',
            top: -40,
            width: '100%',
            height: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 10,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        powerBar: {
            height: '100%',
            borderRadius: 8,
        },
        joystickBase: {
            width: '100%',
            height: '100%',
            borderRadius: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderWidth: 3,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
        },
        crosshair: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        crosshairLine: {
            position: 'absolute',
            width: '60%',
            height: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        crosshairLineVertical: {
            width: 2,
            height: '60%',
        },
        joystickHandle: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(0, 212, 255, 0.8)',
            borderWidth: 3,
            borderColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#00d4ff',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 8,
        },
        joystickHandleActive: {
            backgroundColor: 'rgba(0, 255, 136, 0.9)',
            shadowColor: '#00ff88',
            transform: [{ scale: 1.1 }],
        },
        joystickInner: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: 'white',
        },
    });