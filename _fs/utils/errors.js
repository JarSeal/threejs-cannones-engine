import APP_CONFIG from '../../APP_CONFIG';

const ERRORS = {
  projectFolderParamMissing: {
    errorCode: 400,
    errorMsg: 'Error: Parameter "projectFolder" was not specified.',
  },
  sceneIdParamMissing: {
    errorCode: 400,
    errorMsg: 'Error: Parameter "sceneId" was not specified.',
  },
  couldNotFindProjectFolder: {
    errorCode: 404,
    errorMsg: 'Error: Could not find project folder in "$[path]".',
  },
  couldNotFindOrReadProjectFile: {
    errorCode: 404,
    errorMsg: 'Error: Could not find or read project file in "$[path]".',
  },
  couldNotCreateProjectFolderStructure: {
    errorCode: 500,
    errorMsg:
      'Error: Could not create new project folder structure for "$[projectFolder]" in "$[path]".',
  },
  couldNotCreateProjectFile: {
    errorCode: 500,
    errorMsg: 'Error: Could not create new project file for "$[projectFolder]" in "$[path]".',
  },
  couldNotCreateProjectsBaseFolder: {
    errorCode: 500,
    errorMsg: `Error: Could not create the Projects' base folder ("${APP_CONFIG.PROJECTS_FOLDER_NAME}") in "$[path]".`,
  },
  couldNotFindOrReadSceneFile: {
    errorCode: 404,
    errorMsg: 'Error: Could not find or read scene file in "$[path]".',
  },
  couldNotFindOrWriteSceneFile: {
    errorCode: 500,
    errorMsg: 'Error: Could not write scene file in "$[path]".',
  },
  couldNotUpdateProjectFile: {
    errorCode: 500,
    errorMsg: 'Error: Could not update project file for project "$[projectFolder]".',
  },
  projectFolderAlreadyExists: {
    errorCode: 500,
    errorMsg: 'Error: Project folder "$[projectFolder]" already exists in "$[path]".',
  },
  genericError: {
    errorCode: 500,
    errorMsg: 'Error: Something went wrong.',
  },
  projectFolderContainsInvalidChars: {
    errorCode: 400,
    errorMsg: 'Error: Project folder contains invalid characters.',
  },
  sceneIdContainsInvalidChars: {
    errorCode: 400,
    errorMsg: 'Error: Scene ID contains invalid characters.',
  },
  sceneFileAlreadyExists: {
    errorCode: 400,
    errorMsg: 'Error: Scene file with ID "$[sceneId]" already exists.',
  },
  couldNotCreateSceneFile: {
    errorCode: 500,
    errorMsg: 'Error: Could not create scene file at "$[path]".',
  },
  couldNotDeleteSceneFile: {
    errorCode: 500,
    errorMsg: 'Error: Could not delete scene file at "$[path]".',
  },
};

export const getError = (key, replacersO, additionalMsg) => {
  let error = ERRORS[key];
  if (!error) {
    console.warn(`Could not find ERRORS object with key "${key}".`);
    error = ERRORS.genericError;
  }
  if (replacersO) {
    const replaceKeys = Object.keys(replacersO);
    let message = error.errorMsg;
    for (let i = 0; i < replaceKeys.length; i++) {
      const replaceKey = replaceKeys[i];
      const replaceValue = replacersO[replaceKey];
      message = message.replaceAll(`$[${replaceKey}]`, replaceValue);
    }
    error.errorMsg = message;
  }
  if (additionalMsg) {
    error.errorMsg += ` ${additionalMsg}`;
  }
  return error;
};

export default ERRORS;
