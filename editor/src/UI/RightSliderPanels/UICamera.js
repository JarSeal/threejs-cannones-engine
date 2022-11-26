import * as THREE from 'three';

import { Component } from '../../../LIGHTER';
import { getSceneParam, setSceneParam } from '../../sceneData/sceneParams';
import SettingsPanel from '../common/SettingsPanel';
import NumberInput from '../common/form/NumberInput';
import { saveAllCamerasState, saveCameraState, saveSceneState } from '../../sceneData/saveSession';
import { getSceneItem, setSceneItem } from '../../sceneData/sceneItems';
import InfoField from '../common/form/InfoField';
import Checkbox from '../common/form/Checbox';
import { createOrbitControls, removeOrbitControls } from '../../controls/orbitControls';
import ActionButtons from '../common/form/ActionButtons';
import VectorInput from '../common/form/VectorInput';
import ConfirmationDialog from '../dialogs/Confirmation';
import TextInput from '../common/form/TextInput';
import SimpleIDInput from '../common/form/SimpleIDInput';
import { getScreenResolution } from '../../utils/utils';
import SvgIcon from '../icons/svg-icon';
import Button from '../common/Button';
import NewCamera from '../dialogs/NewCamera';

class UICamera extends Component {
  constructor(data) {
    super(data);
    this.updatePanel = data.updatePanel;
  }

  paint = () => {
    this.addChildDraw({
      id: 'panel-title-' + this.id,
      text: 'Cameras',
      tag: 'h3',
      class: 'panelTitle',
    });
    this.addChildDraw(
      new SvgIcon({
        id: this.id + '-main-icon',
        icon: 'camera',
        width: 22,
        class: 'mainTabIcon',
      })
    );
    const actionButtonsWrapperId = this.id + '-actions-wrapper';
    this.addChildDraw(new Component({ id: actionButtonsWrapperId, class: 'panelActionButtons' }));
    this.addChildDraw(
      new Button({
        id: this.id + '-add-new-camera-action',
        onClick: () =>
          getSceneItem('dialog').appear({
            component: NewCamera,
            title: 'Add new camera',
          }),
        class: 'panelActionButton',
        attach: actionButtonsWrapperId,
        icon: new SvgIcon({ id: this.id + '-plus-icon', icon: 'plus', width: 16 }),
      })
    );
    this._cameras();
  };

  _cameras = () => {
    const cams = getSceneParam('cameras');
    const camPanels = [];
    cams.forEach((c) => {
      // Camera panel
      const contentId = 'panel-cameras-content-' + c.index + '-' + this.id;
      camPanels.push(
        this.addChildDraw(
          new SettingsPanel({
            id: 'panel-cameras-' + c.id + '-' + this.id,
            title: c.name || c.id,
            contentId: contentId,
            class: getSceneParam('curCameraIndex') === c.index ? 'highlight' : null,
          })
        )
      );

      // ID
      this.addChildDraw(
        new SimpleIDInput({
          id: 'camId-' + c.id + '-' + this.id,
          label: 'ID:',
          attach: contentId,
          curId: c.id,
        })
      );

      // Name
      this.addChildDraw(
        new TextInput({
          id: 'cam-name' + c.id + '-' + this.id,
          label: 'Name:',
          attach: contentId,
          value: c.name,
          onBlur: (e) => {
            const value = e.target.value;
            this._updateCameraProperty(value, c.index, 'name');
            camPanels[c.index].updateTitle(value || c.id);
          },
        })
      );

      // Type
      this.addChildDraw(
        new InfoField({
          id: 'infoType-' + c.id + '-' + this.id,
          label: 'Type',
          content: c.type,
          attach: contentId,
        })
      );

      // Field of view (FOV)
      if (c.type === 'perspective') {
        this.addChildDraw(
          new NumberInput({
            id: 'fov-' + c.id + '-' + this.id,
            attach: contentId,
            label: 'Field of view',
            step: 1,
            min: 1,
            value: c.fov,
            changeFn: (e) => {
              const value = parseInt(e.target.value);
              this._updateCameraProperty(value, c.index, 'fov');
            },
          })
        );
      } else if (c.type === 'orthographic') {
        this.addChildDraw(
          new NumberInput({
            id: 'view-size-' + c.id + '-' + this.id,
            attach: contentId,
            label: 'View size',
            step: 0.01,
            min: 0.00001,
            value: c.orthoViewSize,
            changeFn: (e) => {
              const value = parseInt(e.target.value);
              this._updateCameraProperty(value, c.index, 'orthoViewSize');
            },
          })
        );
      }

      // Frustum near plane
      this.addChildDraw(
        new NumberInput({
          id: 'near-' + c.id + '-' + this.id,
          attach: contentId,
          label: 'Frustum near plane',
          step: 0.001,
          min: 0.001,
          value: c.near,
          changeFn: (e) => {
            const value = parseFloat(e.target.value);
            this._updateCameraProperty(value, c.index, 'near');
          },
        })
      );

      // Frustum far plane
      this.addChildDraw(
        new NumberInput({
          id: 'far-' + c.id + '-' + this.id,
          attach: contentId,
          label: 'Frustum far plane',
          step: 0.001,
          min: 0.001,
          value: c.far,
          changeFn: (e) => {
            const value = parseFloat(e.target.value);
            this._updateCameraProperty(value, c.index, 'far');
          },
        })
      );

      // Transforms
      const transformsId = 'panel-cam-transforms-content-' + c.index + '-' + this.id;
      this.addChildDraw(
        new SettingsPanel({
          id: 'panel-cam-transforms-' + c.id + '-' + this.id,
          title: 'Transforms',
          contentId: transformsId,
          attach: contentId,
          showPanel: false,
        })
      );

      // Position
      this.addChildDraw(
        new VectorInput({
          id: 'cam-pos-' + c.id + '-' + this.id,
          attach: transformsId,
          label: 'Position',
          step: 0.5,
          inputLabels: ['x', 'y', 'z'],
          values: c.position,
          onChange: (e, index) => {
            const cam = getSceneItem('allCameras')[c.index];
            const curPos = getSceneParam('cameras')[c.index].position;
            const curTarget = getSceneParam('cameras')[c.index].target;
            const curQuat = cam.quaternion;
            curPos[index] = parseFloat(e.target.value);
            this._updateCameraProperty(curPos, c.index, 'position');
            this._updateCameraProperty(curTarget, c.index, 'target');
            this._updateCameraProperty(
              [curQuat.x, curQuat.y, curQuat.z, curQuat.w],
              c.index,
              'quaternion'
            );
            rotationComponent.setValues([cam.rotation.x, cam.rotation.y, cam.rotation.z], true);
            const editorIcons = getSceneItem('editorIcons');
            editorIcons[c.index].update(cam);
          },
        })
      );

      // Target
      const targetComponent = this.addChildDraw(
        new VectorInput({
          id: 'cam-target-' + c.id + '-' + this.id,
          attach: transformsId,
          label: 'Target',
          step: 0.5,
          inputLabels: ['x', 'y', 'z'],
          values: c.target,
          onChange: (e, index) => {
            const cam = getSceneItem('allCameras')[c.index];
            const curPos = getSceneParam('cameras')[c.index].position;
            const curTarget = getSceneParam('cameras')[c.index].target;
            const curQuat = cam.quaternion;
            curTarget[index] = parseFloat(e.target.value);
            this._updateCameraProperty(curPos, c.index, 'position');
            this._updateCameraProperty(curTarget, c.index, 'target');
            this._updateCameraProperty(
              [curQuat.x, curQuat.y, curQuat.z, curQuat.w],
              c.index,
              'quaternion'
            );
            if (c.index === getSceneParam('curCameraIndex')) {
              getSceneItem('orbitControls').target = new THREE.Vector3(...curTarget);
            }
            rotationComponent.setValues([cam.rotation.x, cam.rotation.y, cam.rotation.z], true);
            const editorIcons = getSceneItem('editorIcons');
            editorIcons[c.index].update(cam);
          },
        })
      );

      // Rotation
      const rot = getSceneItem('allCameras')[c.index].rotation;
      const rotationComponent = this.addChildDraw(
        new VectorInput({
          id: 'cam-rot-' + c.id + '-' + this.id,
          attach: transformsId,
          label: 'Rotation (rad)',
          inputLabels: ['x', 'y', 'z'],
          step: Math.PI / 16,
          values: [rot.x, rot.y, rot.z],
          onChange: (e, index) => {
            const cam = getSceneItem('allCameras')[c.index];
            const rotationA = [cam.rotation.x, cam.rotation.y, cam.rotation.z];
            rotationA[index] = parseFloat(e.target.value);

            // 1. Get the length from camera position to target position
            const targetDistance = cam.position.distanceTo(new THREE.Vector3(...c.target));

            cam.rotation.set(...rotationA);
            cam.updateProjectionMatrix();
            const curQuats = [
              cam.quaternion.x,
              cam.quaternion.y,
              cam.quaternion.z,
              cam.quaternion.w,
            ];
            this._updateCameraProperty(curQuats, c.index, 'quaternion');

            // 2. Find the position at the end of this distance
            const newTarget = new THREE.Vector3();
            const camDirection = cam.getWorldDirection(new THREE.Vector3());
            newTarget.addVectors(cam.position, camDirection.multiplyScalar(targetDistance));
            const newTargetA = [newTarget.x, newTarget.y, newTarget.z];
            targetComponent.setValues(newTargetA, true);
            this._updateCameraProperty(newTargetA, c.index, 'target');
            if (c.index === getSceneParam('curCameraIndex')) {
              getSceneItem('orbitControls').target = newTarget;
            }
            const editorIcons = getSceneItem('editorIcons');
            editorIcons[c.index].update(cam);
          },
        })
      );

      // Transforms (DEFAULTS)
      const defaultTransformsId = 'panel-cam-default-transforms-content-' + c.index + '-' + this.id;
      this.addChildDraw(
        new SettingsPanel({
          id: 'panel-cam-default-transforms-' + c.id + '-' + this.id,
          title: 'Default transforms',
          contentId: defaultTransformsId,
          attach: contentId,
          showPanel: false,
        })
      );

      // Default Position
      this.addChildDraw(
        new VectorInput({
          id: 'cam-default-pos-' + c.id + '-' + this.id,
          attach: defaultTransformsId,
          label: 'Position',
          step: 0.5,
          inputLabels: ['x', 'y', 'z'],
          values: c.defaultPosition || c.position || [5, 5, 5],
          onChange: (e, index) => {
            const cameraParams = getSceneParam('cameras');
            if (!cameraParams[c.index].defaultPosition)
              cameraParams[c.index].defaultPosition = [5, 5, 5];
            cameraParams[c.index].defaultPosition[index] = parseFloat(e.target.value);
            setSceneParam('cameras', cameraParams);
            saveAllCamerasState(cameraParams);
          },
        })
      );

      // Default Target
      this.addChildDraw(
        new VectorInput({
          id: 'cam-default-target-' + c.id + '-' + this.id,
          attach: defaultTransformsId,
          label: 'Target',
          step: 0.5,
          inputLabels: ['x', 'y', 'z'],
          values: c.defaultTarget || c.target || [0, 0, 0],
          onChange: (e, index) => {
            const cameraParams = getSceneParam('cameras');
            if (!cameraParams[c.index].defaultTarget)
              cameraParams[c.index].defaultTarget = [0, 0, 0];
            cameraParams[c.index].defaultTarget[index] = parseFloat(e.target.value);
            setSceneParam('cameras', cameraParams);
            saveAllCamerasState(cameraParams);
          },
        })
      );

      // Orbit controls
      this.addChildDraw(
        new Checkbox({
          id: 'orbitControls-' + c.id + '-' + this.id,
          attach: contentId,
          label: 'Orbit controls',
          changeFn: (e) => {
            const isTurnedOn = e.target.checked;
            this._updateCameraProperty(isTurnedOn, c.index, 'orbitControls');
            if (isTurnedOn) {
              if (c.index === getSceneParam('curCameraIndex')) createOrbitControls();
            } else {
              if (c.index === getSceneParam('curCameraIndex')) removeOrbitControls();
            }
          },
          value: c.orbitControls,
        })
      );

      // Show helper
      this.addChildDraw(
        new Checkbox({
          id: 'showHelper-' + c.id + '-' + this.id,
          attach: contentId,
          label: 'Show helper',
          changeFn: (e) => {
            const isTurnedOn = e.target.checked;
            if (c.index !== getSceneParam('curCameraIndex')) {
              const helpers = getSceneItem('cameraHelpers');
              if (helpers && helpers.length && helpers[c.index]) {
                helpers[c.index].visible = isTurnedOn;
              }
            }
            const cameraParams = getSceneParam('cameras');
            cameraParams[c.index].showHelper = isTurnedOn;
            setSceneParam('cameras', cameraParams);
            saveCameraState({ index: c.index, showHelper: isTurnedOn });
          },
          value: c.showHelper || false,
        })
      );

      // Action buttons
      const buttons = [
        {
          id: 'reset-cam-' + c.id + '-' + this.id,
          text: 'Reset position',
          onClick: () => {
            if (c.index === getSceneParam('curCameraIndex')) {
              removeOrbitControls();
              createOrbitControls();
            }
            const pos = c.defaultPosition || [5, 5, 5];
            this._updateCameraProperty(pos, c.index, 'position');
            const target = c.defaultTarget || [0, 0, 0];
            this._updateCameraProperty(target, c.index, 'target');
            this._updateCameraProperty(target, c.index, 'target'); // Needs to be called twice in order to make the cam helper place correctly as well
            if (c.index === getSceneParam('curCameraIndex')) {
              const controls = getSceneItem('orbitControls');
              if (controls) controls.target = new THREE.Vector3(...target);
            }
            this.rePaint();
            const editorIcons = getSceneItem('editorIcons');
            editorIcons[c.index].update(getSceneItem('allCameras')[c.index]);
          },
        },
        {
          id: 'use-this-cam-' + c.id + '-' + this.id,
          text: 'Use this camera',
          onClick: () => {
            if (c.index === getSceneParam('curCameraIndex')) return;
            const cameraSelector = getSceneItem('cameraSelectorTool');
            cameraSelector.setValue(c.id);
          },
        },
        {
          id: 'delete-cam-' + c.id + '-' + this.id,
          text: 'Destroy!',
          class: 'delete-button',
          onClick: () => {
            const destoryCamera = () => {
              const cameraItems = getSceneItem('allCameras');
              if (cameraItems.length <= 1) return;
              const index = c.index;
              const cameraParams = getSceneParam('cameras')
                .filter((cam) => cam.id !== c.id)
                .map((c, i) => {
                  c.index = i;
                  return c;
                });
              setSceneParam('cameras', cameraParams);
              const selection = getSceneParam('selection');
              for (let i = 0; i < selection.length; i++) {
                if (selection[i].userData.id === cameraItems[index].userData.id) {
                  const filteredSelection = selection.filter(
                    (sel) => sel.userData.id !== cameraItems[index].userData.id
                  );
                  setSceneParam('selection', filteredSelection);
                  saveSceneState({ selection: filteredSelection.map((sel) => sel.userData.id) });
                  break;
                }
              }
              cameraItems[index].clear();
              cameraItems[index].removeFromParent();
              setSceneItem(
                'allCameras',
                cameraItems.filter((c, i) => i !== index)
              );
              const helpers = getSceneItem('cameraHelpers');
              if (helpers[c.index]) {
                getSceneItem('scene').remove(helpers[c.index]);
                setSceneItem(
                  'cameraHelpers',
                  helpers.filter((c, i) => i !== index)
                );
              }
              saveCameraState({ removeIndex: index });
              const cameraSelector = getSceneItem('cameraSelectorTool');
              if (c.index === getSceneParam('curCameraIndex')) {
                cameraSelector.setValue(cameraParams[0].id);
                setSceneParam('curCameraIndex', 0);
              }
              cameraSelector.setOptions(
                cameraParams.map((c) => ({ value: c.id, label: c.name || c.id })),
                c.id
              );
              const editorIcons = getSceneItem('editorIcons');
              editorIcons[c.index].remove(c.index);
              this.updatePanel();
            };
            const cameraTextToDestroy = c.name ? `${c.name} (${c.id})` : c.id;
            getSceneItem('dialog').appear({
              component: ConfirmationDialog,
              componentData: {
                id: 'delete-cam-conf-dialog-' + c.id + '-' + this.id,
                message: 'Are you sure you want remove this camera: ' + cameraTextToDestroy + '?',
                confirmButtonFn: () => {
                  destoryCamera();
                  getSceneItem('dialog').disappear();
                },
              },
              title: 'Are you sure?',
            });
          },
        },
      ];
      this.addChildDraw(
        new ActionButtons({ id: 'actions-' + c.id + '-' + this.id, attach: contentId, buttons })
      );
    });
    setSceneItem('cameraPanels', camPanels);
  };

  _updateCameraProperty = (value, i, key) => {
    const newCamParams = getSceneParam('cameras').map((cam, index) => {
      if (index === i) return { ...cam, [key]: value };
      return cam;
    });
    const cam = getSceneItem('allCameras')[i];
    if (key === 'position' || key === 'quaternion') {
      cam[key].set(...value);
    } else if (key === 'target') {
      cam.lookAt(...value);
    } else if (key === 'orthoViewSize') {
      const reso = getScreenResolution();
      const aspectRatio = reso.x / reso.y;
      cam.left = -value * aspectRatio;
      cam.right = value * aspectRatio;
      cam.top = value;
      cam.bottom = -value;
    } else {
      cam[key] = value;
    }
    cam.updateMatrixWorld();
    cam.updateProjectionMatrix();
    setSceneParam('cameras', newCamParams);
    saveCameraState({ index: i, [key]: value });
    const helpers = getSceneItem('cameraHelpers');
    if (helpers && helpers.length && helpers[i]) {
      helpers[i].update();
    }
    if (key === 'name') {
      const camerasParams = getSceneParam('cameras');
      const currentCameraId = camerasParams[getSceneParam('curCameraIndex')]?.id;
      const cameraSelector = getSceneItem('cameraSelectorTool');
      cameraSelector.setOptions(
        camerasParams.map((c) => ({ value: c.id, label: c.name || c.id })),
        currentCameraId
      );
    }
  };
}

export default UICamera;
