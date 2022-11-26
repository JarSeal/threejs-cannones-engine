import { Component } from '../../../LIGHTER';

import globeIcon from './svg/globe.svg?raw';
import cameraIcon from './svg/video.svg?raw';
import plusIcon from './svg/plus.svg?raw';
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
      case 'globe':
        return globeIcon;
      case 'camera':
        return cameraIcon;
      case 'plus':
        return plusIcon;
      default:
        this.noIconFound = true;
        return triangleExclamation;
    }
  };
}

export default SvgIcon;
