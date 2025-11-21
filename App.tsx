import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useRef, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber/native'
import {
  FirstPersonControls,
  OrbitControls,
  TrackballControls,
  GizmoHelper, GizmoViewcube, GizmoViewport,
  useHelper,
  useTexture
} from '@react-three/drei/native'
import {
  SpotLightHelper,
  TextureLoader,
  RepeatWrapping,
  Color,
  DirectionalLightHelper,
  CameraHelper
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Pitch } from './Pitch'
import { Ball } from './Ball';
import { Keeper } from './Keeper';
import { GoalPost } from './GoalPost';
import { ScoreSheet } from './ScoreSheet';
import { CameraControl } from './CameraControl';
import { Joystick } from './Joystick';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const keeperRef = useRef<any>(null)
  const [difficulty, setDifficulty] = useState(1)
  const keeperDirection = useRef(1)
  const ballRef = useRef<any>(null)
  const postRef = useRef<any>(null)
  const lineRef = useRef<any>(null)
  const wallRef = useRef<any>(null)
  const brickBackRef = useRef<any>(null)
  const brickLeftRef = useRef<any>(null)
  const brickRightRef = useRef<any>(null)
  const leftcrossbarRef = useRef<any>(null)
  const topcrossbarRef = useRef<any>(null)
  const rightcrossbarRef = useRef<any>(null)
  const orbitControlsRef = useRef<any>(null)
  const [isGoal, setIsGoal] = useState(false)
  const [score, setScore] = useState(0)
  const [points, setPoints] = useState(0)
  const [notification, setNotification] = useState(null)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [shotsRemaining, setShotsRemaining] = useState(3)
  const [highScore, setHighScore] = useState(0);
  const [isShotTaken, setIsShotTaken] = useState(false);
  const [resetCamera, setResetCamera] = useState(false);

  const [joystickInput, setJoystickInput] = useState(null);

  const handleJoystickShoot = (shootData: any) => {
    setJoystickInput(shootData);
  };
  //  useEffect(() => {
  //       const saved = Number(localStorage.getItem("highScore")) || 0;
  //       setHighScore(saved);
  //   }, []);


  // const previous = Number(localStorage.getItem("highScore")) || 0;

  // if (points > previous) {
  //     // localStorage.setItem("highScore", points);
  //     setHighScore(points);
  // }


  useEffect(() => {
    let interval: any;
    interval = setInterval(() => {
      setTime(t => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleShot = () => {
    setIsShotTaken(true);
    // After ball stops or goal/miss, reset camera
    setTimeout(() => {
      setIsShotTaken(false);
      // setResetCamera(true);
      // setTimeout(() => setResetCamera(false), 100);
    }, 3000);
  };

  // console.log('is shot taken -->', )

  const handleGoal = () => {
    setScore(s => s + 1)
    switch (difficulty) {
      case 2: {
        const newPoint = points + 100 * 1.2
        console.log('new Point -->', newPoint)
        setPoints(newPoint)
        break;
      }
      case 3: {
        setPoints(s => s + (100 * 1.3))
        break;
      }
      case 4: {
        setPoints(s => s + (100 * 1.4))
        break;
      }
      case 5: {
        setPoints(s => s + (100 * 1.5))
        break;
      }
      default:
        setPoints(s => s + 100)
        break;
    }

    // updateHighScore()
    if (!isPlaying) setIsPlaying(true)

  }

  const restartGame = () => {
    if (ballRef.current) {
      setResetCamera(true)
      ballRef.current.position.set(0, 0.5, 0)
      setShotsRemaining(3)
      setIsShotTaken(false);

    }
  }

  const showNotification = (message: any, type: any) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 2000)
  }


  return (
    <>
      <SafeAreaProvider>
        <ScoreSheet
          score={score}
          setScore={setScore}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          time={time}
          setTime={setTime}
          restartGame={restartGame}
          points={points}
          setPoints={setPoints}
          notification={notification}
          shotsRemaining={shotsRemaining}
          highScore={highScore}

        />
        <Joystick
          onShoot={handleJoystickShoot}
        />
        <Canvas
          camera={{ position: [3, 2, 0], fov: 100 }}
        >
          {/* <CameraControl
      ballRef={ballRef}
      isShotTaken={isShotTaken}
      resetCameraFlag={resetCamera}
      orbitControlsRef={orbitControlsRef} /> */}

          <OrbitControls
            ref={orbitControlsRef}
            enabled={!isShotTaken}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.6}
            panSpeed={1.0}
            rotateSpeed={0.4}
            minDistance={1}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2}
          />
          <ambientLight intensity={2} color={'white'} />
          <directionalLight intensity={1.5} position={[5, 10, 5]} />
          <directionalLight intensity={0.8} position={[-6, 2, 2]} />
          <directionalLight intensity={0.8} position={[6, 2, 2]} />
          <Suspense fallback={null}>
            <GoalPost
              postRef={postRef}
              lineRef={lineRef}
              topcrossbarRef={topcrossbarRef}
              leftcrossbarRef={leftcrossbarRef}
              rightcrossbarRef={rightcrossbarRef}
              wallRef={wallRef}
              brickBackRef={brickBackRef}
              brickLeftRef={brickLeftRef}
              brickRightRef={brickRightRef} />
            <Ball
              ballRef={ballRef}
              keeperRef={keeperRef}
              postRef={postRef}
              lineRef={lineRef}
              wallRef={wallRef}
              brickBackRef={brickBackRef}
              brickLeftRef={brickLeftRef}
              brickRightRef={brickRightRef}
              onGoal={handleGoal}
              points={points}
              setPoints={setPoints}
              isGoal={isGoal}
              setIsGoal={setIsGoal}
              difficulty={difficulty}
              topcrossbarRef={topcrossbarRef}
              leftcrossbarRef={leftcrossbarRef}
              rightcrossbarRef={rightcrossbarRef}
              showNotification={showNotification}
              shotsRemaining={shotsRemaining}
              setShotRemaining={setShotsRemaining}
              handleShot={handleShot}
              restartGame={restartGame}
              setResetCamera={setResetCamera}
              joystickInput={joystickInput}
              setJoystickInput={setJoystickInput}
            />
            <Keeper
              keeperRef={keeperRef}
              difficulty={difficulty}
              keeperDirection={keeperDirection}
            />




            <Pitch />

          </Suspense>

        </Canvas>
      </SafeAreaProvider>
    </>

  );
}


