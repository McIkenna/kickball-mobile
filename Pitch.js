import React from 'react'
import { useLoader } from '@react-three/fiber/native'
import { TextureLoader, RepeatWrapping} from 'expo-three'
import { CenterPatch } from './CenterPatch'
export const Pitch = () => {
    const myImage = require('./public/full-frame-shot-green-rug.jpg');
    const grassTexture = useLoader(TextureLoader, myImage)
      grassTexture.wrapS = RepeatWrapping
      grassTexture.wrapT = RepeatWrapping
      grassTexture.repeat.set(3, 3)

    return (
        <group>
            <CenterPatch/>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[5, 1, 1]} receiveShadow>
            <planeGeometry args={[10, 20]} />
            <meshStandardMaterial map={grassTexture} />
        </mesh>
        </group>
    )
}