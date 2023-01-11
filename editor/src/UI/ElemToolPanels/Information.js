import { Component } from '../../../LIGHTER';
import { getSceneItem } from '../../sceneData/sceneItems';
import { CAMERA_TYPES } from '../../utils/defaultSceneValues';
import { updateCameraProperty } from '../../utils/toolsForCamera';
import { updateElemProperty } from '../../utils/toolsForElems';
import { getObjectParams, getObjectStats, printName } from '../../utils/utils';
import InfoField from '../common/form/InfoField';
import SimpleIDInput from '../common/form/SimpleIDInput';
import TextInput from '../common/form/TextInput';

class Information extends Component {
  constructor(data) {
    super(data);
    this.selections = data.selections;
    this.isMultiselection = this.selections.length > 1;
    if (this.isMultiselection) {
      this.params = getObjectParams(getSceneItem('selectionGroup'));
    } else {
      this.params = getObjectParams(this.selections[0]);
    }
    this.basicInfoWrapperId = this.id + '-basicinfo-wrapper';
    this.statsWrapperId = this.id + '-stats-wrapper';
    data.template = `<div>
      <span class="elemPanelHeading">${
        this.isMultiselection ? 'Selected objects information' : 'Object information'
      }</span>
      <div id="${this.basicInfoWrapperId}" class="elemBasicInfo"></div>
      <span class="elemPanelHeading">${
        this.isMultiselection ? 'Selected objects stats' : 'Stats'
      }</span>
      <div id="${this.statsWrapperId}" class="elemStats"></div>
    </div>`;
  }

  paint = () => {
    const params = this.params;

    // ID
    if (!this.isMultiselection) {
      this.addChildDraw(
        new SimpleIDInput({
          id: this.id + '-id',
          label: 'ID',
          curId: params.id,
          attach: this.basicInfoWrapperId,
          afterSuccessBlur: (value, prevVal) => {
            if (params.paramType === 'camera') {
              updateCameraProperty(value, params.index, 'id', { prevVal });
            } else if (params.paramType === 'element') {
              updateElemProperty(value, params.id, 'id', { prevVal });
            }
          },
        })
      );

      // Name
      this.addChildDraw(
        new TextInput({
          id: this.id + '-name',
          label: 'Name',
          value: params.name || '',
          attach: this.basicInfoWrapperId,
          onBlur: (e) => {
            const value = e.target.value;
            if (params.paramType === 'camera') {
              updateCameraProperty(value, params.index, 'name');
            } else if (params.paramType === 'element') {
              updateElemProperty(value, params.id, 'name');
            }
          },
        })
      );

      // Type
      this.addChildDraw(
        new InfoField({
          id: this.id + '-type',
          label: 'Type',
          content: this._createTypeTextForElement(params),
          attach: this.basicInfoWrapperId,
        })
      );
    } else {
      // Multiselection basic info
      let multiSelText = `${this.selections.length} objects selected: <ul class="multiSelObjList">`;
      const selectionTexts = this.selections.map((sel) => {
        const p = getObjectParams(sel);
        return `<li>${this._createTypeTextForElement(p)}: <span>${printName(p)}</span></li>`;
      });
      multiSelText += selectionTexts.join('') + '</ul>';
      this.addChildDraw({
        id: this.id + '-multiselection-basicinfo-text',
        html: multiSelText,
        attach: this.basicInfoWrapperId,
      });
    }

    // Object(s) stats
    const stats = getObjectStats(
      this.isMultiselection ? getSceneItem('selectionGroup') : this.selections[0]
    );
    let statsList = `<li>Objects (drawcalls): ${stats.objects}</li>
    <li>Triangles: ${stats.triangles}</li>
    <li>Vertices: ${stats.vertices}</li>`;
    this.addChildDraw({
      id: this.id + '-object-stats',
      html: `<ul>${statsList}</ul>`,
      attach: this.statsWrapperId,
    });
  };

  _createTypeTextForElement = (params) => {
    if (!params) return '';
    return params.paramType === 'camera'
      ? CAMERA_TYPES.find((type) => type.value === params.type).label
      : params.shape + ` (${params.type})`;
  };
}

export default Information;
