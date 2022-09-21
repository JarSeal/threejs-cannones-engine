import * as THREE from 'three';

import { Component } from '../../../LIGHTER';
import { getSceneParam, setSceneParam } from '../../sceneData/sceneParams';
import SettingsPanel from '../common/SettingsPanel';
import NumberInput from '../common/form/NumberInput';
import { saveCameraState } from '../../sceneData/saveSession';
import { getSceneItem, setSceneItem } from '../../sceneData/sceneItems';
import InfoField from '../common/form/InfoField';
import Checkbox from '../common/form/Checbox';
import { createOrbitControls, removeOrbitControls } from '../../controls/orbitControls';
import ActionButtons from '../common/form/ActionButtons';
import VectorInput from '../common/form/VectorInput';

class UICamera extends Component {
  constructor(data) {
    super(data);
    this.updatePanel = data.updatePanel;
  }

  paint = () => {
    this.addChildDraw({
      id: 'panel-title-' + this.id,
      text: 'Camera settings',
      tag: 'h3',
      class: 'panelTitle',
    });
    this._cameras();
  };

  _cameras = () => {
    const cams = getSceneParam('cameras');
    const camPanels = [];
    cams.forEach((c) => {
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

      this.addChildDraw(
        new InfoField({
          id: 'infoId-' + c.id + '-' + this.id,
          label: 'ID',
          content: c.id,
          attach: contentId,
        })
      );
      if (c.name) {
        this.addChildDraw(
          new InfoField({
            id: 'infoName-' + c.id + '-' + this.id,
            label: 'Name',
            content: c.name,
            attach: contentId,
          })
        );
      }
      this.addChildDraw(
        new InfoField({
          id: 'infoType-' + c.id + '-' + this.id,
          label: 'Type',
          content: c.type,
          attach: contentId,
        })
      );
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
      const transformsId = 'panel-cam-transforms-content-' + c.index + '-' + this.id;
      this.addChildDraw(
        new SettingsPanel({
          id: 'panel-cam-transforms-' + c.id + '-' + this.id,
          title: 'Transforms',
          contentId: transformsId,
          attach: contentId,
        })
      );
      this.addChildDraw(
        new VectorInput({
          id: 'cam-pos-' + c.id + '-' + this.id,
          attach: transformsId,
          label: 'Camera position',
          inputLabels: ['x', 'y', 'z'],
          values: c.position,
          onChange: (e, index) => {
            const curPos = getSceneParam('cameras')[c.index].position;
            const curTarget = getSceneParam('cameras')[c.index].target;
            const curQuat = getSceneItem('allCameras')[c.index].quaternion;
            curPos[index] = parseFloat(e.target.value);
            this._updateCameraProperty(curPos, c.index, 'position');
            this._updateCameraProperty(curTarget, c.index, 'target');
            this._updateCameraProperty(
              [curQuat.x, curQuat.y, curQuat.z, curQuat.w],
              c.index,
              'quaternion'
            );
          },
        })
      );
      this.addChildDraw(
        new VectorInput({
          id: 'cam-target-' + c.id + '-' + this.id,
          attach: transformsId,
          label: 'Camera target',
          inputLabels: ['x', 'y', 'z'],
          values: c.target,
          onChange: (e, index) => {
            const curPos = getSceneParam('cameras')[c.index].position;
            const curTarget = getSceneParam('cameras')[c.index].target;
            const curQuat = getSceneItem('allCameras')[c.index].quaternion;
            curTarget[index] = parseFloat(e.target.value);
            this._updateCameraProperty(curPos, c.index, 'position');
            this._updateCameraProperty(curTarget, c.index, 'target');
            this._updateCameraProperty(
              [curQuat.x, curQuat.y, curQuat.z, curQuat.w],
              c.index,
              'quaternion'
            );
          },
        })
      );
      // TODO: Add Euler rotation (angles in degrees)
      this.addChildDraw(
        new VectorInput({
          id: 'cam-quaternion-' + c.id + '-' + this.id,
          attach: transformsId,
          label: 'Camera quaternion',
          inputLabels: ['x', 'y', 'z', 'w'],
          values: c.quaternion,
          onChange: (e, index) => {
            const curQuats = getSceneItem('allCameras')[c.index].quaternion;
            // TODO: how to calculate the new target?
            // 1. Get the length from camera position to target position
            const quatsToUpdate = [curQuats.x, curQuats.y, curQuats.z, curQuats.w];
            quatsToUpdate[index] = parseFloat(e.target.value);
            this._updateCameraProperty(quatsToUpdate, c.index, 'quaternion');
            // 2. Travel a distance of the target distance to the new target (which way the camera is facing)
            // 3. Find the position at the end of this distance
          },
        })
      );
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
      const buttons = [
        {
          id: 'reset-cam-' + c.id + '-' + this.id,
          text: 'Reset position',
          onClick: () => {
            if (c.index === getSceneParam('curCameraIndex')) {
              removeOrbitControls();
              createOrbitControls();
            }
            const pos = [5, 5, 5];
            this._updateCameraProperty(pos, c.index, 'position');
            const target = [0, 0, 0];
            this._updateCameraProperty(target, c.index, 'target');
            this._updateCameraProperty(target, c.index, 'target'); // Needs to be called twice in order to make the cam helper place correctly as well
            if (c.index === getSceneParam('curCameraIndex')) {
              const controls = getSceneItem('orbitControls');
              controls.target = new THREE.Vector3(...target);
            }
            this.rePaint();
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
            const cameraItems = getSceneItem('allCameras');
            if (cameraItems.length <= 1) return;
            const index = c.index;
            const cameraParams = getSceneParam('cameras').filter((cam) => cam.id !== c.id);
            setSceneParam('cameras', cameraParams);
            const cameraSelector = getSceneItem('cameraSelectorTool');
            cameraItems[index].clear();
            cameraItems[index].removeFromParent();
            setSceneItem(
              'allCameras',
              cameraItems.filter((c, i) => i !== index)
            );
            saveCameraState({ removeIndex: index });
            if (c.index === getSceneParam('curCameraIndex')) {
              cameraSelector.setValue(cameraParams[0].id);
            }
            cameraSelector.setOptions(
              cameraParams.map((c) => ({ value: c.id, label: c.name || c.id })),
              c.id
            );
            this.updatePanel();
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
  };
}

export default UICamera;
