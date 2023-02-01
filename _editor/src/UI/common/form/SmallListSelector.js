import { Component } from '../../../../LIGHTER';
import { getDateString, printName } from '../../../utils/utils';
import Button from '../Button';

// Attributes:
// - list = array of params (should have at least "id" and "dateSaved" props)
// - selectedId = SimpleID
// - onChange = function to call when the user selects something
// - type = string (possible values: "images", undefined [default])
// - sortBy = string (the key of the property to sort by, the default value is 'dateSaved')
// - sortOrder = string ('asc' [default] or 'desc')
// - itemsPerPage = number (default is 10)
class SmallListSelector extends Component {
  constructor(data) {
    super(data);
    this.list = data.list.map((item) => {
      item.printName = printName(item);
      return item;
    });

    this.itemsPerPage = data.itemsPerPage || 10;
    this.page = 1;

    this.sortBy = data.sortBy || 'dateSaved';
    this.sortOrder = data.sortOrder || 'asc';
    let sortMethod = (a, b) => b[this.sortBy] - a[this.sortBy];
    if (this.sortOrder === 'desc') sortMethod = (a, b) => a[this.sortBy] - b[this.sortBy];
    this.list = this.list.sort(sortMethod);
    this.allItemsList = [...this.list];

    this.onChange = data.onChange;
    this.selectedId = data.selectedId;
    this.selectedParams = null;
    if (this.selectedId) {
      this.selectedParams = this.list.find((item) => item.id === this.selectedId);
    }
    this.searchInputId = this.id + '-search-input';
    this.actionButtonsId = this.id + '-action-buttons';
    this.listWrapperId = this.id + '-list-wrapper';
    this.paginationWrapperId = this.id + '-pagination-wrapper';
    this.template = `<div class="smallListSelector">
      <div class="topBar">
        <div class="searchBar">
          <input type="text" placeholder="Search..." id="${this.searchInputId}" />
        </div>
        <div class="actionButtons" id="${this.actionButtonsId}"></div>
      </div>
      <div class="listWrapper" id="${this.listWrapperId}"></div>
      <div class="paginationWrapper" id="${this.paginationWrapperId}"></div>
    </div>`;
    console.log('LIST', this.list);
  }

  addListeners = () => {
    if (this.onChange && this.list.length) {
      this.addListener({
        id: 'list-button-listener',
        target: this.elem.querySelector(`#${this.listWrapperId} ul`),
        type: 'click',
        fn: (e) => {
          if (e.target.nodeName !== 'BUTTON') return;
          const id = e.target.id;
          if (this.onChange) this.onChange(id);
        },
      });
    }
  };

  paint = () => {
    // Create list and items
    this.elem.querySelector('#' + this.listWrapperId).innerHTML = '';
    this.addChildDraw({
      id: this.id + '-list-elem',
      attach: this.listWrapperId,
      template: this._createListTemplate(),
    });

    // Pagination
    this.elem.querySelector('#' + this.paginationWrapperId).innerHTML = '';
    this.addChildDraw(
      new Button({
        id: this.id + '-prev-page',
        text: 'prev',
        class: ['paginationBtn', 'paginationPrevBtn'],
        disabled: this.page === 1,
        onClick: () => {
          this.page--;
          this.reDrawSelf();
        },
      })
    );
    const totalPages = Math.ceil(this.list.length / this.itemsPerPage);
    this.addChildDraw({
      id: this.id + '-page-indicator',
      text: this.page + ' / ' + totalPages,
      class: 'currentPageIndicator',
    });
    this.addChildDraw(
      new Button({
        id: this.id + '-next-page',
        text: 'next',
        disabled: this.page === totalPages,
        onClick: () => {
          this.page++;
          this.reDrawSelf();
        },
      })
    );
  };

  _createListTemplate = () => {
    const startItem = (this.page - 1) * this.itemsPerPage;
    const endItemPlusOne = startItem + this.itemsPerPage;
    let template = '<ul>';
    for (let i = startItem; i < endItemPlusOne; i++) {
      const item = this.list[i];
      if (!item) break;
      template += this._getItemTemplate(item);
    }
    template += '</ul>';
    return template;
  };

  _getItemTemplate = (item) => {
    switch (this.type) {
      case 'images':
        return this._imageItemTemplate(item);
      default:
        return this._defaultItemTemplate(item);
    }
  };

  _defaultItemTemplate = (item) => {
    const template = `<li>
      <button id="${item.id}">
        <span class="printName" style="pointer-events:none;">${item.printName}</span>
        <span class="dateSaved" style="pointer-events:none;">${getDateString(item.dateSaved)}</span>
      </button>
    </li>`;
    return template;
  };

  _imageItemTemplate = (item) => {
    // @TODO: missing template
    return this._defaultItemTemplate(item);
  };
}

export default SmallListSelector;
