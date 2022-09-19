import * as THREE from 'three';

import { Component } from '../../../LIGHTER';
import { getSceneParam, setSceneParam } from '../../sceneData/sceneParams';
import SettingsPanel from '../common/SettingsPanel';
import NumberInput from '../common/form/NumberInput';
import { saveCameraState } from '../../sceneData/saveSession';
import { getSceneItem } from '../../sceneData/sceneItems';
import InfoField from '../common/form/InfoField';
import Checkbox from '../common/form/Checbox';
import { createOrbitControls, removeOrbitControls } from '../../controls/orbitControls';
import ActionButtons from '../common/form/ActionButtons';

class UICamera extends Component {
  constructor(data) {
    super(data);
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
    cams.forEach((c) => {
      const contentId = 'panel-cameras-content-' + c.index + '-' + this.id;
      this.addChildDraw(
        new SettingsPanel({
          id: 'panel-cameras-' + c.id + '-' + this.id,
          title: c.name || c.id,
          contentId: contentId,
        })
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
      this.addChildDraw(
        new Checkbox({
          id: 'orbitControls-' + c.id + '-' + this.id,
          attach: contentId,
          hideMsg: true,
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
            const cameras = getSceneItem('allCameras');
            cameras[c.index].lookAt(...target);
            const camParams = getSceneParam('cameras');
            camParams[c.index].target = target;
            setSceneParam('cameras', camParams);
            saveCameraState({ index: c.index, target });
            if (c.index === getSceneParam('curCameraIndex')) {
              const controls = getSceneItem('orbitControls');
              controls.target = new THREE.Vector3(...target);
            }
          },
        },
      ];
      this.addChildDraw(
        new ActionButtons({ id: 'actions-' + c.id + '-' + this.id, attach: contentId, buttons })
      );
    });
  };

  _updateCameraProperty = (value, i, key) => {
    const newCamParams = getSceneParam('cameras').map((cam, index) => {
      if (index === i) return { ...cam, [key]: value };
      return cam;
    });
    const cam = getSceneItem('allCameras')[i];
    if (key === 'position' || key === 'quaternion') {
      cam[key].set(...value);
    } else {
      cam[key] = value;
    }
    cam.updateProjectionMatrix();
    setSceneParam('cameras', newCamParams);
    saveCameraState({ index: i, [key]: value });
  };
}

export default UICamera;
