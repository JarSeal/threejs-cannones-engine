import { Component } from '../../../LIGHTER';
import { getSceneParam, setSceneParam, setSceneParamR } from '../../sceneData/sceneParams';
import SettingsPanel from '../common/SettingsPanel';
import NumberInput from '../common/form/NumberInput';
import { saveCameraState, saveSceneState } from '../../sceneData/saveSession';
import { getSceneItem } from '../../sceneData/sceneItems';
import InfoField from '../common/form/InfoField';

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
        new NumberInput({
          id: 'fov-' + c.id + '-' + this.id,
          attach: contentId,
          label: 'Field of view',
          step: 1,
          min: 1,
          value: c.fov,
          changeFn: (e) => {
            this._updateCameraProperty(e, c.index, 'fov');
          },
        })
      );
    });
  };

  _updateCameraProperty = (e, i, key) => {
    const value = parseInt(e.target.value);
    const newCamParams = getSceneParam('cameras').map((cam, index) => {
      if (index === i) return { ...cam, [key]: value };
      return cam;
    });
    const cam = getSceneItem('allCameras')[i];
    cam[key] = value;
    cam.updateProjectionMatrix();
    setSceneParam('cameras', newCamParams);
    saveCameraState({ index: i, [key]: value });
  };
}

export default UICamera;
