import * as THREE from 'three';

import { selectObjects } from '../../controls/stageClick';
import { getSceneItem, setSceneItem } from '../../sceneData/sceneItems';
import worldTools from '../../utils/toolsForWorld';
import cameraTools from '../../utils/toolsForCamera';
import { getSceneParam, setSceneParam } from '../../sceneData/sceneParams';
import { saveAllCamerasState } from '../../sceneData/saveSession';

const undoRedoOperations = {
  // ID
  updateId: (action, isUndo) => {
    // action.compoId
    const iDComponents = getSceneItem('IDComponents');
    iDComponents[action.compoId].saveValue(isUndo ? action.prevVal : action.newVal, true);
    getSceneItem('rightSidePanel').updatePanel();
    getSceneItem('topTools').updateTools();
    getSceneItem('elemTool').updateTool();
  },
  // Orbit controls
  setNewCameraTransforms: (action, isUndo) => {
    cameraTools.setNewCameraTransforms(isUndo ? action.prevVal : action.newVal, action.cameraIndex);
    getSceneItem('rightSidePanel').updatePanel();
    getSceneItem('elemTool').updateTool();
  },
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
  addCamera: (action, isUndo) => {
    if (isUndo) {
      cameraTools.destroyCamera(action.newVal, true);
    } else {
      cameraTools.addCamera(action.params);
    }
  },
  updateCameraTransforms: (action, isUndo) => {
    cameraTools.updateCameraTransforms(
      action.posOrTar,
      isUndo ? action.prevVal : action.newVal,
      action.valueIndex,
      action.cameraIndex,
      false
    );
    getSceneItem('rightSidePanel').updatePanel();
  },
  updateCameraDefaultTransforms: (action, isUndo) => {
    cameraTools.updateCameraDefaultTransforms(
      action.posOrTar,
      isUndo ? action.prevVal : action.newVal,
      action.valueIndex,
      action.cameraIndex,
      false
    );
    getSceneItem('rightSidePanel').updatePanel();
  },
  toggleOrbitControls: (action, isUndo) => {
    cameraTools.toggleOrbitControls(isUndo ? action.prevVal : action.newVal, action.cameraIndex);
    getSceneItem('rightSidePanel').updatePanel();
  },
  toggleShowCameraHelper: (action, isUndo) => {
    cameraTools.toggleShowCameraHelper(isUndo ? action.prevVal : action.newVal, action.cameraIndex);
    getSceneItem('rightSidePanel').updatePanel();
  },
  resetCameraTransforms: (action, isUndo) => {
    if (isUndo) {
      cameraTools.updateCameraTransforms('position', action.prevVal.pos[0], 0, action.cameraIndex);
      cameraTools.updateCameraTransforms('position', action.prevVal.pos[1], 1, action.cameraIndex);
      cameraTools.updateCameraTransforms('position', action.prevVal.pos[2], 2, action.cameraIndex);
      cameraTools.updateCameraTransforms('target', action.prevVal.target[0], 0, action.cameraIndex);
      cameraTools.updateCameraTransforms('target', action.prevVal.target[1], 1, action.cameraIndex);
      cameraTools.updateCameraTransforms('target', action.prevVal.target[2], 2, action.cameraIndex);
      getSceneItem('rightSidePanel').updatePanel();
    } else {
      cameraTools.resetCameraTransforms(action.cameraIndex);
    }
  },
  destroyCamera: (action, isUndo) => {
    if (isUndo) {
      cameraTools.addCamera(action.prevVal);
      let cameraParams = getSceneParam('cameras');
      let cameraItems = getSceneItem('allCameras');
      let helpers = getSceneItem('cameraHelpers');
      let icons = getSceneItem('editorIcons');

      // Set the just added camera (from the end of the array) to the correct index
      cameraParams.splice(action.cameraIndex, 0, { ...cameraParams[cameraParams.length - 1] });
      cameraItems.splice(action.cameraIndex, 0, cameraItems[cameraItems.length - 1]);

      // Remove the last param of the array, because it is now a duplicate
      cameraParams.splice(cameraParams.length - 1, 1);
      cameraItems.splice(cameraItems.length - 1, 1);

      // Update cam param indexes, recreate helpers, and update icon userData
      const newHelpers = [];
      helpers.forEach((h) => {
        if (h) {
          h.dispose();
          getSceneItem('scene').remove(h);
        }
      });
      cameraParams = cameraParams.map((c, i) => {
        c.index = i;
        const icon = icons.find((icon) => icon.cameraIcon.userData.id === c.id);
        if (icon) {
          icon.cameraIcon.userData = c;
          icon.iconMesh.userData = c;
        }
        if (i === getSceneItem('curCameraIndex')) {
          newHelpers.push(null);
        } else {
          const h = new THREE.CameraHelper(cameraItems[i]);
          h.userData = c;
          newHelpers.push(h);
          h.update();
          h.visible = c.showHelper;
          getSceneItem('scene').add(h);
        }
        return c;
      });
      setSceneParam('cameras', cameraParams);
      setSceneItem('cameraHelpers', newHelpers);
      setSceneItem('editorIcons', icons);
      saveAllCamerasState(cameraParams);
      getSceneItem('topTools').updateTools();
      getSceneItem('rightSidePanel').updatePanel();
      if (action.cameraIndex <= getSceneParam('curCameraIndex')) {
        cameraTools.changeCurCamera(action.cameraIndex + 1);
      } else {
        cameraTools.changeCurCamera(getSceneParam('curCameraIndex'));
      }
    } else {
      cameraTools.destroyCamera(action.cameraIndex, true);
    }
  },
};

export default undoRedoOperations;
