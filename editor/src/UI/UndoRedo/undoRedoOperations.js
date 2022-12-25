import { selectObjects } from '../../controls/stageClick';
import { getSceneItem } from '../../sceneData/sceneItems';
import worldTools from '../../utils/toolsForWorld';
import cameraTools from '../../utils/toolsForCamera';

const undoRedoOperations = {
  // Selection
  selection: (action, isUndo) => {
    selectObjects(isUndo ? action.prevVal : action.newVal);
  },
  // World
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
  // Cameras
  updateCameraProperty: (action, isUndo) => {
    cameraTools.updateCameraProperty(
      isUndo ? action.prevVal : action.newVal,
      action.index,
      action.key
    );
    getSceneItem('rightSidePanel').updatePanel();
  },
  updateCameraTransforms: (action, isUndo) => {
    cameraTools.updateCameraTransforms(
      action.key,
      isUndo ? action.prevVal[action.valueIndex] : action.newVal[action.valueIndex],
      action.valueIndex,
      action.index,
      false
    );
    getSceneItem('rightSidePanel').updatePanel();
  },
};

export default undoRedoOperations;
