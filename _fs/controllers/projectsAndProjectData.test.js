import { getError } from '../utils/errors';
import {
  loadOneProjectFile,
  loadRecentProjectsList,
  loadProjectData,
} from './projectsAndProjectData';

describe('projectsAndScenesLists controller', () => {
  it('should successfully give a list of recent project', async () => {
    const data1 = loadRecentProjectsList({ amount: 5 });
    const data2 = loadRecentProjectsList({ amount: 2 });
    expect(data1.length > 1).toBeTruthy();
    expect(data1.length < 6).toBeTruthy();
    expect(data1[0].projectFolder.length > 0).toBeTruthy();
    expect(data2.length === 2).toBeTruthy();
    expect(data2[0].projectFolder.length > 0).toBeTruthy();
    expect(data2[1].projectFolder.length > 0).toBeTruthy();
  });

  it('should successfully give a list of recent scene files', async () => {
    const data1 = loadProjectData({ amount: 5 }).scenes;
    const data2 = loadProjectData({ amount: 2 }).scenes;
    expect(data1.length > 1).toBeTruthy();
    expect(data1.length < 6).toBeTruthy();
    expect(data1[0].sceneId.length > 0).toBeTruthy();
    expect(data2.length === 2).toBeTruthy();
    expect(data2[0].sceneId.length > 0).toBeTruthy();
    expect(data2[1].sceneId.length > 0).toBeTruthy();
    expect(data2[0].projectFolder.length > 0).toBeTruthy();
    expect(data2[1].projectFolder.length > 0).toBeTruthy();
    expect(typeof data2[0].dateSaved === 'number').toBeTruthy();
    expect(typeof data2[1].dateSaved === 'number').toBeTruthy();
  });

  it('should successfully give a list of recent scene files for one project', async () => {
    const projectFolder = 'testProject1';
    const data1 = loadProjectData({ amount: 1, projectFolder }).scenes;
    const data2 = loadProjectData({ amount: Infinity, projectFolder }).scenes;
    expect(data1.length === 1).toBeTruthy();
    expect(data1[0].sceneId.length > 0).toBeTruthy();
    expect(data2.length >= 2).toBeTruthy();
    expect(data2[0].sceneId.length > 0).toBeTruthy();
    expect(data2[1].sceneId.length > 0).toBeTruthy();
    expect(data2[0].projectFolder.length > 0).toBeTruthy();
    expect(data2[1].projectFolder.length > 0).toBeTruthy();
    expect(typeof data2[0].dateSaved === 'number').toBeTruthy();
    expect(typeof data2[1].dateSaved === 'number').toBeTruthy();
  });

  it('should successfully load a project file', () => {
    const projectFolder = 'testProject1';
    const data = loadOneProjectFile(projectFolder);
    expect(data.projectFolder).toEqual(projectFolder);
    expect(data.rootScene).toEqual('scene1');
    expect(data.name).toEqual('Test project 1');
    expect(typeof data.dateSaved === 'number').toBeTruthy();
    expect(data.scenes.length > 1).toBeTruthy();
  });

  it("should fail to load a project file when it doesn't exist", () => {
    const projectFolder = 'noExistingProject';
    const error = getError('couldNotFindOrReadProjectFile');
    const data = loadOneProjectFile(projectFolder);
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(error.errorCode);
    expect(data.errorMsg).toEqual(error.errorMsg);
  });

  it('should fail to load a project file when no param was given', () => {
    const error = getError('projectFolderParamMissing');
    const data = loadOneProjectFile();
    expect(data.error).toBeTruthy();
    expect(data.errorCode).toEqual(error.errorCode);
    expect(data.errorMsg).toEqual(error.errorMsg);
  });
});
