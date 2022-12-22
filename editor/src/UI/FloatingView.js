import { Component } from '../../LIGHTER';
import Button from './common/Button';

import styles from './FloatingView.module.scss';
import SvgIcon from './icons/svg-icon';

// - headerText = String
// - minified
// - iconData = { icon: string, width: integer/float } (SvgIcon)
// - closeButtonFn() = Function for when the close button is clicked
// - afterDragFn(newPos: {x:INT,y:INT}) = Callback function to call after the dragging of the view is finished
// - afterResizeHeightFn(newHeight) = Call function to call after the height resizing of the view is finished
// - contentFn(this) = Function to call to render the content of floating view
// - position = Object with x and y values { x: integer, y: integer }
// - height = Integer
// - minHeight = Integer
// - countLastContentChildHeight = Boolean (if set true, it does not count the content childrens' last child's height)
// - onScrollFn(event) = Function to call when scrolling the contentWrapper
class FloatingView extends Component {
  constructor(data) {
    super(data);
    if (Array.isArray(data.class)) {
      data.class.push(styles.floatingView);
    } else if (typeof data.class === 'string') {
      data.class = [data.class, styles.floatingView];
    } else {
      data.class = [styles.floatingView];
    }
    data.class.push('floatingView');
    this.minified = data.minified;
    if (!data.style) data.style = {};

    if (data.position) {
      data.style.left = (data.position?.x || 0) + 'px';
      data.style.top = (data.position?.y || 0) + 'px';
    }
    this.newPosToSave = data.position || { x: 0, y: 0 };

    this.height = data.height || 368;
    this.newHeightToSave = data.height || this.height;
    this.minHeight = data.minHeight || 240;
    data.style.height = this.height + 'px';
    data.style.minHeight = this.minHeight + 'px';
    this.countLastContentChildHeight = data.countLastContentChildHeight;

    this.headerComp = null;
    this.headerText = data.headerText;
    this.iconData = data.iconData;
    this.mouseDownOnHeader = false;
    this.mouseDownHeaderStartOffset = { x: 0, y: 0 };
    this.mouseDownOnBottomSizer = false;
    this.mouseDownSizerStartOffsetY = 0;

    this.closeButtonFn = data.closeButtonFn;
    this.afterDragFn = data.afterDragFn;
    this.afterResizeHeightFn = data.afterResizeHeightFn;
    this.afterMinifyFn = data.afterMinifyFn;
    this.afterScrollFn = data.afterScrollFn;
    this.contentWrapper = null;
    this.contentFn = data.contentFn;
  }

  addListeners = () => {
    this.addListener({
      id: this.id + '-mouse-down-listener',
      target: this.headerComp.elem,
      type: 'mousedown',
      fn: (e) => {
        if (!this.mouseDownOnHeader) {
          const elemPos = this.elem.getBoundingClientRect();
          this.mouseDownHeaderStartOffset = {
            x: e.clientX - elemPos.left,
            y: e.clientY - elemPos.top,
          };
        }
        this.mouseDownOnHeader = true;
        this.elem.classList.add('dragging');
      },
    });
    this.addListener({
      id: this.id + '-mouse-up-listener',
      target: window,
      type: 'mouseup',
      fn: () => {
        if (this.mouseDownOnHeader) {
          if (this.afterDragFn) this.afterDragFn(this.newPosToSave);
        }
        if (this.mouseDownOnBottomSizer) {
          this.height = this.newHeightToSave;
          this._countLastContentHeight();
          if (this.afterResizeHeightFn) this.afterResizeHeightFn(this.newHeightToSave);
        }
        this.elem.classList.remove('dragging');
        this.mouseDownOnHeader = false;
        this.elem.classList.remove('resizingHeight');
        this.mouseDownOnBottomSizer = false;
      },
    });
    this.addListener({
      id: this.id + '-mouse-move-listener',
      target: window,
      type: 'mousemove',
      fn: (e) => {
        if (this.mouseDownOnHeader) {
          const pos = {
            x: e.clientX - this.mouseDownHeaderStartOffset.x,
            y: e.clientY - this.mouseDownHeaderStartOffset.y,
          };
          this.elem.style.left = `${pos.x}px`;
          this.elem.style.top = `${pos.y}px`;
          this.newPosToSave = pos;
        }
        if (this.mouseDownOnBottomSizer) {
          let newHeight = this.height - (this.mouseDownSizerStartOffsetY - e.clientY);
          if (newHeight < this.minHeight) newHeight = this.minHeight;
          this.elem.style.height = `${newHeight}px`;
          this.newHeightToSave = newHeight;
          this._countLastContentHeight(newHeight);
        }
      },
    });
  };

  paint = () => {
    // Header bar
    this.headerComp = this.addChildDraw({
      id: this.id + '-main-header',
      class: [styles.floatingViewHeader, 'floatingViewHeader'],
      text: this.headerText,
    });
    if (this.iconData?.icon) {
      this.headerComp.addChildDraw(
        new SvgIcon({
          ...this.iconData,
          id: this.id + '-main-header-icon',
          class: [styles.floatingViewHeaderIcon, 'floatingViewIcon'],
        })
      );
    }
    this.headerComp.addChildDraw(
      new Button({
        id: this.id + '-main-header-minify-btn',
        class: [styles.floatingHeaderBtn, styles.floatingHeaderMinifyBtn, 'floatingViewMinifyBtn'],
        onClick: () => {
          if (this.elem.classList.contains('minified')) {
            this.elem.classList.remove('minified');
            this.afterMinifyFn(true);
          } else {
            this.elem.classList.add('minified');
            this.afterMinifyFn(false);
          }
        },
      })
    );
    this.headerComp.addChildDraw(
      new Button({
        id: this.id + '-main-header-close-btn',
        class: [styles.floatingHeaderBtn, styles.floatingHeaderCloseBtn, 'floatingViewCloseBtn'],
        icon: new SvgIcon({
          id: this.id + '-main-header-close-btn-icon',
          icon: 'xMark',
          width: 16,
        }),
        onClick: this.closeButtonFn,
      })
    );

    this.contentWrapper = this.addChildDraw({
      id: this.id + '-floating-view-content',
      class: [styles.floatingContentWrapper, 'floatingViewContent', 'scrollbar'],
      style: { height: 'calc(100% - 35px)' },
    });
    if (this.afterScrollFn) {
      this.contentWrapper.addListener({
        id: this.contentWrapper.id + '-scroll-listener',
        type: 'scroll',
        fn: this.afterScrollFn,
      });
    }
    if (this.contentFn) this.contentFn(this.contentWrapper);

    this._countLastContentHeight();

    // Bottom height sizer
    const bottomSizer = this.addChildDraw(
      new Button({
        id: this.id + '-height-sizer',
        class: [styles.floatingHeightSizer, 'floatingViewHeightSizer'],
        attributes: { tabindex: '-1' },
      })
    );
    bottomSizer.addListener({
      id: bottomSizer.id + '-mousedown-listener',
      type: 'mousedown',
      fn: (e) => {
        if (!this.mouseDownOnBottomSizer) {
          this.mouseDownSizerStartOffsetY = e.clientY;
        }
        this.mouseDownOnBottomSizer = true;
        this.elem.classList.add('resizingHeight');
      },
    });

    // Minify, if set true, only after the sizes have been calculated and listeners created
    if (this.minified) this.elem.classList.add('minified');
  };

  _countLastContentHeight = (newHeight) => {
    if (this.countLastContentChildHeight) {
      const contentChildren = this.contentWrapper.elem.children;
      let usableHeight = (newHeight || this.height) - 43; // 35px for the header bar, 2px for border-top and border-bottom of the container, and 6px for bottom height sizer
      for (let i = 0; i < contentChildren.length; i++) {
        const computedStyle = getComputedStyle(contentChildren[i]);
        usableHeight -= parseInt(computedStyle.marginTop) || 0;
        usableHeight -= parseInt(computedStyle.marginBottom) || 0;
        if (i === contentChildren.length - 1) {
          contentChildren[i].style.height = usableHeight > 0 ? usableHeight + 'px' : 0;
        }
        usableHeight -= contentChildren[i].offsetHeight;
      }
    }
  };
}

export default FloatingView;
