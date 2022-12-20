import { Component } from '../../../LIGHTER';
import Checkbox from '../common/form/Checbox';
import { getSceneParam } from '../../sceneData/sceneParams';
import { getSceneItem } from '../../sceneData/sceneItems';
import SettingsPanel from '../common/SettingsPanel';
import NumberInput from '../common/form/NumberInput';
import SvgIcon from '../icons/svg-icon';
import ColorPicker from '../common/form/ColorPicker';
import {
  changeWorldAmbientColor,
  changeWorldAmbientIntensity,
  changeWorldBackgroundColor,
  setWorldGridHelperSize,
  toggleWorldAmbientLight,
  toggleWorldAxesHelper,
  toggleWorldGridHelper,
} from '../../utils/toolsForWorld';

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
        changeFn: toggleWorldAxesHelper,
        value: axesHelper.visible,
      })
    );

    let gridSize;
    const showGridHelperId = 'grid-helper-' + this.id;
    this.addChildDraw(
      new Checkbox({
        id: showGridHelperId,
        attach: helpersContentId,
        class: 'panelCheckBox',
        label: 'Show grid',
        name: 'showGrid',
        hideMsg: true,
        changeFn: () => toggleWorldGridHelper(gridSize),
        value: gridHelper.visible,
      })
    );

    gridSize = this.addChildDraw(
      new NumberInput({
        id: 'grid-size-' + this.id,
        attach: helpersContentId,
        label: 'Grid size',
        step: 2,
        min: 2,
        max: 200000,
        precision: 0,
        value: getSceneParam('gridSize'),
        disabled: !gridHelper.visible,
        changeFn: setWorldGridHelperSize,
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
      id: this.id + '-env-title-back-and-skybox',
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
        onChangeColor: (newColor) => changeWorldBackgroundColor(newColor.hex),
      })
    );

    this.addChildDraw({
      id: this.id + '-env-title-lighting',
      attach: envContentId,
      class: ['panelTitle', 'overline'],
      text: 'Environment lighting:',
    });
    this.addChildDraw(
      new Checkbox({
        id: this.id + '-use-ambient-light',
        attach: envContentId,
        class: 'panelCheckBox',
        label: 'Ambient light',
        name: 'showAmbient',
        hideMsg: true,
        changeFn: toggleWorldAmbientLight,
        value:
          getSceneParam('lights').find((l) => l.type === 'ambient').disabled === undefined
            ? true
            : !getSceneParam('lights').find((l) => l.type === 'ambient').disabled,
      })
    );
    this.addChildDraw(
      new ColorPicker({
        id: this.id + '-env-ambient-color',
        attach: envContentId,
        color: getSceneParam('lights').find((l) => l.type === 'ambient').color,
        label: 'Ambient color',
        onChangeColor: (newColor) => changeWorldAmbientColor(newColor.hex),
      })
    );
    this.addChildDraw(
      new NumberInput({
        id: this.id + '-env-ambient-intensity',
        attach: envContentId,
        label: 'Ambient intensity',
        step: 0.1,
        min: 0,
        max: 1,
        precision: 3,
        value: getSceneParam('lights').find((l) => l.type === 'ambient').intensity,
        changeFn: changeWorldAmbientIntensity,
      })
    );
  };
}

export default UIWorld;
