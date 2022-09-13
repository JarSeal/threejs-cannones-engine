export const scene1 = {
  id: 'scene1',
  axesHelper: true,
  axesHelperLength: 100,
  grid: true,
  gridSize: 26,
  orbitControls: true,
  shadowType: 'PCFSoftShadowMap',
  lights: [
    {
      id: 'ambient',
      type: 'ambient',
      color: 0xffffff,
      intensity: 0.2,
    },
    {
      id: 'hemi',
      type: 'hemisphere',
      colorTop: 0xffffbb,
      colorBottom: 0x080820,
      intensity: 0.25,
      position: [0, 0, 0],
    },
    {
      type: 'point',
      position: [0, 5, 0],
      color: 0xffffff,
      intensity: 10,
      distance: 200,
      decay: 150,
      castShadow: true,
      showHelper: true,
    },
  ],
  cameras: [
    {
      id: 'main',
      type: 'perspective',
      fov: 45,
      near: 1,
      far: 256,
      position: [5, 5, 5],
      lookAt: [0, 0, 0],
    },
    // TODO: Add ortographic camera type
  ],
  allCameras: [], // This is set in the SceneLoader
  curCameraIndex: 0,
  objects: [
    {
      type: 'shape',
      id: 'my-blue-box',
      shape: 'box',
      position: [2, 2, 2],
      rotation: [0, 75, 0],
      size: [1, 1, 1],
      castShadow: true,
      receiveShadow: true,
      material: {
        type: 'lambert',
        color: 0x00ffff,
      },
    },
    {
      type: 'shape',
      id: 'ground',
      shape: 'box',
      position: [0, -0.0675, 0],
      size: [20, 0.125, 20],
      receiveShadow: true,
      material: {
        type: 'lambert',
        color: 0xcccccc,
      },
    },
  ],
};
