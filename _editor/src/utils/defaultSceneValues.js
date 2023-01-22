export const CAMERA_TARGET_ID = '__camera-target';
export const SELECTION_GROUP_ID = '__selection-group';
export const CANVAS_ELEM_ID = 'main-stage';
export const SMALL_STATS_CONTAINER_ID = 'smallStats-container';
export const SMALL_STATS_ID = 'smallStats';

export const AMBIENT_LIGHT = {
  color: 0xffffff,
  intensity: 0.2,
};

export const HEMI_LIGHT = {
  colorTop: 0xffffbb,
  colorBottom: 0x080820,
  intensity: 0.25,
};

export const POINT_LIGHT = {
  color: 0xffffff,
  intensity: 1,
  distance: 10,
  decay: 5,
};

export const NEW_SHAPE_BOX = {
  size: [1, 1, 1],
  shape3D: 'box',
};

export const NEW_MATERIAL = {
  type: 'basic',
  color: '#ff0000',
};

export const NEW_ELEM_DEFAULT_PARAMS = {
  name: '',
  type: 'shape3D',
  shapeParams: NEW_SHAPE_BOX,
  paramType: 'element',
  position: [0, 0.5, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  defaultPosition: [0, 0.5, 0],
  defaultRotation: [0, 0, 0],
  defaultScale: [1, 1, 1],
  castShadow: false,
  receiveShadow: false,
  material: {
    type: 'lambert',
    color: '#999999',
  },
};

export const NEW_CAMERA_DEFAULT_PARAMS = {
  name: '',
  type: 'perspectiveTarget',
  paramType: 'camera',
  orthoViewSize: 1,
  fov: 45,
  near: 0.1,
  far: 256,
  position: [5, 5, 5],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  target: [0, 0, 0],
  defaultPosition: [5, 5, 5],
  defaultRotation: [0, 0, 0],
  defaultScale: [1, 1, 1],
  defaultTarget: [0, 0, 0],
  orbitControls: false,
  showHelper: true,
};

export const CAMERA_TYPES = [
  { value: 'perspectiveTarget', label: 'Targeting perspective camera' },
  { value: 'perspectiveFree', label: 'Free perspective camera (TODO)', disabled: true },
  { value: 'orthographicTarget', label: 'Targeting orthographic camera' },
  { value: 'orthographicFree', label: 'Free orthographic camera (TODO)', disabled: true },
];

export const DEFAULT_PROJECT_VALUES = {
  // projectFolder must be unique and is always validated when new project is created
  name: '',
  rootScene: null,
  scenes: [],
  dateCreated: null,
  dateSaved: null,
};
export const DEFAULT_NEW_PROJECT_SCENE_ID = 'root-scene';
export const DEFAULT_NEW_PROJECT_SCENE_NAME = 'Root scene';

export const DEFAULT_SCENE = {
  sceneId: null,
  name: '',
  dateCreated: new Date().getTime(),
  dateSaved: new Date().getTime(),
  axesHelper: true,
  axesHelperLength: 100,
  rendererClearColor: '#cccccc',
  grid: true,
  gridSize: 26,
  shadowType: null,
  lights: [
    {
      ...AMBIENT_LIGHT,
      id: 'ambient',
      type: 'ambient',
    },
    {
      ...HEMI_LIGHT,
      id: 'hemi',
      type: 'hemisphere',
    },
  ],
  cameras: [
    {
      ...NEW_CAMERA_DEFAULT_PARAMS,
      id: 'editor-main',
      name: 'Editor main camera',
      type: 'perspectiveTarget',
      orbitControls: true,
    },
    {
      ...NEW_CAMERA_DEFAULT_PARAMS,
      id: 'game-cam',
      type: 'perspectiveTarget',
      position: [10, 5, 10],
    },
  ],
  curCameraIndex: 0,
  elements: [
    {
      ...NEW_ELEM_DEFAULT_PARAMS,
      id: 'default-cube',
    },
    {
      type: 'shape3D',
      id: 'default-ground',
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
