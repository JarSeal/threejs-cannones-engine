import { selectObjects } from '../../controls/stageClick';
import { getSceneItem } from '../../sceneData/sceneItems';
import worldTools from '../../utils/toolsForWorld';

const undoRedoOperations = {
  selection: (action, isUndo) => {
    selectObjects(isUndo ? action.prevVal : action.newVal);
  },
  toggleWorldAxesHelper: () => {
    worldTools.toggleWorldAxesHelper();
    getSceneItem('rightSidePanel').updatePanel();
  },
  toggleWorldGridHelper: () => {
    worldTools.toggleWorldGridHelper();
    getSceneItem('rightSidePanel').updatePanel();
  },
  setWorldGridHelperSize: (action, isUndo) => {
    worldTools.setWorldGridHelperSize(isUndo ? action.prevVal : action.newVal);
    getSceneItem('rightSidePanel').updatePanel();
  },
  changeWorldBackgroundColor: (action, isUndo) => {
    worldTools.changeWorldBackgroundColor(isUndo ? action.prevVal : action.newVal);
    getSceneItem('rightSidePanel').updatePanel();
  },
  toggleWorldAmbientLight: () => {
    worldTools.toggleWorldAmbientLight();
    getSceneItem('rightSidePanel').updatePanel();
  },
  changeWorldAmbientColor: (action, isUndo) => {
    worldTools.changeWorldAmbientColor(isUndo ? action.prevVal : action.newVal);
    getSceneItem('rightSidePanel').updatePanel();
  },
  changeWorldAmbientIntensity: (action, isUndo) => {
    worldTools.changeWorldAmbientIntensity(isUndo ? action.prevVal : action.newVal);
    getSceneItem('rightSidePanel').updatePanel();
  },
  toggleWorldHemiLight: () => {
    worldTools.toggleWorldHemiLight();
    getSceneItem('rightSidePanel').updatePanel();
  },
  changeWorldHemiColors: (action, isUndo) => {
    worldTools.changeWorldHemiColors(isUndo ? action.prevVal : action.newVal, action.topOrBottom);
    getSceneItem('rightSidePanel').updatePanel();
  },
  changeWorldHemiIntensity: (action, isUndo) => {
    worldTools.changeWorldHemiIntensity(isUndo ? action.prevVal : action.newVal);
    getSceneItem('rightSidePanel').updatePanel();
  },
};

export default undoRedoOperations;
