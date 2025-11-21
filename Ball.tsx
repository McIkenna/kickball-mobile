import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber/native'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Asset } from 'expo-asset';
import * as THREE from 'three'
export const Ball = ({
    ballRef,
    keeperRef,
    postRef,
    onGoal,
    lineRef,
    wallRef,
    difficulty,
    topcrossbarRef,
    leftcrossbarRef,
    rightcrossbarRef,
    brickBackRef,
    brickLeftRef,
    points,
    setPoints,
    isGoal,
    setIsGoal,
    brickRightRef,
    shotsRemaining,
    setShotRemaining,
    showNotification,
    handleShot,
    restartGame,
    setResetCamera,
    joystickInput,
    setJoystickInput }: {
        ballRef?: any,
        keeperRef?: any,
        postRef?: any,
        wallRef?: any,
        onGoal: any,
        difficulty: any,
        lineRef: any,
        topcrossbarRef: any,
        leftcrossbarRef: any,
        rightcrossbarRef: any,
        brickBackRef: any,
        brickLeftRef: any,
        brickRightRef: any,
        points: any,
        setPoints: any,
        isGoal: any,
        setIsGoal: any,
        showNotification: any,
        shotsRemaining: any,
        setShotRemaining: any,
        restartGame: any,
        handleShot: any
        setResetCamera: any,
        joystickInput: any,
        setJoystickInput: any
    }) => {

    const [modelUri, setModelUri] = useState<string | null>(null);

    useEffect(() => {
        const loadAsset = async () => {
            try {
                const asset = Asset.fromModule(
                    require('./public/low_poly_cartoon_football_ball_free.glb')
                );
                await asset.downloadAsync();
                setModelUri(asset.localUri || asset.uri);
            } catch (error) {
                console.error('Error loading model:', error);
            }
        };
        loadAsset();
    }, []);

    const gltf = modelUri ? useLoader(GLTFLoader, modelUri) : null;


    // linear velocity in scene units per second
    const velocity = useRef(new THREE.Vector3(0, 0, 0))
    const radiusRef = useRef<number | null>(null)

    const mouseDownTime = useRef<number | null>(null)

    const handlePointerDown = (e: any) => {
        e.stopPropagation()
        if (shotsRemaining >= 1) {
            mouseDownTime.current = Date.now()

        }
        if (shotsRemaining === 0) {
            showNotification('You Ran Out of Attempts', 'miss')
            restartGame()
        }
    }

    const handlePointerUp = (e: any) => {
        e.stopPropagation()
        const mesh = ballRef.current
        if (!mesh || mouseDownTime.current === null) return

        // calculate hold duration in seconds
        const holdDuration = (Date.now() - mouseDownTime.current) / 1000
        mouseDownTime.current = null

        // e.point is the intersection point in world space
        const target = new THREE.Vector3().copy(e.point)
        // direction from target to mesh (opposite of target->mesh)
        const dir = new THREE.Vector3().subVectors(mesh.position, target).normalize()

        // power increases with hold duration
        const minSpeed = 15
        const maxSpeed = 50
        const maxHoldTime = 4 // max hold time in seconds for full power

        // calculate speed based on hold duration (clamped to max)
        const holdRatio = Math.min(holdDuration / maxHoldTime, 1)
        const speed = minSpeed + (maxSpeed - minSpeed) * holdRatio

        velocity.current.copy(dir.multiplyScalar(speed))
        handleShot()
        setShotRemaining((s: any) => s - 1)

    }

    const { camera } = useThree();
    useEffect(() => {
        if (joystickInput && ballRef.current) {
            const { power, direction } = joystickInput;

            const minSpeed = 15;
        const maxSpeed = 50;
        const speed = minSpeed + (maxSpeed - minSpeed) * power;

        const dir = new THREE.Vector3(direction.x, 0, direction.z);

        // rotate by camera direction
        // dir.applyEuler(new THREE.Euler(0, camera.rotation.y, 0, "XYZ"));

        dir.applyQuaternion(camera.quaternion);
        dir.y = 0;

        // add upward arc
        dir.y = 0.3 + power * 0.2;

        const shootDirection = dir.normalize();

        velocity.current.copy(shootDirection.multiplyScalar(speed));

        handleShot();
        setShotRemaining((s:any) => s - 1);
        setJoystickInput(null);
        }
    }, [joystickInput]);



    useEffect(() => {
        if (isGoal) {
            onGoal()
            showNotification('GOAL!!!', 'success')
            setShotRemaining(3)
            setResetCamera(true)
        }

        setTimeout(() => {
            setIsGoal(false);
        }, 2000);
    }, [isGoal])

    useFrame((state, delta) => {
        const mesh = ballRef.current
        if (!mesh) return
        // compute bounding radius once (in world scale) for collision checks
        if (radiusRef.current === null) {
            try {
                const box = new THREE.Box3().setFromObject(mesh)
                const sphere = box.getBoundingSphere(new THREE.Sphere())
                radiusRef.current = sphere.radius || 0.05
            } catch (err) {
                radiusRef.current = 0.05
            }
        }
        const radius = radiusRef.current || 0.05

        // apply gravity (downward acceleration)
        const gravity = -9.8 // m/s² (negative because it pulls down on y-axis)
        velocity.current.y += gravity * delta

        // integrate simple Euler
        mesh.position.addScaledVector(velocity.current, delta)

        // apply simple damping so it slows down over time; higher damping for the faster initial speed
        velocity.current.multiplyScalar(Math.max(0, 1 - 2.0 * delta))

        // simple collision with the pitch plane at y = 0
        const planeY = 0
        if (mesh.position.y - radius <= planeY) {
            // prevent penetration
            mesh.position.y = planeY + radius
            // bounce: invert y velocity with restitution
            const restitution = 0.6 // how bouncy the collision is (0..1)
            if (velocity.current.y < 0) {
                velocity.current.y = -velocity.current.y * restitution
            }
            // apply friction on horizontal movement upon contact
            const friction = 0.2
            velocity.current.x *= friction
            velocity.current.z *= friction
            // if vertical velocity is very small, stop vertical movement
            if (Math.abs(velocity.current.y) < 0.05) velocity.current.y = 0
        }

        // Keeper collision detection
        const keeper = keeperRef.current // You'll need to pass keeperRef as a prop
        if (keeper) {
            const keeperBox = new THREE.Box3().setFromObject(keeper)
            const ballSphere = new THREE.Sphere(mesh.position, radius)

            if (keeperBox.intersectsSphere(ballSphere)) {
                // Ball hit the keeper - bounce back
                const keeperCenter = new THREE.Vector3()
                keeperBox.getCenter(keeperCenter)

                // Calculate bounce direction (away from keeper)
                const bounceDir = new THREE.Vector3()
                    .subVectors(mesh.position, keeperCenter)
                    .normalize()

                // Apply bounce velocity
                const bounceSpeed = 3
                velocity.current.copy(bounceDir.multiplyScalar(bounceSpeed))

                // Move ball outside keeper to prevent sticking
                mesh.position.copy(keeperCenter).add(bounceDir.multiplyScalar(radius + 0.5))

                if (points >= 20) {
                    setPoints((s: any) => s - 20)
                }

                setTimeout(() => {
                    velocity.current.set(0, 0, 0)
                    showNotification('SAVED BY KEEPER!', 'save')
                    restartGame()
                }, 1000)
            }
        }

        // Goal post collision detection

        const topcrossbar = topcrossbarRef?.current
        const leftcrossbar = leftcrossbarRef?.current
        const rightcrossbar = rightcrossbarRef?.current
        const wall = wallRef.current

        const crossbars = [
            { ref: topcrossbar, name: 'top' },
            { ref: leftcrossbar, name: 'left' },
            { ref: rightcrossbar, name: 'right' },
            { ref: wall, name: 'wall' }
        ]

        for (const crossbar of crossbars) {
            if (crossbar.ref) {
                const crossbarBox = new THREE.Box3().setFromObject(crossbar.ref)
                const ballSphere = new THREE.Sphere(mesh.position, radius)

                if (crossbarBox.intersectsSphere(ballSphere)) {
                    // Ball hit the crossbar - bounce back
                    const crossbarCenter = new THREE.Vector3()
                    crossbarBox.getCenter(crossbarCenter)

                    // Calculate bounce direction (away from crossbar)
                    const bounceDir = new THREE.Vector3()
                        .subVectors(mesh.position, crossbarCenter)
                        .normalize()

                    // Preserve some of the original velocity for realistic bounce
                    const currentSpeed = velocity.current.length()
                    const bounceSpeed = Math.max(currentSpeed * 0.7, 2) // At least 3 units/sec

                    velocity.current.copy(bounceDir.multiplyScalar(bounceSpeed))

                    // Move ball outside crossbar to prevent sticking
                    mesh.position.copy(crossbarCenter).add(bounceDir.multiplyScalar(radius + 0.2))

                    // Break after first collision to avoid multiple bounces per frame
                    setTimeout(() => {
                        // mesh.position.set(0, 0.5, 0)
                        velocity.current.set(0, 0, 0)
                        showNotification('Hit The Woodwork!', 'miss')
                        restartGame()

                    }, 1000)
                    break
                }
            }
        }

        const wallBack = brickBackRef?.current
        const wallLeft = brickLeftRef?.current
        const wallRight = brickRightRef?.current

        const wallStacks = [
            { ref: wallBack, name: 'back' },
            { ref: wallLeft, name: 'left' },
            { ref: wallRight, name: 'right' },
        ]

        for (const wallStack of wallStacks) {
            if (wallStack.ref) {
                const wallstackBox = new THREE.Box3().setFromObject(wallStack.ref)
                const ballSphere = new THREE.Sphere(mesh.position, radius)

                if (wallstackBox.intersectsSphere(ballSphere)) {
                    // Ball hit the crossbar - bounce back
                    const wallstackCenter = new THREE.Vector3()
                    wallstackBox.getCenter(wallstackCenter)

                    // Calculate bounce direction (away from crossbar)
                    const bounceDir = new THREE.Vector3()
                        .subVectors(mesh.position, wallstackCenter)
                        .normalize()

                    const currentSpeed = velocity.current.length()
                    const bounceSpeed = Math.max(currentSpeed * 0.7, 2) // At least 3 units/sec

                    velocity.current.copy(bounceDir.multiplyScalar(bounceSpeed))

                    // Move ball outside crossbar to prevent sticking
                    mesh.position.copy(wallstackCenter).add(bounceDir.multiplyScalar(radius + 0.5))

                    // Break after first collision to avoid multiple bounces per frame
                    setTimeout(() => {
                        showNotification('Out of Play', 'miss')
                        restartGame()
                    }, 1000)
                    break
                }
            }
        }

        const post = postRef.current // Pass postRef as a prop



        const line = lineRef.current

        if (line || post) {

            const goalLine = new THREE.Box3().setFromObject(line)
            const ballSphere = new THREE.Sphere(mesh.position, radius)

            if (goalLine.intersectsSphere(ballSphere)) {
                // Ball hit the plane, goal scored
                // const goalLineCenter = new THREE.Vector3()
                // goalLine.getCenter(goalLineCenter)
                velocity.current.multiplyScalar(0.3)
                setIsGoal(true)
                // Reset ball position after goal
                setTimeout(() => {
                    // velocity.current.set(0, 0, 0)
                    mesh.position.set(0, 0.5, 0)
                    velocity.current.set(0, 0, 0)
                    setIsGoal(false)
                }, 1000)

            }
        }
    })

    if (!gltf) return null;

    return (
        <primitive
            ref={ballRef}
            object={gltf.scene}
            position={[0, 0.27, 0]}
            scale={[0.005, 0.005, 0.005]}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        />
    );
}
