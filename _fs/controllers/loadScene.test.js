import ERRORS from '../utils/errors';
import { loadSceneData } from './loadScene';

describe('loadScene controller', () => {
  it('should successfully load and return a scene', async () => {
    const projectFolder = 'testProject1';
    const sceneId = 'scene1';
    const data = loadSceneData({ projectFolder, sceneId });
    expect(data.projectFolder).toEqual(projectFolder);
    expect(data.sceneId).toEqual(sceneId);
    expect(data.name).toEqual('Test scene 1');
    expect(data.dateCreated).toEqual(1663229534337);
    expect(data.lights).toHaveLength(2);
    expect(data.cameras).toHaveLength(2);
    expect(data.elements).toHaveLength(3);
  });

  it('should fail when projectFolder is not specified', async () => {
    const sceneId = 'scene1';
    const data = loadSceneData({ sceneId });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(ERRORS.projectFolderParamMissing.errorCode);
    expect(data.errorMsg).toEqual(ERRORS.projectFolderParamMissing.errorMsg);
  });

  it('should fail when sceneId is not specified', async () => {
    const projectFolder = 'testProject1';
    const data = loadSceneData({ projectFolder });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(ERRORS.sceneIdParamMissing.errorCode);
    expect(data.errorMsg).toEqual(ERRORS.sceneIdParamMissing.errorMsg);
  });

  it('should fail to load a scene when projectFolder is not found', async () => {
    const projectFolder = 'nonExistingFolder';
    const sceneId = 'scene1';
    const data = loadSceneData({ projectFolder, sceneId });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(404);
    expect(data.errorMsg.startsWith('Error: Could not find project folder')).toBeTruthy();
  });

  it('should fail to load a scene when scene file is not found', async () => {
    const projectFolder = 'testProject1';
    const sceneId = 'nonExistingSceneId';
    const data = loadSceneData({ projectFolder, sceneId });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(404);
    expect(data.errorMsg.startsWith('Error: Could not find scene file')).toBeTruthy();
  });
});
