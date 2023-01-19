import { BASIC_SCENE1 } from '../test/initTestData';
import { getProjectFolderPath } from '../utils/config';
import { getError } from '../utils/errors';
import { createProject } from './createProject';

describe('createProject controller', () => {
  it('should successfully create a project and scene', async () => {
    const projectFolder = 'newProject1';
    const sceneId = 'scene1';
    const response = createProject({
      projectFolder,
      name: 'My new project',
      sceneId,
      sceneName: 'My main scene',
      sceneParams: BASIC_SCENE1,
    });
    expect(response.projectCreated).toBeTruthy();
    expect(response.projectFolder).toEqual('newProject1');
    expect(response.sceneId).toEqual('scene1');
  });

  it('should return an error when the project folder already exists', async () => {
    const projectFolder = 'newProject1';
    const sceneId = 'scene1';
    const response = createProject({
      projectFolder,
      name: 'My new project',
      sceneId,
      sceneName: 'My main scene',
      sceneParams: BASIC_SCENE1,
    });
    const folderPath = getProjectFolderPath(projectFolder);
    const error = getError('projectFolderAlreadyExists', { path: folderPath, projectFolder });
    expect(response.error).toBeTruthy();
    expect(response.errorCode).toEqual(error.errorCode);
    expect(response.errorMsg).toEqual(error.errorMsg);
  });
});
