import * as THREE from 'three';

import { Component } from '../../LIGHTER';
import { createOrbitControls, removeOrbitControls } from '../controls/orbitControls';
import { saveSceneState } from '../sceneData/saveSession';
import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import Dropdown from './common/form/Dropdown';
import NewCamera from './dialogs/NewCamera';
import styles from './TopTools.module.scss';

class TopTools extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.topTools];
  }

  paint = () => {
    this._addDropDown();
    this._cameraSelector();
  };

  _cameraSelector = () => {
    const cameraParams = getSceneParam('cameras');
    const curIndex = getSceneParam('curCameraIndex');
    const cameraSelector = this.addChildDraw(
      new Dropdown({
        id: 'camera-selector',
        label: 'cam:',
        value: cameraParams[curIndex].id,
        options: cameraParams.map((c) => ({ value: c.id, label: c.name || c.id })),
        changeFn: (e) => {
          const camItems = getSceneItem('allCameras');
          const camHelpers = getSceneItem('cameraHelpers');
          const camParams = getSceneParam('cameras');
          const camPanels = getSceneItem('cameraPanels');
          let newCamera = null,
            newCameraIndex = 0,
            newCameraHasOrbitControls = false,
            helpers = [];
          const scene = getSceneItem('scene');
          for (let i = 0; i < camItems.length; i++) {
            if (camHelpers && camHelpers.length && camHelpers[i]) {
              camHelpers[i].dispose();
              scene.remove(camHelpers[i]);
            }
            if (camPanels && camPanels[i] && camPanels[i].elem)
              camPanels[i].elem.classList.remove('highlight');
            if (camParams[i].id === e.target.value) {
              newCamera = camItems[i];
              newCameraIndex = i;
              newCameraHasOrbitControls = camParams[i].orbitControls;
              helpers.push(null);
              if (camPanels && camPanels[i] && camPanels[i].elem)
                camPanels[i].elem.classList.add('highlight');
            } else {
              const helper = new THREE.CameraHelper(camItems[i]);
              helpers.push(helper);
              helper.update();
              helper.visible = camParams[i].showHelper;
              scene.add(helper);
            }
          }
          removeOrbitControls();
          setSceneParam('curCameraIndex', newCameraIndex);
          saveSceneState();
          setSceneItem('curCamera', newCamera);
          setSceneItem('cameraHelpers', helpers);
          newCamera.updateProjectionMatrix();
          if (newCameraHasOrbitControls) createOrbitControls();

          const rightPanel = getSceneItem('rightSidePanel');
          if (rightPanel.tabId === 'UICamera') rightPanel.updatePanel();
        },
      })
    );
    setSceneItem('cameraSelectorTool', cameraSelector);
  };

  _addDropDown = () => {
    this.addChildDraw(
      new Dropdown({
        id: 'add-to-scene',
        label: '',
        value: 'add',
        options: [
          { value: 'add', label: '[Add]' },
          { value: 'camera', label: 'Camera' },
        ],
        changeFn: (e, self) => {
          self.setValue('add', true);
          e.target.blur();
          this._newCameraDialog();
        },
      })
    );
  };

  _newCameraDialog = () => {
    getSceneItem('dialog').appear({
      component: NewCamera,
      title: 'Add new camera',
    });
  };
}

export default TopTools;
