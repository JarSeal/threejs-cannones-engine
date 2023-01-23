import { BASIC_SCENE1 } from '../test/initTestData';
import { getError } from '../utils/errors';
import { createNewScene } from './createScene';
import { loadSceneData } from './loadScene';

describe('createScene controller', () => {
  it('should successfully create a scene', async () => {
    const projectFolder = 'testProject1';
    const sceneId = 'newly-created-scene';
    const data = createNewScene({
      projectFolder,
      sceneId,
      sceneParams: { ...BASIC_SCENE1, name: 'MY NEW SCENE', sceneId },
    });
    expect(data.createComplete).toBeTruthy();
    expect(data.sceneParams.sceneId).toEqual(sceneId);
    expect(data.sceneParams.name).toEqual('MY NEW SCENE');
    const loadedData = loadSceneData({ projectFolder, sceneId });
    expect(loadedData.sceneId).toEqual(sceneId);
    expect(loadedData.name).toEqual('MY NEW SCENE');
  });

  it('should fail to create a scene when no projectFolder param was given', () => {
    const sceneId = 'scene-521';
    const error = getError('projectFolderParamMissing');
    const data = createNewScene({ sceneId, sceneParams: {} });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(error.errorCode);
    expect(data.errorMsg).toEqual(error.errorMsg);
  });

  it('should fail to create a scene when no sceneId param was given', () => {
    const projectFolder = 'testProject1';
    const error = getError('sceneIdParamMissing');
    const data = createNewScene({ projectFolder, sceneParams: {} });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(error.errorCode);
    expect(data.errorMsg).toEqual(error.errorMsg);
  });

  it('should fail to create a scene when projectFolder does not exist', () => {
    const projectFolder = 'nonExistingProject';
    const sceneId = 'scene-521';
    const error = getError('couldNotFindOrReadProjectFile');
    const data = createNewScene({ projectFolder, sceneId, sceneParams: {} });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(error.errorCode);
    expect(data.errorMsg).toEqual(error.errorMsg);
  });

  it('should fail to create a scene when the scene file already exists', () => {
    const projectFolder = 'testProject1';
    const sceneId = 'scene1';
    const error = getError('sceneFileAlreadyExists');
    const data = createNewScene({ projectFolder, sceneId, sceneParams: {} });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(error.errorCode);
    expect(data.errorMsg).toEqual(error.errorMsg);
  });
});
