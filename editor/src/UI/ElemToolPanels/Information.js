import { Component } from '../../../LIGHTER';
import { getSceneItem } from '../../sceneData/sceneItems';
import { CAMERA_TYPES } from '../../utils/defaultSceneValues';
import { updateCameraProperty } from '../../utils/toolsForCamera';
import { updateElemProperty } from '../../utils/toolsForElems';
import { getObjectParams } from '../../utils/utils';
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
    data.template = `<div>
      <span class="elemPanelHeading">${
        this.isMultiselection ? 'Selected objects information' : 'Object information'
      }</span>
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
      const typeText =
        params.paramType === 'camera'
          ? CAMERA_TYPES.find((type) => type.value === params.type).label
          : params.shape + ` (${params.type})`;
      this.addChildDraw(
        new InfoField({
          id: this.id + '-type',
          label: 'Type',
          content: typeText,
        })
      );
    }
  };
}

export default Information;
