import * as THREE from 'three';

export const CAMERA_TARGET_ID = '__camera-target';
export const SELECTION_GROUP_ID = '__selection-group';
export const CANVAS_ELEM_ID = '__main-stage__';
export const SMALL_STATS_CONTAINER_ID = 'smallStats-container';
export const SMALL_STATS_ID = 'smallStats';

export const AMBIENT_LIGHT = {
  color: '#ffffff',
  intensity: 0.2,
};

export const HEMI_LIGHT = {
  colorTop: '#ffffbb',
  colorBottom: '#080820',
  intensity: 0.25,
};

export const POINT_LIGHT = {
  color: '#ffffff',
  intensity: 1,
  distance: 10,
  decay: 5,
};

export const NEW_SHAPE_BOX = {
  size: [1, 1, 1],
  shape3D: 'box',
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

export const BACKGROUND_TYPES = [
  { label: 'Color only', value: 'color' },
  { label: 'Texture', value: 'texture' },
  { label: 'Skybox', value: 'cubemap' },
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

export const WRAP_OPTIONS = [
  { label: 'Clamp to edge', value: THREE.ClampToEdgeWrapping },
  { label: 'Repeat', value: THREE.RepeatWrapping },
  { label: 'Mirrored repeat', value: THREE.MirroredRepeatWrapping },
];

export const DEFAULT_TEXTURE = {
  name: '',
  image: null,
  flipY: true,
  wrapS: THREE.ClampToEdgeWrapping,
  wrapT: THREE.ClampToEdgeWrapping,
  wrapSTimes: 1,
  wrapTTimes: 1,
  offsetU: 0,
  offsetV: 0,
  centerU: 0,
  centerV: 0,
  rotation: 0,
  global: false,
};

export const DEFAULT_SCENE = {
  sceneId: null,
  name: '',
  dateCreated: new Date().getTime(),
  dateSaved: new Date().getTime(),
  axesHelper: true,
  axesHelperLength: 100,
  rendererClearColor: '#cccccc',
  backgroundType: BACKGROUND_TYPES[0].value,
  backgroundTexture: null,
  backgroundSkybox: null,
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
  textures: [],
  cubetextures: [],
};

export const MATERIAL_TEXTURE_KEYS = [
  'alphaMap',
  'aoMap',
  'lightMap',
  'map',
  'specularMap',
  'displacementMap',
  'bumpMap',
  'emissiveMap',
  'lightMap',
  'normalMap',
  'matcap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'sheenRoughnessMap',
  'sheenColorMap',
  'specularIntensityMap',
  'specularColorMap',
  'thicknessMap',
  'transmissionMap',
  'metalnessMap',
  'roughnessMap',
  'gradientMap',
];

export const MATERIAL_TYPES = [
  {
    value: 'basic',
    label: 'Basic material',
  },
  {
    value: 'lambert',
    label: 'Lambert material',
  },
  {
    value: 'phong',
    label: 'Phong material',
  },
  {
    value: 'physical',
    label: 'Physical material',
  },
  {
    value: 'standard',
    label: 'Standard material',
  },
  {
    value: 'matcap',
    label: 'Matcap material',
  },
  {
    value: 'toon',
    label: 'Toon material',
  },
  {
    value: 'normal',
    label: 'Normal material',
  },
  {
    value: 'Depth',
    label: 'Depth material',
  },
  {
    value: 'distance',
    label: 'Distance material',
  },
  {
    value: 'custom',
    label: 'Custom material',
  },
];

export const DEFAULT_BASIC_MATERIAL = {
  type: 'basic',
  color: '#ff0000',
  alphaMap: null,
  aoMap: null,
  aoMapIntensity: 1,
  envMap: null,
  combine: THREE.MultiplyOperation,
  fog: true,
  lightMap: null,
  lightMapIntensity: 1,
  map: null,
  reflectivity: 1,
  refractionRatio: 0.98,
  specularMap: null,
  wireframe: false,
};

export const NEW_MATERIAL = DEFAULT_BASIC_MATERIAL;
