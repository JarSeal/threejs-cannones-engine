const ERRORS = {
  projectFolderParamMissing: {
    errorCode: 400,
    errorMsg: 'Error: Parameter "projectFolder" was not specified',
  },
  sceneIdParamMissing: {
    errorCode: 400,
    errorMsg: 'Error: Parameter "sceneId" was not specified',
  },
  couldNotFindProjectFolder: {
    errorCode: 404,
    errorMsg: 'Error: Could not find project folder in "${path}"',
  },
  couldNotFindSceneFile: {
    errorCode: 404,
    errorMsg: 'Error: Could not find scene file in "${path}"',
  },
};

export default ERRORS;
