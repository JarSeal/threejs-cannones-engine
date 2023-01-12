export const CAMERA_TARGET_ID = '__camera-target';
export const SELECTION_GROUP_ID = '__selection-group';

export const AMBIENT_LIGHT = {
  color: 0xffffff,
  intensity: 1,
};

export const HEMI_LIGHT = {
  colorTop: 0xffffbb,
  colorBottom: 0x080820,
  intensity: 0.78,
};

export const POINT_LIGHT = {
  color: 0xffffff,
  intensity: 1,
  distance: 10,
  decay: 5,
};

export const NEW_SHAPE_BOX = {
  size: [1, 1, 1],
};

export const NEW_MATERIAL = {
  type: 'basic',
  color: '#ff0000',
};

export const NEW_ELEM_DEFAULT_PARAMS = {
  name: '',
  type: 'shape',
  shapeParams: NEW_SHAPE_BOX,
  paramType: 'element',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  defaultPosition: [0, 0, 0],
  defaultRotation: [0, 0, 0],
  defaultScale: [1, 1, 1],
  castShadow: true,
  receiveShadow: true,
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
