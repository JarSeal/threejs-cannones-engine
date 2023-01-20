import { Component } from '../../../LIGHTER';
import Spinner from '../common/Spinner';

class SceneLoaderView extends Component {
  constructor(data) {
    super(data);
    data.class = 'sceneLoaderView';
    this.loaderTextId = this.id + '-loader-text';
    this.textComp;
  }

  paint = () => {
    this.addChildDraw(
      new Spinner({
        id: this.id + '-loader-icon',
        class: ['center', 'middle'],
        width: 50,
      })
    );
    this.textComp = this.addChildDraw({
      id: this.loaderTextId,
      class: 'loadingText',
    });
  };

  updateText = (text) => {
    this.textComp.elem.textContent = text;
  };
}

export default SceneLoaderView;
