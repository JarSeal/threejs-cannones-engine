import * as THREE from 'three';

import { Component } from '../../../LIGHTER';
import Checkbox from '../common/form/Checbox';
import { getSceneParam, setSceneParam } from '../../sceneData/sceneParams';
import { getSceneItem, removeMeshFromScene } from '../../sceneData/sceneItems';
import { saveSceneState } from '../../sceneData/saveSession';
import SettingsPanel from '../common/SettingsPanel';
import NumberInput from '../common/form/NumberInput';
import TextInput from '../common/form/TextInput';
import SvgIcon from '../icons/svg-icon';
import ColorPicker from '../common/form/ColorPicker';

class UIWorld extends Component {
  constructor(data) {
    super(data);
  }

  paint = () => {
    this.addChildDraw({
      id: 'panel-title-' + this.id,
      text: 'World',
      tag: 'h3',
      class: 'panelTitle',
    });
    this.addChildDraw(
      new SvgIcon({
        id: this.id + '-main-icon',
        icon: 'globe',
        width: 22,
        class: 'mainTabIcon',
      })
    );
    this._basicHelpers();
  };

  _basicHelpers = () => {
    const scene = getSceneItem('scene');
    let gridHelper = scene.children.find((item) => item.type === 'GridHelper');
    const axesHelper = scene.children.find((item) => item.type === 'AxesHelper');
    const helpersContentId = 'panel-basic-helpers-content-' + this.id;
    this.addChildDraw(
      new SettingsPanel({
        id: 'panel-basic-helpers-' + this.id,
        title: 'Helpers',
        contentId: helpersContentId,
      })
    );

    const showAxesHelperId = 'axes-helper-' + this.id;
    this.addChildDraw(
      new Checkbox({
        id: showAxesHelperId,
        attach: helpersContentId,
        class: 'panelCheckBox',
        label: 'Show axes',
        name: 'showAxes',
        hideMsg: true,
        changeFn: () => {
          axesHelper.visible = !axesHelper.visible;
          setSceneParam('axesHelper', axesHelper.visible);
          saveSceneState();
        },
        value: axesHelper.visible,
      })
    );

    const showGridHelperId = 'grid-helper-' + this.id;
    this.addChildDraw(
      new Checkbox({
        id: showGridHelperId,
        attach: helpersContentId,
        class: 'panelCheckBox',
        label: 'Show grid',
        name: 'showGrid',
        hideMsg: true,
        changeFn: () => {
          gridHelper.visible = !gridHelper.visible;
          setSceneParam('grid', gridHelper.visible);
          saveSceneState();
          if (gridSize) gridSize.toggleDisabled(!gridHelper.visible);
        },
        value: gridHelper.visible,
      })
    );

    const gridSize = this.addChildDraw(
      new NumberInput({
        id: 'grid-size-' + this.id,
        attach: helpersContentId,
        label: 'Grid size',
        step: 2,
        min: 2,
        max: 200000,
        value: getSceneParam('gridSize'),
        disabled: !gridHelper.visible,
        changeFn: (value, setValue) => {
          value = parseInt(value);
          if (value % 2 !== 0) {
            value += 1;
            setValue(value, true);
          }
          setSceneParam('gridSize', value);
          saveSceneState({ gridSize: value });
          gridHelper = scene.children.find((item) => item.type === 'GridHelper');
          removeMeshFromScene(gridHelper, scene);
          gridHelper = new THREE.GridHelper(value, value);
          if (!getSceneParam('grid')) gridHelper.visible = false;
          scene.add(gridHelper);
        },
      })
    );

    // Environment
    const envContentId = 'panel-environment-content-' + this.id;
    this.addChildDraw(
      new SettingsPanel({
        id: 'panel-environement-' + this.id,
        title: 'Environment',
        contentId: envContentId,
      })
    );
    this.addChildDraw({
      id: this.id + '-env-title1',
      attach: envContentId,
      class: ['panelTitle'],
      text: 'Scene background and skybox:',
    });
    this.addChildDraw(
      new ColorPicker({
        id: this.id + '-env-back-color',
        attach: envContentId,
        color: getSceneParam('rendererClearColor'),
        label: 'Background',
        onChangeColor: (newColor) => {
          setSceneParam('rendererClearColor', newColor.hex);
          getSceneItem('renderer').setClearColor(newColor.hex);
          saveSceneState();
        },
      })
    );
  };
}

export default UIWorld;
