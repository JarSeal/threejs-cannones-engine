import { Component } from '../../LIGHTER';
import styles from './ElemTool.module.scss';
import { getSceneParamR, setSceneParamR } from '../sceneData/sceneParams';
import { saveEditorState } from '../sceneData/saveSession';
import { getSceneItem } from '../sceneData/sceneItems';

class ElemTool extends Component {
  constructor(data) {
    super(data);
    this.elemToolWrapper = null;
  }

  paint = () => {
    this.updateTool();
  };

  _createTool = () => {
    const toolWrapperId = this.id + '-main-wrapper';
    if (this.elemToolWrapper) this.elemToolWrapper.discard(true);
    if (getSceneParamR('editor.show.elemTool')) return;

    const position = getSceneParamR('editor.positions.elemTool');
    this.elemToolWrapper = this.addChildDraw({
      id: toolWrapperId,
      class: [styles.elemTool],
      style: { left: (position?.x || 0) + 'px', top: (position?.y || 0) + 'px' },
    });

    const selections = getSceneItem('selection') || [];
    let headerText = `[ ${selections.length} items ]`;
    if (selections.length === 1) {
      headerText =
        selections[0].userData.name && selections[0].userData.name.length
          ? selections[0].userData.name
          : '';
    } else if (selections.length === 0) {
      headerText = '';
    }

    // Header bar
    this.addChildDraw({
      id: this.id + '-main-header',
      attach: toolWrapperId,
      class: [styles.elemToolHeader],
      text: headerText,
    });
  };

  updateTool = () => {
    this._createTool();
  };

  setPosition = (x, y) => {
    setSceneParamR('editor.positions.elemTool', { x, y });
    saveEditorState({ positions: { elemTool: { x, y } } });
    if (!this.elemToolWrapper || !this.elemToolWrapper.elem) return;
    this.elemToolWrapper.elem.style.cssText = `left: ${x}px; top: ${y}px;`;
  };

  _selectedElemIcon = (selections) => {
    // Move this to utils and use it also for leftTools (and here)
    if (selections.length > 1) return { icon: 'cubes', width: 26 };
    const sel = selections[0].userData;
    if (sel?.paramType === 'element') return { icon: 'cube', width: 22 };
    if (sel?.paramType === 'camera') return { icon: 'camera', width: 18 };
    return { icon: '', width: 22 };
  };
}

export default ElemTool;
