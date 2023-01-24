import { Component } from '../../../LIGHTER';
import { getSceneParam } from '../../sceneData/sceneParams';
import { updateSceneName } from '../../utils/toolsForFS';
import InfoField from '../common/form/InfoField';
import TextInput from '../common/form/TextInput';
import SvgIcon from '../icons/svg-icon';

class UIScene extends Component {
  constructor(data) {
    super(data);
  }

  paint = () => {
    this.addChildDraw({
      id: 'panel-title-' + this.id,
      text: 'Scene',
      tag: 'h3',
      class: 'panelTitle',
    });
    this.addChildDraw(
      new SvgIcon({
        id: this.id + '-main-icon',
        icon: 'scene',
        width: 22,
        class: 'mainTabIcon',
      })
    );

    this._sceneData();
  };

  _sceneData = () => {
    // Scene ID
    this.addChildDraw(
      new InfoField({
        id: this.id + '-sceneId',
        label: 'Scene ID',
        attributes: { style: 'margin: 1rem 0;' },
        content: getSceneParam('sceneId'),
      })
    );

    // Scene name
    this.addChildDraw(
      new TextInput({
        id: this.id + '-name',
        label: 'Scene name',
        value: getSceneParam('name') || '',
        onBlur: (e) => {
          const value = e.target.value;
          updateSceneName(value);
        },
      })
    );

    // Scene description
    // @TODO
  };
}

export default UIScene;
