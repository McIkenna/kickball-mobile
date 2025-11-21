import React from 'react'

export const CenterPatch = () => {


    return (
        <mesh
            position={[0, 0.11, 0]}
            rotation={[-Math.PI / 2, 0, 0]} // lay flat on ground
            scale={[0.2, 0.2, 1]}               // scale uniformly for circle
        >
            <circleGeometry args={[1, 64]} />
            <meshStandardMaterial color="white" />
        </mesh>
    )
}