import * as THREE from 'three';

import { Component } from '../../LIGHTER';
import Button from './common/Button';
import Checkbox from './common/form/Checbox';
import styles from './UIPanelRight.module.scss';
import {
  getSceneParam,
  getSceneParamR,
  setSceneParam,
  setSceneParamR,
} from '../sceneData/sceneParams';
import { getSceneItem, removeMeshFromScene } from '../sceneData/sceneItems';
import { saveEditorState, saveSceneState } from '../sceneData/saveSession';
import SettingsPanel from './common/SettingsPanel';
import NumberInput from './common/form/NumberInput';

class UIWorld extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.uiPanelRight, styles.uiPanelWorld];
    this.showPanel = getSceneParamR(`editor.show.${this.id}`, false);
    if (this.showPanel) {
      data.class.push(styles.showPanel);
    }
  }

  paint = () => {
    this.addChildDraw(
      new Button({
        id: 'btn-toggle-visiblity-' + this.id,
        onClick: () => this.togglePanel(),
        class: 'panelTogglerButton',
        text: 'W',
      })
    );
    this.addChildDraw({
      id: 'panel-title-' + this.id,
      text: 'World settings',
      tag: 'h3',
      class: 'panelTitle',
    });
    this._basicHelpers();
  };

  togglePanel = (close) => {
    if (close) {
      this.showPanel = false;
      this.elem.classList.remove(styles.showPanel);
      saveEditorState({ show: { [this.id]: false } });
      return;
    }
    this.showPanel = !this.showPanel;
    if (this.showPanel) {
      this.elem.classList.add(styles.showPanel);
    } else {
      this.elem.classList.remove(styles.showPanel);
    }
    setSceneParamR(`editor.show.${this.id}`, this.showPanel);
    saveEditorState({ show: { [this.id]: this.showPanel } });
  };

  _basicHelpers = () => {
    const scene = getSceneItem('scene');
    let gridHelper = scene.children.find((item) => item.type === 'GridHelper');
    const axesHelper = scene.children.find((item) => item.type === 'AxesHelper');
    const contentId = 'panel-basic-helpers-content-' + this.id;
    this.addChildDraw(
      new SettingsPanel({
        id: 'panel-basic-helpers-' + this.id,
        title: 'Helpers',
        contentId: contentId,
      })
    );

    const showGridHelperId = 'grid-helper-' + this.id;
    gridHelper.visible = getSceneParamR(`editor.show.${showGridHelperId}`, true);
    this.addChildDraw(
      new Checkbox({
        id: showGridHelperId,
        attach: contentId,
        label: 'Show grid',
        name: 'showGrid',
        hideMsg: true,
        changeFn: () => {
          gridHelper.visible = !gridHelper.visible;
          setSceneParamR(`editor.show.${showGridHelperId}`, gridHelper.visible);
          saveEditorState({ show: { [showGridHelperId]: gridHelper.visible } });
        },
        value: gridHelper.visible,
      })
    );

    this.addChildDraw(
      new NumberInput({
        id: 'grid-size-' + this.id,
        attach: contentId,
        label: 'Grid size',
        step: 2,
        min: 2,
        value: getSceneParam('gridSize'),
        changeFn: (e, setValue) => {
          let value = parseInt(e.target.value);
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

    const showAxesHelperId = 'axes-helper-' + this.id;
    axesHelper.visible = getSceneParamR(`editor.show.${showAxesHelperId}`, true);
    this.addChildDraw(
      new Checkbox({
        id: showAxesHelperId,
        attach: contentId,
        label: 'Show axes',
        name: 'showAxes',
        hideMsg: true,
        changeFn: () => {
          axesHelper.visible = !axesHelper.visible;
          setSceneParamR(`editor.show.${showAxesHelperId}`, axesHelper.visible);
          saveEditorState({ show: { [showAxesHelperId]: axesHelper.visible } });
        },
        value: axesHelper.visible,
      })
    );
  };
}

export default UIWorld;
