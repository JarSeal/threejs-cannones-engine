import { Component } from '../../../LIGHTER';

import barsMenuIcon from './svg/bars.svg?raw';
import cameraIcon from './svg/video.svg?raw';
import caretUpIcon from './svg/caret-up.svg?raw';
import caretDownIcon from './svg/caret-down.svg?raw';
import cubeIcon from './svg/cube.svg?raw';
import cubesIcon from './svg/cubes.svg?raw';
import globeIcon from './svg/globe.svg?raw';
import infoIcon from './svg/info.svg?raw';
import moveArrowsIcon from './svg/arrows-up-down-left-right.svg?raw';
import plusIcon from './svg/plus.svg?raw';
import pointerIcon from './svg/arrow-pointer.svg?raw';
import redoIcon from './svg/rotate-right.svg?raw';
import rotateIcon from './svg/rotate.svg?raw';
import saveIcon from './svg/floppy-disk.svg?raw';
import scaleIcon from './svg/crop-simple.svg?raw';
import trashIcon from './svg/trash.svg?raw';
import undoIcon from './svg/rotate-left.svg?raw';
import xMarkIcon from './svg/xmark.svg?raw';
import triangleExclamation from './svg/triangle-exclamation.svg?raw';

class SvgIcon extends Component {
  constructor(data) {
    super(data);
    let style = `display: inline-block; width: ${
      data.width ? data.width + 'px;' : 'auto;'
    } height: ${data.height ? data.height + 'px;' : 'auto;'}`;
    if (data.width === undefined && data.height === undefined) style = '';

    this.noIconFound = false;
    const icon = this._getIcon(data.icon);
    if (this.noIconFound) {
      console.warn('Could not find icon: ' + data.icon);
      style += 'border-bottom: 0.2rem dashed yellow;';
    }

    this.template = `<span class="ui-icon" style="${style}">${icon}</span>`;
  }

  _getIcon = (icon) => {
    switch (icon) {
      case 'bars':
        return barsMenuIcon;
      case 'camera':
        return cameraIcon;
      case 'caretUp':
        return caretUpIcon;
      case 'caretDown':
        return caretDownIcon;
      case 'cube':
        return cubeIcon;
      case 'cubes':
        return cubesIcon;
      case 'globe':
        return globeIcon;
      case 'info':
        return infoIcon;
      case 'moveArrows':
        return moveArrowsIcon;
      case 'plus':
        return plusIcon;
      case 'pointer':
        return pointerIcon;
      case 'redo':
        return redoIcon;
      case 'rotate':
        return rotateIcon;
      case 'save':
        return saveIcon;
      case 'scale':
        return scaleIcon;
      case 'trash':
        return trashIcon;
      case 'undo':
        return undoIcon;
      case 'xMark':
        return xMarkIcon;
      default:
        this.noIconFound = true;
        return triangleExclamation;
    }
  };
}

export default SvgIcon;
