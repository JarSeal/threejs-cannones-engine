const APP_CONFIG = {
  FS_PORT: 3084,
  PROJECTS_FOLDER_NAME: 'Projects',
  SINGLE_PROJECT_CHILD_FOLDERS: [
    '_data/scenes',
    '_data/images',
    '_data/textures',
    '_data/cubetextures',
    '_data/materials',
    '_data/models',
  ],
  SINGLE_PROJECT_SCENE_FILES_FOLDER: '_data/scenes',
  SINGLE_PROJECT_IMAGES_FOLDER: '_data/images',
  SINGLE_PROJECT_TEXTURES_FOLDER: '_data/textures',
  SINGLE_PROJECT_CUBETEXTURES_FOLDER: '_data/cubetextures',
  SINGLE_PROJECT_MATERIALS_FOLDER: '_data/materials',
  SINGLE_PROJECT_MODELS_FOLDER: '_data/models',
  SIMPLE_ID_REGEX: '^[a-zA-Z0-9-_]+$',
};

// Projects (folder)
// -- myProject (folder)
// ----- _data (folder)
// -------- scenes (folder)
// -------- images (folder)
// -------- textures (folder)
// -------- cubetextures (folder)
// -------- materials (folder)
// -------- models (folder)

export const APP_DEFAULTS = {
  APP_NAME: 'ForThree.js',
};

export default APP_CONFIG;
