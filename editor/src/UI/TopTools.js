import { Component } from '../../LIGHTER';
import { getSceneParam } from '../sceneData/sceneParams';
import { changeCurCamera, newCameraDialog } from '../utils/toolsForCamera';
import { printName } from '../utils/utils';
import Button from './common/Button';
import SvgIcon from './icons/svg-icon';
import styles from './TopTools.module.scss';

class TopTools extends Component {
  constructor(data) {
    super(data);
    data.class = [styles.topTools];
    this.mainButtonsWrapper = null;
  }

  paint = () => {
    this.updateTools();
  };

  _mainButtons = () => {
    const buttonWrapperId = this.id + '-main-buttons-wrapper';
    const buttons = [
      {
        type: 'menu',
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-add-menu-button',
            class: ['menuButton'],
            icon: new SvgIcon({ id: this.id + '-add-icon', icon: 'plus', width: 18 }),
            ...this._menuButtonListeners,
          })
        ),
        options: [
          {
            icon: new SvgIcon({ id: this.id + '-add-camera-icon', icon: 'camera', width: 18 }),
            text: 'Add Camera',
            onClick: () => newCameraDialog(),
          },
        ],
      },
      {
        type: 'cameraSelector',
        btn: this.addChild(
          new Button({
            id: this.id + '-btn-change-cam-menu-button',
            class: ['menuButton', 'camSelector'],
            icon: new SvgIcon({ id: this.id + '-change-cam-icon', icon: 'camera', width: 18 }),
            ...this._menuButtonListeners,
          })
        ),
      },
    ];
    if (this.mainButtonsWrapper) this.mainButtonsWrapper.discard(true);
    this.mainButtonsWrapper = this.addChildDraw({
      id: buttonWrapperId,
      class: ['floatingUIButtons', 'mainButtons'],
    });
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (button.type === 'menu') {
        button.btn.draw({ attach: buttonWrapperId });
        if (button.options && Array.isArray(button.options)) {
          const buttonMenu = button.btn.addChildDraw({
            id: button.btn.data.id + '-menu-wrapper',
            class: ['menuWrapper'],
          });
          for (let j = 0; j < button.options.length; j++) {
            buttonMenu.addChildDraw(
              new Button({
                ...button.options[j],
                id: button.btn.data.id + '-option-' + j,
                class: button.options[j].icon ? ['hasIcon'] : [],
              })
            );
          }
        }
      } else if (button.type === 'cameraSelector') {
        const cams = getSceneParam('cameras');
        button.btn.draw({
          attach: buttonWrapperId,
          appendHtml: `<span class="curCamName">
            ${printName(cams[getSceneParam('curCameraIndex')])}
          </span>`,
        });
        const buttonMenu = button.btn.addChildDraw({
          id: button.btn.data.id + '-menu-wrapper',
          class: ['menuWrapper'],
        });
        for (let j = 0; j < cams.length; j++) {
          buttonMenu.addChildDraw(
            new Button({
              id: button.btn.data.id + '-cameras-' + j,
              class: getSceneParam('curCameraIndex') === j ? 'current' : [],
              text: printName(cams[j]),
              onClick: () => {
                changeCurCamera(j);
              },
            })
          );
        }
      }
    }
  };

  updateTools = () => {
    this._mainButtons();
  };

  _menuButtonListeners = {
    onFocus: (_, comp) => {
      comp.hasFocus = true;
      comp.focusStart = performance.now();
    },
    onBlur: (_, comp) => (comp.hasFocus = false),
    onClick: (_, comp) => {
      if (performance.now() > comp.focusStart + 200) comp.elem.blur();
    },
  };
}

export default TopTools;
