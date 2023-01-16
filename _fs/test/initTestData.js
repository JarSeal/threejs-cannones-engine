export const BASIC_SCENE1 = {
  sceneId: 'scene1',
  name: 'Test scene 1',
  dateCreated: 1663229534337,
  dateSaved: 1663229534337,
  axesHelper: true,
  axesHelperLength: 100,
  rendererClearColor: '#cccccc',
  grid: true,
  gridSize: 26,
  shadowType: null,
  lights: [
    {
      id: 'ambient',
      type: 'ambient',
      color: '#ffffff',
      intensity: 0.2,
    },
    {
      id: 'hemi',
      type: 'hemisphere',
      colorTop: '#ffffbb',
      colorBottom: '#080820',
      intensity: 0.25,
    },
  ],
  cameras: [
    {
      id: 'editor-main',
      name: 'Editor main camera',
      type: 'perspectiveTarget',
      fov: 45,
      near: 0.1,
      far: 256,
      position: [5, 5, 5],
      target: [0, 0, 0],
      orbitControls: true,
      showHelper: true,
    },
    {
      id: 'editor-main2',
      type: 'perspectiveTarget',
      fov: 45,
      near: 0.1,
      far: 256,
      position: [10, 5, 10],
      target: [0, 0, 0],
      showHelper: true,
    },
  ],
  curCameraIndex: 0,
  elements: [
    {
      type: 'shape3D',
      id: 'my-blue-box',
      shapeParams: {
        shape3D: 'box',
        size: [1, 1, 1],
      },
      position: [2, 2, 2],
      rotation: [0, 0.7, 0],
      material: {
        type: 'lambert',
        color: '#00ffff',
      },
    },
    {
      type: 'shape3D',
      id: 'my-other-box',
      shapeParams: {
        shape3D: 'box',
        size: [1, 1, 1],
      },
      position: [-2.5, 0.5, -2.5],
      rotation: [0, 0, 0],
      material: {
        type: 'lambert',
        color: '#ff2233',
      },
    },
    {
      type: 'shape3D',
      id: 'ground',
      shape3D: 'box',
      shapeParams: {
        shape3D: 'box',
        size: [20, 0.125, 20],
      },
      position: [0, -0.0625, 0],
      material: {
        type: 'lambert',
        color: '#cccccc',
      },
    },
  ],
};

export const initTestData = [
  {
    projectFolder: 'saveScene2',
    rootScene: null,
    scenes: [],
  },
  {
    projectFolder: 'saveScene1',
    rootScene: null,
    scenes: [BASIC_SCENE1],
  },
  {
    projectFolder: 'testProject1',
    rootScene: 'scene1',
    scenes: [BASIC_SCENE1],
  },
];
