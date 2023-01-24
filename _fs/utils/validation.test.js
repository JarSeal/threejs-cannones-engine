import {
  validateProjectFolder,
  validateProjectFolderAndSceneId,
  validateSceneId,
} from './validation';

describe('validation tests', () => {
  it('should validate projectFolder and sceneId successfully', () => {
    const projectFolder = 'testProject1';
    const sceneId = 'scene1';
    const validation = validateProjectFolderAndSceneId({ projectFolder, sceneId });
    const validation2 = validateProjectFolderAndSceneId({
      projectFolder,
      sceneId,
      checkExistence: true,
    });
    expect(validation.error).toBeFalsy();
    expect(validation2.error).toBeFalsy();
  });

  it('should validate projectFolder and sceneId unsuccessfully', () => {
    const projectFolder = 'testProject153';
    const sceneId = 'scene1';
    const validation = validateProjectFolderAndSceneId({ projectFolder, sceneId });
    const validation2 = validateProjectFolderAndSceneId({
      projectFolder,
      sceneId,
      checkExistence: true,
    });
    const validation3 = validateProjectFolderAndSceneId({
      projectFolder: 'jf$fdsuij@',
      sceneId: 'jkfa$"',
    });
    const validation4 = validateProjectFolderAndSceneId({ projectFolder, sceneId: 'jkfa$"' });
    expect(validation.error).toBeFalsy();
    expect(validation2.error).toBeTruthy();
    expect(validation2.errorCode).toEqual(404);
    expect(validation3.error).toBeTruthy();
    expect(validation4.error).toBeTruthy();
  });

  it('should validate projectFolder successfully', () => {
    const projectFolder = 'testProject1';
    const validation = validateProjectFolder(projectFolder);
    expect(validation.error).toBeFalsy();
  });

  it('should validate projectFolder unsuccessfully', () => {
    const projectFolder = 'testProject1$4#@';
    const validation = validateProjectFolder(projectFolder);
    const validation2 = validateProjectFolder();
    expect(validation.error).toBeTruthy();
    expect(validation2.error).toBeTruthy();
  });

  it('should validate sceneId successfully', () => {
    const sceneId = 'scene1';
    const validation = validateSceneId(sceneId);
    expect(validation.error).toBeFalsy();
  });

  it('should validate sceneId unsuccessfully', () => {
    const sceneId = 'scene1$4#@';
    const validation = validateSceneId(sceneId);
    const validation2 = validateSceneId();
    expect(validation.error).toBeTruthy();
    expect(validation2.error).toBeTruthy();
  });
});
