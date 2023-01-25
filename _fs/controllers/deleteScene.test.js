import { deleteScene } from './deleteScene';
import { loadSceneData } from './loadScene';

describe('deleteScene controller', () => {
  it('should successfully delete a scene', async () => {
    const projectFolder = 'deleteTestProject1';
    const sceneId = 'deleteScene1';
    const response = deleteScene({ projectFolder, sceneId });
    expect(response.sceneDeleted).toBeTruthy();
    expect(response.projectFolder).toEqual(projectFolder);
    expect(response.sceneId).toEqual(sceneId);

    const data = loadSceneData({ projectFolder, sceneId });
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(404);
  });

  it('should fail when projectFolder is not found', async () => {
    const projectFolder = 'nonExistingProject';
    const sceneId = 'deleteScene1';
    const response = deleteScene({ projectFolder, sceneId });
    expect(response.error).toBeTruthy();
    expect(response.errorCode).toEqual(404);
  });

  it('should fail when projectFolder is not valid', async () => {
    const projectFolder = 'fsajk@$!hjfd';
    const sceneId = 'deleteScene1';
    const response = deleteScene({ projectFolder, sceneId });
    expect(response.error).toBeTruthy();
    expect(response.errorCode).toEqual(400);
  });

  it('should fail when sceneId is not valid', async () => {
    const projectFolder = 'deleteTestProject1';
    const sceneId = 'fsajk@$!hjfd';
    const response = deleteScene({ projectFolder, sceneId });
    expect(response.error).toBeTruthy();
    expect(response.errorCode).toEqual(400);
  });

  it('should fail when sceneId is not found', async () => {
    const projectFolder = 'deleteTestProject1';
    const sceneId = 'nonExistingSceneId';
    const response = deleteScene({ projectFolder, sceneId });
    expect(response.error).toBeTruthy();
    expect(response.errorCode).toEqual(404);
  });
});
