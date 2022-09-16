import { Component } from '../../LIGHTER';
import Button from './common/Button';
import Checkbox from './common/form/Checbox';
import styles from './UIPanelRight.module.scss';
import { getSceneParam } from '../sceneData/sceneParams';
import { getSceneItem } from '../sceneData/sceneItems';
import { saveEditorState } from '../SceneLoader/SceneEditorState';
import SettingsPanel from './common/SettingsPanel';

class UIWorld extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.uiPanelRight, styles.uiPanelWorld];
    this.showPanel = getSceneParam('editor')?.show
      ? getSceneParam('editor').show[this.id] || false
      : false;
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
    saveEditorState({ show: { [this.id]: this.showPanel } });
  };

  _basicHelpers = () => {
    const scene = getSceneItem('scene');
    const gridHelper = scene.children.find((item) => item.type === 'GridHelper');
    const axesHelper = scene.children.find((item) => item.type === 'AxesHelper');
    const contentId = 'panel-basic-helpers-content-' + this.id;
    this.addChildDraw(
      new SettingsPanel({
        id: 'panel-basic-helpers-' + this.id,
        title: 'Helpers',
        contentId: contentId,
      })
    );
    this.addChildDraw(
      new Checkbox({
        id: 'grid-helper-' + this.id,
        attach: contentId,
        label: 'Show grid',
        name: 'showGrid',
        hideMsg: true,
        changeFn: () => {
          gridHelper.visible = !gridHelper.visible;
        },
        value: gridHelper.visible,
      })
    );
    this.addChildDraw(
      new Checkbox({
        id: 'axes-helper-' + this.id,
        attach: contentId,
        label: 'Show axes',
        name: 'showAxes',
        hideMsg: true,
        changeFn: () => {
          axesHelper.visible = !axesHelper.visible;
        },
        value: axesHelper.visible,
      })
    );
  };
}

export default UIWorld;
