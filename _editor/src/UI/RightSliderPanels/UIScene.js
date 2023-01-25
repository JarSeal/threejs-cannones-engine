import { Component } from '../../../LIGHTER';
import { getSceneParam } from '../../sceneData/sceneParams';
import { deleteSceneDialog, newSceneDialog, updateSceneName } from '../../utils/toolsForFS';
import Button from '../common/Button';
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

    const actionButtonsWrapperId = this.id + '-actions-wrapper';
    this.addChildDraw({ id: actionButtonsWrapperId, class: 'panelTopActionButtons' });
    this.addChildDraw(
      new Button({
        id: this.id + '-add-new-scene-action',
        onClick: () => newSceneDialog(),
        class: 'panelActionButton',
        attach: actionButtonsWrapperId,
        icon: new SvgIcon({ id: this.id + '-plus-icon', icon: 'plus', width: 16 }),
      })
    );
    this.addChildDraw(
      new Button({
        id: this.id + '-delete-scene-action',
        onClick: () => deleteSceneDialog(getSceneParam('projectFolder'), getSceneParam('sceneId')),
        class: ['panelActionButton', 'delete-button'],
        attach: actionButtonsWrapperId,
        icon: new SvgIcon({ id: this.id + '-thrash-icon', icon: 'trash', width: 12 }),
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
