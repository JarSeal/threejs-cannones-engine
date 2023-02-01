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
    this.listOuterWrapperId = this.id + '-list-outer-wrapper';
    this.template = `<div class="smallListSelector">
      <div class="topBar">
        <div class="searchBar">
          <input type="text" placeholder="Search..." id="${this.searchInputId}" />
        </div>
        <div class="actionButtons" id="${this.actionButtonsId}"></div>
      </div>
      <div class="listOuterWrapper" id="${this.listOuterWrapperId}"></div>
    </div>`;
  }

  addListeners = () => {
    this.addListener({
      id: this.id + '-search-input-change',
      target: this.elem.querySelector(`#${this.searchInputId}`),
      type: 'keyup',
      fn: (e) => {
        const value = e.target.value.toLowerCase();
        if (value) {
          this.list = this.allItemsList.filter((item) => {
            if (
              item.printName.toLowerCase().includes(value) ||
              item.id.toLowerCase().includes(value)
            )
              return true;
            return false;
          });
        } else {
          this.list = this.allItemsList;
        }
        this.page = 1;
        this.updateList();
      },
    });
  };

  updateList = () => {
    this.listElemId = this.id + '-list-elem';
    const prevButtonId = this.id + '-prev-page';
    const pageIndicatorId = this.id + '-page-indicator';
    const nextButtonId = this.id + '-next-page';

    // List
    this.listWrapper.addChildDraw({
      id: this.listElemId,
      template: this._createListTemplate(),
    });

    // Pagination
    this.listWrapper.addChildDraw(
      new Button({
        id: prevButtonId,
        text: 'prev',
        class: ['paginationBtn', 'paginationPrevBtn'],
        disabled: this.page === 1,
        onClick: () => {
          this.page--;
          this.updateList();
        },
      })
    );
    const totalPages = Math.ceil(this.list.length / this.itemsPerPage);
    this.listWrapper.addChildDraw({
      id: pageIndicatorId,
      text: this.page + ' / ' + (totalPages || 1),
      class: 'currentPageIndicator',
    });
    this.listWrapper.addChildDraw(
      new Button({
        id: nextButtonId,
        text: 'next',
        disabled: this.page >= totalPages,
        onClick: () => {
          this.page++;
          this.updateList();
        },
      })
    );

    if (this.onChange && this.list.length) {
      const clickListenerId = this.id + '-list-button-listener';
      this.addListener({
        id: clickListenerId,
        target: this.elem.querySelector(`#${this.listElemId}`),
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
    // Create list and pagination
    this.listWrapper = this.addChildDraw({
      id: this.id + '-list-wrapper',
      attach: this.listOuterWrapperId,
    });
    this.updateList();
  };

  _createListTemplate = () => {
    const startItem = (this.page - 1) * this.itemsPerPage;
    const endItemPlusOne = startItem + this.itemsPerPage;
    let template = '<ul>';
    if (!this.list.length) {
      template += `<li class="emptyState">No images found...</li>`;
    } else {
      for (let i = startItem; i < endItemPlusOne; i++) {
        const item = this.list[i];
        if (!item) break;
        template += this._getItemTemplate(item);
      }
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

  // @TODO: missing template
  _imageItemTemplate = (item) => this._defaultItemTemplate(item);
}

export default SmallListSelector;