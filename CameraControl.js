import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const CameraControl = ({ 
  ballRef, 
  isShotTaken,
  resetCameraFlag,
  orbitControlsRef 
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const currentOffset = useRef(new THREE.Vector3(3, 2, 0));
  const targetOffset = useRef(new THREE.Vector3(3, 2, 0));
  const isFollowing = useRef(false);
  const defaultCameraPos = useRef(new THREE.Vector3(3, 2, 0));
  const lastBallPosition = useRef(new THREE.Vector3());
  const smoothedDirection = useRef(new THREE.Vector3(-1, 0, 0));
  
  // Save initial camera position
  useEffect(() => {
    defaultCameraPos.current.copy(camera.position);
  }, []);

  // When shot is taken, switch to follow mode
  useEffect(() => {
    if (isShotTaken && ballRef.current) {
      isFollowing.current = true;
      const ballPos = new THREE.Vector3();
      ballRef.current.getWorldPosition(ballPos);
      lastBallPosition.current.copy(ballPos);
      targetOffset.current.set(3.5, 2.5, 0);
      
      // Disable OrbitControls
      if (orbitControlsRef?.current) {
        orbitControlsRef.current.enabled = false;
      }
    }
  }, [isShotTaken, orbitControlsRef]);

  // Reset camera to default position
  useEffect(() => {
    if (resetCameraFlag) {
      isFollowing.current = false;
      targetOffset.current.copy(new THREE.Vector3(3, 2, 0));
      smoothedDirection.current.set(-1, 0, 0);
      
      // Re-enable OrbitControls
      if (orbitControlsRef?.current) {
        orbitControlsRef.current.enabled = true;
      }
    }
  }, [resetCameraFlag, orbitControlsRef]);

  useFrame((state, delta) => {
    if (!ballRef.current) return;

    const ball = ballRef.current;
    const ballPosition = new THREE.Vector3();
    ball.getWorldPosition(ballPosition);

    if (isFollowing.current) {
      // Smoothly interpolate offset
      currentOffset.current.lerp(targetOffset.current, delta * 3);

      // Calculate ball's movement direction
      const movementDirection = new THREE.Vector3()
        .subVectors(ballPosition, lastBallPosition.current);
      
      if (movementDirection.length() > 0.01) {
        movementDirection.normalize();
        smoothedDirection.current.lerp(movementDirection, delta * 8);
        smoothedDirection.current.normalize();
      }

      lastBallPosition.current.copy(ballPosition);

      const behindDistance = currentOffset.current.x;
      const heightOffset = currentOffset.current.y;
      const sideOffset = currentOffset.current.z;

      targetPosition.current.copy(ballPosition);
      targetPosition.current.addScaledVector(smoothedDirection.current, -behindDistance);
      targetPosition.current.y = ballPosition.y + heightOffset;
      
      if (sideOffset !== 0) {
        const sideVector = new THREE.Vector3()
          .crossVectors(smoothedDirection.current, new THREE.Vector3(0, 1, 0))
          .normalize();
        targetPosition.current.addScaledVector(sideVector, sideOffset);
      }

      camera.position.lerp(targetPosition.current, delta * 6);
      
      const lookAtPoint = ballPosition.clone()
        .addScaledVector(smoothedDirection.current, 0.5);
      
      camera.lookAt(lookAtPoint);
      
      if (camera.fov !== 90) {
        camera.fov += (90 - camera.fov) * delta * 3;
        camera.updateProjectionMatrix();
      }
    } else {
      // Return to default position smoothly
      currentOffset.current.lerp(new THREE.Vector3(3, 2, 0), delta * 2);
      camera.position.lerp(defaultCameraPos.current, delta * 2);
      camera.lookAt(0, 0, 0);
      
      if (camera.fov !== 100) {
        camera.fov += (100 - camera.fov) * delta * 3;
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
};