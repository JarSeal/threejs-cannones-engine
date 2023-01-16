import ERRORS from '../utils/errors';
import { saveSceneData } from './saveScene';
import { BASIC_SCENE1 } from '../test/initTestData';
import { loadSceneData } from './loadScene';

describe('saveScene controller', () => {
  it('should successfully save and return a scene', async () => {
    const projectFolder = 'saveScene1';
    const responseData = saveSceneData({ ...BASIC_SCENE1, projectFolder });
    const loadedFileData = loadSceneData({ projectFolder, sceneId: BASIC_SCENE1.sceneId });
    const timeNow = new Date().getTime();
    const precision = 1000; // @TODO: create a helper util for this (/tests/utils.js)
    const dateSavedPass1 = Math.abs(timeNow - responseData.sceneParams.dateSaved) < precision;
    const dateSavedPass2 = Math.abs(timeNow - loadedFileData.dateSaved) < precision;
    expect(responseData.saveComplete).toBeTruthy();
    expect(dateSavedPass1).toBeTruthy();
    expect(dateSavedPass2).toBeTruthy();
    expect(responseData.sceneParams.projectFolder).toEqual(projectFolder);
    expect(responseData.sceneParams.sceneId).toEqual(BASIC_SCENE1.sceneId);
    expect(loadedFileData.projectFolder).toEqual(projectFolder);
    expect(loadedFileData.sceneId).toEqual(BASIC_SCENE1.sceneId);
  });

  it('should fail when projectFolder is not specified', async () => {
    const sceneId = 'scene1';
    const data = saveSceneData({ sceneId });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(ERRORS.projectFolderParamMissing.errorCode);
    expect(data.errorMsg).toEqual(ERRORS.projectFolderParamMissing.errorMsg);
  });

  it('should fail when sceneId is not specified', async () => {
    const projectFolder = 'testProject1';
    const data = saveSceneData({ projectFolder });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(ERRORS.sceneIdParamMissing.errorCode);
    expect(data.errorMsg).toEqual(ERRORS.sceneIdParamMissing.errorMsg);
  });

  it('should fail to save a scene when projectFolder is not found', async () => {
    const projectFolder = 'nonExistingFolder';
    const sceneId = 'scene1';
    const data = saveSceneData({ projectFolder, sceneId });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(404);
    expect(data.errorMsg.startsWith('Error: Could not find project folder')).toBeTruthy();
  });
});
