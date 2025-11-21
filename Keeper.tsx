import React, { useEffect, useRef, useState } from 'react'
import { useLoader, useFrame } from '@react-three/fiber/native'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TextureLoader} from 'expo-three'
import { Asset } from 'expo-asset';

export const Keeper = ({ keeperRef, difficulty, keeperDirection }: { keeperRef?: any, difficulty?: any, keeperDirection?: any }) => {

    const [keeperModelUri, setKeeperModelUri] = useState<string | null>(null);

    useEffect(() => {
        const loadAsset = async () => {
            try {
                const asset = Asset.fromModule(
                    require('./public/human.glb')
                );
                await asset.downloadAsync();
                setKeeperModelUri(asset.localUri || asset.uri);
            } catch (error) {
                console.error('Error loading model:', error);
            }
        };
        loadAsset();
    }, []);
    const myImage = require('./public/textures/male_casualsuit01_diffuse.jpg');
    const suitTexture = useLoader(TextureLoader, myImage)

    const skinImage = require('./public/black-cloth.jpg');
    const skinTexture = useLoader(TextureLoader, skinImage)

    const shoeImage = require('./public/textures/shoes01_diffuse.jpg');
    const shoeTexture = useLoader(TextureLoader, shoeImage)

    const hairImage = require('./public/rosewood.jpg');
    const hairTexture = useLoader(TextureLoader, hairImage)

    const gltf = keeperModelUri ? useLoader(GLTFLoader, keeperModelUri) : null;

  

   useEffect(() => {
    if (!gltf) return;

    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // Assign textures based on material name or mesh name
        if (child.material.name.toLowerCase().includes('male_casualsuit01')) {
          child.material.map = suitTexture;
          child.material.needsUpdate = true;
        } if (child.material.name.toLowerCase() === 'shoes01') {
          child.material.map = shoeTexture;
          child.material.needsUpdate = true;
        }
        if (child.material.name.toLowerCase() === 'young_caucasian_female2'){
            child.material.map = skinTexture;
            child.material.needsUpdate = true;
        }
        if (child.material.name.toLowerCase() === 'mhair01black'){
            child.material.map = hairTexture;
            child.material.needsUpdate = true;
        }
      }
    });
  }, [gltf, suitTexture, shoeTexture, skinTexture, hairTexture]);



    useFrame((state, delta) => {

        if (!keeperRef?.current || !gltf) return;
        const keeper = keeperRef.current

        // Side-to-side animation
        const baseSpeed = 2
        const speed = baseSpeed * (1 + difficulty * 0.5) // units per second
        const range = 3 // how far to move from center (total width = range * 2)

        keeper.position.z += speed * delta * keeperDirection.current

        // Reverse direction at boundaries
        if (keeper.position.z > range) {
            keeper.position.z = range
            keeperDirection.current = -1
        } else if (keeper.position.z < -range) {
            keeper.position.z = -range
            keeperDirection.current = 1
        }
    })


    if (!gltf) return null;
    //  useFrame(() => {
    //     shoeRef.current.rotation.y += 0.01

    // },[])
    return (
        <primitive
            ref={keeperRef}
            object={gltf.scene}
            position={[-11, 0.2, 0.2]}
            rotation={[Math.PI / 1.8, Math.PI / 2, -Math.PI / 1.8]}
            scale={[0.13, 0.1, 0.13]} />)

}