import * as THREE from 'three';

import { Component } from '../../LIGHTER';
import { createOrbitControls, removeOrbitControls } from '../controls/orbitControls';
import { saveSceneState } from '../sceneData/saveSession';
import { getSceneItem, setSceneItem } from '../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../sceneData/sceneParams';
import { printName } from '../utils/utils';
import Button from './common/Button';
import Dropdown from './common/form/Dropdown';
import NewCamera from './dialogs/NewCamera';
import SvgIcon from './icons/svg-icon';
import styles from './TopTools.module.scss';

class TopTools extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.topTools];
  }

  paint = () => {
    this._mainButtons();
    // this._cameraSelector();
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

  _mainButtons = () => {
    const buttonWrapperId = this.id + '-main-buttons-wrapper';
    const buttons = [
      {
        type: 'menu',
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-add-menu',
            class: ['menuButton'],
            onClick: () => console.log('CLICK ADD'),
            icon: new SvgIcon({ id: this.id + '-add-icon', icon: 'plus', width: 18 }),
          })
        ),
        options: [
          {
            icon: new SvgIcon({ id: this.id + '-add-camera-icon', icon: 'camera', width: 18 }),
            text: 'Add Camera',
            onClick: () => this._newCameraDialog(),
          },
          {
            icon: new SvgIcon({ id: this.id + '-add-camera-icon', icon: 'camera', width: 18 }),
            text: 'Add Something else',
            onClick: () => console.log('Add sumelse click'),
          },
        ],
      },
      {
        type: 'cameraSelector',
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-change-cam-menu',
            class: ['menuButton', 'camSelector'],
            icon: new SvgIcon({ id: this.id + '-change-cam-icon', icon: 'camera', width: 18 }),
          })
        ),
      },
    ];
    this.addChildDraw({
      id: buttonWrapperId,
      class: ['floatingUIButtons', 'mainButtons'],
    });
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (button.type === 'menu') {
        button.btn.draw({ attach: buttonWrapperId });
        if (button.options && Array.isArray(button.options)) {
          const buttonMenu = button.btn.addChildDraw({
            id: button.btn.data.id + '-menu-wrapper',
            class: ['menuWrapper'],
          });
          for (let j = 0; j < button.options.length; j++) {
            buttonMenu.addChildDraw(
              new Button({
                ...button.options[j],
                id: button.btn.data.id + '-option-' + j,
                class: button.options[j].icon ? ['hasIcon'] : [],
              })
            );
          }
        }
      } else if (button.type === 'cameraSelector') {
        const cams = getSceneParam('cameras');
        button.btn.draw({
          attach: buttonWrapperId,
          appendHtml: `<span class="curCamName">
            ${printName(cams[getSceneParam('curCameraIndex')])}
          </span>`,
        });
        const buttonMenu = button.btn.addChildDraw({
          id: button.btn.data.id + '-menu-wrapper',
          class: ['menuWrapper'],
        });
        for (let j = 0; j < cams.length; j++) {
          buttonMenu.addChildDraw(
            new Button({
              id: button.btn.data.id + '-cameras-' + j,
              class: getSceneParam('curCameraIndex') === j ? 'current' : [],
              text: printName(cams[j]),
              onClick: () => {
                this.changeCurCamera(j);
                this.reDrawSelf();
              },
            })
          );
        }
      }
    }
  };

  _newCameraDialog = () => {
    getSceneItem('dialog').appear({
      component: NewCamera,
      title: 'Add new camera',
    });
  };

  changeCurCamera = (newCamIndex) => {
    // Move changing camera logic here and use it in the UICamera rightSidePanel
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
      if (camParams[i].id === camParams[newCamIndex].id) {
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
  };
}

export default TopTools;
