import { Component } from '../../../LIGHTER';
import { getSceneParam } from '../../sceneData/sceneParams';
import SettingsPanel from '../common/SettingsPanel';
import NumberInput from '../common/form/NumberInput';
import { getSceneItem, setSceneItem } from '../../sceneData/sceneItems';
import InfoField from '../common/form/InfoField';
import Checkbox from '../common/form/Checbox';
import ActionButtons from '../common/form/ActionButtons';
import VectorInput from '../common/form/VectorInput';
import TextInput from '../common/form/TextInput';
import SimpleIDInput from '../common/form/SimpleIDInput';
import { printName } from '../../utils/utils';
import SvgIcon from '../icons/svg-icon';
import Button from '../common/Button';
import {
  changeCurCamera,
  destroyCamera,
  newCameraDialog,
  resetCameraTransforms,
  toggleOrbitControls,
  toggleShowCameraHelper,
  updateCameraDefaultTransforms,
  updateCameraProperty,
  updateCameraTransforms,
} from '../../utils/toolsForCamera';

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
    this.addChildDraw(
      new Component({ id: actionButtonsWrapperId, class: 'panelTopActionButtons' })
    );
    this.addChildDraw(
      new Button({
        id: this.id + '-add-new-camera-action',
        onClick: () => newCameraDialog(),
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
    cams.forEach((c, index) => {
      // Camera panel
      const contentId = 'panel-cameras-content-' + c.index + '-' + this.id;
      camPanels.push(
        this.addChildDraw(
          new SettingsPanel({
            id: 'panel-cameras-' + c.id + '-' + this.id,
            title: printName(c),
            contentId: contentId,
            class: getSceneParam('curCameraIndex') === c.index ? 'highlight' : null,
          })
        )
      );

      // ID
      this.addChildDraw(
        new SimpleIDInput({
          id: 'camId-' + index + '-' + this.id,
          label: 'ID',
          attach: contentId,
          curId: c.id,
        })
      );

      // Name
      this.addChildDraw(
        new TextInput({
          id: 'cam-name-' + index + '-' + this.id,
          label: 'Name',
          attach: contentId,
          value: c.name,
          onBlur: (e) => {
            const value = e.target.value;
            updateCameraProperty(value, c.index, 'name');
            camPanels[c.index].updateTitle(printName({ name: value, id: c.id }));
          },
        })
      );

      // Type
      this.addChildDraw(
        new InfoField({
          id: 'infoType-' + index + '-' + this.id,
          label: 'Type',
          content: c.type,
          attach: contentId,
        })
      );

      // Field of view (FOV)
      if (c.type === 'perspective') {
        this.addChildDraw(
          new NumberInput({
            id: 'fov-' + index + '-' + this.id,
            attach: contentId,
            label: 'Field of view',
            step: 1,
            min: 1,
            precision: 2,
            value: c.fov,
            changeFn: (value) => {
              updateCameraProperty(parseFloat(value), c.index, 'fov');
            },
          })
        );
      } else if (c.type === 'orthographic') {
        this.addChildDraw(
          new NumberInput({
            id: 'view-size-' + index + '-' + this.id,
            attach: contentId,
            label: 'View size',
            step: 1,
            min: 0.1,
            precision: 3,
            value: c.orthoViewSize,
            changeFn: (value) => {
              updateCameraProperty(parseFloat(value), c.index, 'orthoViewSize');
            },
          })
        );
      }

      // Frustum near plane
      this.addChildDraw(
        new NumberInput({
          id: 'near-' + index + '-' + this.id,
          attach: contentId,
          label: 'Frustum near plane',
          step: 1,
          min: 0.1,
          precision: 3,
          value: c.near,
          changeFn: (value) => {
            updateCameraProperty(parseFloat(value), c.index, 'near');
          },
        })
      );

      // Frustum far plane
      this.addChildDraw(
        new NumberInput({
          id: 'far-' + index + '-' + this.id,
          attach: contentId,
          label: 'Frustum far plane',
          step: 1,
          min: 0.2,
          precision: 3,
          value: c.far,
          changeFn: (value) => {
            updateCameraProperty(parseFloat(value), c.index, 'far');
          },
        })
      );

      // Transforms
      const transformsId = 'panel-cam-transforms-content-' + c.index + '-' + this.id;
      this.addChildDraw(
        new SettingsPanel({
          id: 'panel-cam-transforms-' + index + '-' + this.id,
          title: 'Transforms',
          contentId: transformsId,
          attach: contentId,
          showPanel: false,
        })
      );

      // Position
      this.addChildDraw(
        new VectorInput({
          id: 'cam-pos-' + index + '-' + this.id,
          attach: transformsId,
          label: 'Position',
          step: 0.5,
          inputLabels: ['X', 'Y', 'Z'],
          values: c.position,
          onChange: (value, index) => {
            updateCameraTransforms('position', value, index, c.index);
            const cam = getSceneItem('allCameras')[c.index];
            rotationComponent.setValues([cam.rotation.x, cam.rotation.y, cam.rotation.z], true);
          },
        })
      );

      // Target
      const targetComponent = this.addChildDraw(
        new VectorInput({
          id: 'cam-target-' + index + '-' + this.id,
          attach: transformsId,
          label: 'Target',
          step: 0.5,
          inputLabels: ['X', 'Y', 'Z'],
          values: c.target,
          onChange: (value, index) => {
            updateCameraTransforms('target', value, index, c.index);
            const cam = getSceneItem('allCameras')[c.index];
            rotationComponent.setValues([cam.rotation.x, cam.rotation.y, cam.rotation.z], true);
          },
        })
      );

      // Rotation
      const rot = getSceneItem('allCameras')[c.index].rotation;
      const rotationComponent = this.addChildDraw(
        new VectorInput({
          id: 'cam-rot-' + index + '-' + this.id,
          attach: transformsId,
          label: 'Rotation (rad)',
          inputLabels: ['X', 'Y', 'Z'],
          step: Math.PI / 16,
          values: [rot.x, rot.y, rot.z],
          onChange: (value, index) => {
            updateCameraTransforms('rotation', value, index, c.index);
            const curTarget = getSceneParam('cameras')[c.index].target;
            targetComponent.setValues(curTarget, true);
          },
        })
      );

      // Transforms (DEFAULTS)
      const defaultTransformsId = 'panel-cam-default-transforms-content-' + c.index + '-' + this.id;
      this.addChildDraw(
        new SettingsPanel({
          id: 'panel-cam-default-transforms-' + index + '-' + this.id,
          title: 'Default transforms',
          contentId: defaultTransformsId,
          attach: contentId,
          showPanel: false,
        })
      );

      // Default Position
      this.addChildDraw(
        new VectorInput({
          id: 'cam-default-pos-' + index + '-' + this.id,
          attach: defaultTransformsId,
          label: 'Position',
          step: 0.5,
          inputLabels: ['X', 'Y', 'Z'],
          values: c.defaultPosition || c.position || [5, 5, 5],
          onChange: (value, index) =>
            updateCameraDefaultTransforms('position', value, index, c.index),
        })
      );

      // Default Target
      this.addChildDraw(
        new VectorInput({
          id: 'cam-default-target-' + index + '-' + this.id,
          attach: defaultTransformsId,
          label: 'Target',
          step: 0.5,
          inputLabels: ['X', 'Y', 'X'],
          values: c.defaultTarget || c.target || [0, 0, 0],
          onChange: (value, index) =>
            updateCameraDefaultTransforms('target', value, index, c.index),
        })
      );

      // Orbit controls
      this.addChildDraw(
        new Checkbox({
          id: 'orbitControls-' + index + '-' + this.id,
          attach: contentId,
          class: 'panelCheckBox',
          label: 'Orbit controls',
          changeFn: (e) => toggleOrbitControls(e.target.checked, c.index),
          value: c.orbitControls,
        })
      );

      // Show helper
      this.addChildDraw(
        new Checkbox({
          id: 'showHelper-' + index + '-' + this.id,
          attach: contentId,
          class: 'panelCheckBox',
          label: 'Show helper',
          changeFn: (e) => toggleShowCameraHelper(e.target.checked, c.index),
          value: c.showHelper || false,
        })
      );

      // Action buttons
      const buttons = [
        {
          id: 'use-this-cam-' + index + '-' + this.id,
          icon: new SvgIcon({
            id: this.id + '-use-cam-icon-' + index,
            icon: 'camera',
            width: 16,
          }),
          disabled: c.index === getSceneParam('curCameraIndex'),
          class: 'panelActionButton',
          onClick: () => {
            if (c.index === getSceneParam('curCameraIndex')) return;
            changeCurCamera(c.index);
            document
              .getElementById('use-this-cam-' + index + '-' + this.id)
              .nextElementSibling.focus();
          },
        },
        {
          id: 'reset-cam-' + index + '-' + this.id,
          icon: new SvgIcon({
            id: this.id + '-set-to-default-transforms-' + index,
            icon: 'undo',
            width: 14,
          }),
          class: 'panelActionButton',
          onClick: () => {
            const afterConfirmation = () => {
              this.rePaint();
              document.getElementById('reset-cam-' + index + '-' + this.id).focus();
            };
            resetCameraTransforms(c.index, afterConfirmation);
          },
        },
        {
          id: 'delete-cam-' + index + '-' + this.id,
          icon: new SvgIcon({
            id: this.id + '-destroy-cam-' + index,
            icon: 'trash',
            width: 12,
          }),
          class: ['panelActionButton', 'delete-button'],
          onClick: () => {
            destroyCamera(c.index);
          },
        },
      ];
      this.addChildDraw(
        new ActionButtons({ id: 'actions-' + index + '-' + this.id, attach: contentId, buttons })
      );
    });
    setSceneItem('cameraPanels', camPanels);
  };
}

export default UICamera;
