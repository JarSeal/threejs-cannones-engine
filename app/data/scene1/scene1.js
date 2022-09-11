export const scene1 = {
  id: 'scene1',
  axesHelper: true,
  axesHelperLength: 100,
  orbitControls: true,
  lights: [
    {
      id: 'ambient',
      type: 'ambient',
      color: 0xffffff,
      intensity: 1,
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
      type: '', // TODO, different object types
    },
  ],
};
