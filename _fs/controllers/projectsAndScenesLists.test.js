import { loadRecentProjectsList, loadRecentScenesList } from './projectsAndScenesLists';

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
    const data1 = loadRecentScenesList({ amount: 5 }).scenes;
    const data2 = loadRecentScenesList({ amount: 2 }).scenes;
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
});
