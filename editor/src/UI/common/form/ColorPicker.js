import { Color } from 'three';
import Alwan from 'alwan';

import { Component } from '../../../../LIGHTER';

/**
 * onColorChange(hex, color, colorObject): callback function
 * color: { r: number (0-255), g: number (0-255), b: int (0-255), a: float (0-1) | optional }
 * useOpacity: boolean (optional, default is false)
 * label: string (optional, default is "Color")
 */
class ColorPicker extends Component {
  constructor(data) {
    super(data);
    this.defaultColor = { r: 255, g: 0, b: 0, a: 1 };
    this.color = data.color || this.defaultColor;
    let colorString = '';
    if (typeof this.color === 'string') {
      colorString = this.color;
    } else {
      colorString = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    }
    this.colorObject = new Color(colorString);
    this.color = {
      r: this.colorObject.r,
      g: this.colorObject.g,
      b: this.colorObject.b,
      a: this.color.a || 1,
    };
    this.colorHex = this.colorObject.getHexString();
    this.useOpacity = data.useOpacity || false;
    this.colorPickerId = this.id + '-color-picker-elem';
    this.colorHexTextId = this.id + '-hex-text';
    this.colorIndicatorId = this.id + '-indicator';
    this.template = `
      <div class="form-elem form-elem--color-picker inputColor${
        this.useOpacity ? ' inputColor--opacity' : ''
      }">
        <div id="${this.colorPickerId}"></div>
        <label class="form-elem__label">${data.label || 'Color'}</label>
        <span class="inputColor__value" id="${this.colorHexTextId}">#${this.colorHex}</span>
        <div class="inputColor__indicatorBackground"></div>
        <div id="${this.colorIndicatorId}" class="inputColor__indicator"></div>
      </div>`;
    this.widget = null;
    this.onChangeColor = data.onChangeColor;
    if (!this.onChangeColor) {
      console.error('ColorPicker is missing the onChangeColor callback');
    }
  }

  paint = () => {
    this.widget = new Alwan('#' + this.colorPickerId, {
      id: this.colorPickerId,
      color: '#' + this.colorHex,
      default: '#F00',
      opacity: this.useOpacity,
      theme: 'light',
      format: 'hex',
      margin: 1,
    });
    this.widget.on('change', this.setNewColor);
    const pickerElem = document.getElementById(this.colorPickerId);
    this.addListener({
      id: this.id + '-focus',
      target: pickerElem,
      type: 'focus',
      fn: () => this.elem.classList.add('focus'),
    });
    this.addListener({
      id: this.id + '-blur',
      target: pickerElem,
      type: 'blur',
      fn: () => this.elem.classList.remove('focus'),
    });
    document.getElementById(this.colorIndicatorId).style.backgroundColor = this.widget
      .getColor()
      .rgb()
      .toString();
  };

  /**
   * @param newColor:
   *  | alwan colorObject (doc: https://www.npmjs.com/package/alwan)
   *  | { r: number (0-255), g: number (0-255), b: int (0-255), a: float (0-1) | optional }
   */
  setNewColor = (newColor) => {
    if (newColor === undefined || newColor === null) newColor = this.defaultColor;
    let color = null;
    if (newColor.r === undefined && newColor.r === undefined && newColor.r === undefined) {
      color = newColor.rgb();
    } else {
      if (newColor.r === undefined || newColor.r === undefined || newColor.r === undefined) {
        console.error('Color is missing a "r", "g", or "b" property and value.');
        color = this.defaultColor;
      } else {
        color = newColor;
      }
    }
    this.colorObject = new Color(`rgb(${color.r}, ${color.g}, ${color.b})`); // TODO: Check if the old color needs to be somehow reset/removed in Three.js
    this.colorHex = this.colorObject.getHexString();
    this.color = { ...color };
    if (this.color.a === undefined || !this.useOpacity) this.color.a = 1;
    document.getElementById(this.colorHexTextId).textContent = '#' + this.colorHex;
    document.getElementById(this.colorIndicatorId).style.backgroundColor = this.widget
      .getColor()
      .rgb()
      .toString();
    this.onChangeColor(this.getColor());
  };

  getColor = (type) => {
    switch (type) {
      case 'hex':
        return '#' + this.colorHex;
      case 'hexPlain':
        return this.colorHex;
      case 'alwan':
        return this.widget.getColor();
      case 'three':
        return this.colorObject;
      case 'color':
        return this.color;
      default:
        return {
          alwan: this.widget.getColor(),
          color: this.color,
          hex: '#' + this.colorHex,
          hexPlain: this.colorHex,
          three: this.colorObject,
        };
    }
  };
}

export default ColorPicker;
