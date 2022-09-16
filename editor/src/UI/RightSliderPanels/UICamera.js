import * as THREE from 'three';

import { Component } from '../../../LIGHTER';
import Checkbox from '../common/form/Checbox';
import {
  getSceneParam,
  getSceneParamR,
  setSceneParam,
  setSceneParamR,
} from '../../sceneData/sceneParams';
import { getSceneItem, removeMeshFromScene } from '../../sceneData/sceneItems';
import { saveEditorState, saveSceneState } from '../../sceneData/saveSession';
import SettingsPanel from '../common/SettingsPanel';
import NumberInput from '../common/form/NumberInput';

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
  };
}

export default UICamera;
