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
  couldNotFindOrReadSceneFile: {
    errorCode: 404,
    errorMsg: 'Error: Could not find or read scene file in "${path}"',
  },
  couldNotFindOrWriteSceneFile: {
    errorCode: 500,
    errorMsg: 'Error: Could not write scene file in "${path}"',
  },
};

export default ERRORS;
