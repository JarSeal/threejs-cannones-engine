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

export const NEW_CAMERA_DEFAULT_PARAMS = {
  name: '',
  type: 'perspectiveTarget',
  orthoViewSize: 1,
  fov: 45,
  near: 0.1,
  far: 256,
  position: [5, 5, 5],
  target: [0, 0, 0],
  defaultPosition: [5, 5, 5],
  defaultTarget: [0, 0, 0],
  orbitControls: false,
  showHelper: true,
};

export const CAMERA_TYPES = [
  { value: 'perspectiveTarget', label: 'Targeted perspective camera' },
  { value: 'perspectiveFree', label: 'Free perspective camera (TODO)', disabled: true },
  { value: 'orthographicTarget', label: 'Targeted orthographic camera' },
  { value: 'orthographicFree', label: 'Free orthographic camera (TODO)', disabled: true },
];
