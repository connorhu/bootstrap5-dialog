
import {createElement} from './util/index'
import {defineJQueryPlugin} from 'bootstrap/js/src/util'
import {Modal} from "bootstrap"
// import EventHandler from 'bootstrap/js/src/dom/event-handler'
import DialogButton from './button'

class Dialog /*extends Modal*/ {
    constructor(options) {
        // super(element, config);

        this._options = {}
        this.options = options
        this._buttonObjects = []

        return

        this._type = Dialog.TYPE_PRIMARY
        this._title = ''
        this._message = ''
        this._description = ''
        this._closable = false
        this._draggable = false
        this._btnCancelLabel = Dialog.DEFAULT_TEXTS.CANCEL
        this._btnCancelClass = null
        this._btnCancelHotkey = null
        this._btnOKLabel = Dialog.DEFAULT_TEXTS.OK
        this._btnOKClass = null
        this._btnOKHotkey = null
        this._btnsOrder = Dialog.defaultOptions.btnsOrder
        this._callback = null
        this._modal = null
        this._size = Dialog.SIZE_NORMAL
        this._registeredButtonHotkeys = {}
        this._indexedButtons = {}

        this.nl2br = true
    }

    /**
     * options getters and setters
     */

    /**
     * Setter for options
     *
     * @param options
     */
    set options(options) {
        this._options = options
    }

    /**
     * Getter for options
     *
     * @returns {*|{}}
     */
    get options() {
        return this._options
    }

    /**
     * Setter for id
     *
     * @param id
     */
    set id(id) {
        if (this._options.id !== id) {
            this._options.id = id

            // TODO update id in nodes
            this.setModalAttributes(this._modal)
            this.updateTitle()
        }
    }

    /**
     * Getter for id
     *
     * @returns {*}
     */
    get id() {
        return this._options.id
    }

    /**
     * Getter for realize
     *
     * @returns {*}
     */
    get realized() {
        return this._realized
    }

    /**
     * Setter for realize
     *
     * @param realized
     */
    set realized(realized) {
        this._realized = realized
    }

    isRealized() {
        return this.realized;
    }

    get cssClass() {
        return this._options.cssClass
    }

    set cssClass(cssClass) {
        if (this._options.cssClass !== cssClass) {
            this._options.cssClass = cssClass

            // todo update cssClass
        }
    }

    get size() {
        return this._options.size
    }

    set size(size) {
        if (this._options.size !== size) {
            this._options.size = size

            this.updateSize()
        }
    }

    get description() {
        return this._options.description
    }

    set description(description) {
        if (this._options.description !== description) {
            this._options.description = description
        }
    }

    get draggable() {
        return this._options.draggable
    }

    set draggable(draggable) {
        if (this._draggable !== draggable) {
            this._draggable = draggable

            this.updateModalDraggable()
        }
    }

    get type() {
        return this._options.type
    }

    set type(type) {
        this._options.type = type
    }

    set closable(closable) {
        this._options.closable = closable
    }

    get closable() {
        return this._options.closable
    }

    isClosable() {
        return this.closable
    }

    get title() {
        return this._options.title
    }

    set title(title) {
        if (this.title !== title) {
            this._options.title = title

            this.updateTitle()
        }
    }

    get message() {
        return this._options.message
    }

    set message(message) {
        if (this.message !== message) {
            this._options.message = message

            this.updateMessage()
        }
    }

    get callback() {
        return this._options.callback
    }

    set callback(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback type should function')
        }

        this._options.callback = callback
    }

    get modal() {
        return this._modal
    }

    get modalDialog() {
        return this._modalDialog
    }

    get modalContent() {
        return this._modalContent
    }

    get modalHeader() {
        return this._modalHeader
    }

    get modalBody() {
        return this._modalBody
    }

    get modalFooter() {
        return this._modalFooter
    }

    /** "do" methods */
    open() {
        if (!this.realized) {
            this.realize()
        }

        this.bootstrapModal.show()

        return this
    }

    close() {
        if (!this.isRealized()) {
            this.realize()
        }

        this.bootstrapModal.hide()

        return this;
    }

    realize() {
        this.initModalStuff()

        this.modalFooter.append(this.createFooterContent());
        this.modalHeader.append(this.createHeaderContent());
        this.modalBody.append(this.createBodyContent());

        // ezt kell megfixalni
        this.bootstrapModal = new Modal(this.getModalForBootstrapDialogModal(), {
            backdrop: (this.isClosable() && this.canCloseByBackdrop()) ? true : 'static',
            keyboard: false,
            show: false
        })

        //this.updateModalDraggable()
        //this.handleModalEvents()
        this.realized = true

        this.updateButtons()
        this.updateType()
        this.updateTitle()
        this.updateMessage()
        this.updateClosable()

        /*




        this.updateAnimate()
        this.updateSize()
        this.updateTabindex()*/

        return this;
    }

    /**
     * Init methods
     */
    initModalStuff() {
        this._modal = this.createModal()

        this._modalDialog = this.createModalDialog()
        this._modalContent = this.createModalContent()
        this._modalHeader = this.createModalHeader()
        this._modalBody = this.createModalBody()
        this._modalFooter = this.createModalFooter()

        this._modalContent.append(this._modalHeader)
        this._modalContent.append(this._modalBody)
        this._modalContent.append(this._modalFooter)
        this._modalDialog.append(this._modalContent)
        this._modal.append(this._modalDialog)

        return this;
    }

    setModalAttributes(modal) {
        modal.classList.add(Dialog.NAMESPACE)

        if (this.id) {
            modal.setAttribute('id', this.id)
            modal.setAttribute('aria-labelledby', `${this.id}_title`)
        }

        if (this.description) {
            modal.setAttribute('aria-describedby', this.description)
        }

        if (this.cssClass) {
            modal.classList.add(this.cssClass)
        }
    }

    /**
     * Node create methods
     */
    createModal() {
        let modal = createElement('<div class="modal" role="dialog" aria-hidden="true"></div>')

        this.setModalAttributes(modal)

        return modal
    }

    createModalDialog() {
        return createElement('<div class="modal-dialog"></div>');
    }

    createModalContent() {
        return createElement('<div class="modal-content"></div>');
    }

    createModalHeader() {
        return createElement('<div class="modal-header"></div>');
    }

    createModalBody() {
        return createElement('<div class="modal-body"></div>');
    }

    createModalFooter() {
        return createElement('<div class="modal-footer"></div>');
    }

    createFooterContent() {
        return createElement(`<div class="${Dialog.getNamespace('footer')}"></div>`);
    }

    createHeaderContent () {
        let container = document.createElement('div')

        container.classList.add(Dialog.getNamespace('header'))
        container.append(this.createTitleContent())
        container.append(this.createCloseButton())

        return container
    }

    createTitleContent() {
        return createElement(`<div class="${Dialog.getNamespace('title')}"></div>`)
    }

    createBodyContent() {
        let container = createElement(`<div class="${Dialog.getNamespace('body')}"></div>`)

        container.appendChild(this.createMessageContent())

        return container;
    }

    createMessageContent() {
        return createElement(`<div class="${Dialog.getNamespace('message')}"></div>`)
    }

    createCloseButton() {
        let container = createElement(`<div class="${Dialog.getNamespace('close-button')}"><button class="btn-close" aria-label="close"></button></div>`)

        container.addEventListener('click', this.closeButtonDidClick.bind(this))

        return container
    }

    /**
     * Attribute update methods
     */
    updateSize() {
        if (!this.isRealized) {
            return this
        }

        // Dialog size
        this.modal.classList.remove(Dialog.SIZE_NORMAL)
        this.modal.classList.remove(Dialog.SIZE_SMALL)
        this.modal.classList.remove(Dialog.SIZE_WIDE)
        this.modal.classList.remove(Dialog.SIZE_EXTRAWIDE)
        this.modal.classList.remove(Dialog.SIZE_LARGE)
        this.modal.classList.add(this.size)

        // Smaller dialog.
        this.modalDialog.classList.remove('modal-sm');
        if (this.size === Dialog.SIZE_SMALL) {
            this.modalDialog.classList.add('modal-sm');
        }

        // Wider dialog.
        this.modalDialog.classList.remove('modal-lg');
        if (this.size === Dialog.SIZE_WIDE) {
            this.modalDialog.classList.add('modal-lg');
        }
        // Extra Wide Dialog.
        this.modalDialog.classList.remove('modal-xl');
        if (this.size === Dialog.SIZE_EXTRAWIDE) {
            this.modalDialog.classList.add('modal-xl');
        }

        // Button size
        this.updateButtonSize()

        return this
    }

    updateButtonSize() {
        let buttonSizes = ['btn-lg', 'btn-sm', 'btn-xs']

        for (let button of Object.values(this._indexedButtons)) {
            let sizeClassSpecified = false

            if (button.classList.length > 0) {
                for (let buttonClass of button.classList.values()) {
                    if (buttonSizes.indexOf(buttonClass) !== -1) {
                        sizeClassSpecified = true
                        break
                    }
                }
            }

            if (!sizeClassSpecified) {
                button.classList.remove(...buttonSizes);
                button.classList.add(this.buttonSize);
            }
        }
    }

    updateModalDraggable() {
        if (!this.draggable) {
            this.modalHeader.classList.remove(Dialog.getNamespace('draggable'))
            this.modalHeader.removeEventListener('mousedown', this.modalHeaderDidMouseDown.bind(this))
            this.modal.removeEventListener('mouseup', this.modalDidMouseUp.bind(this))
            document.body.removeEventListener('mousemove', this.bodyDidMouseMove.bind(this))
            document.body.removeEventListener('mouseleave', this.bodyDidMouseLeave.bind(this))
        }
        else {
            this.modalHeader.classList.add(Dialog.getNamespace('draggable'))
            this.modalHeader.addEventListener('mousedown', this.modalHeaderDidMouseDown.bind(this))
            this.modal.addEventListener('mouseup', this.modalDidMouseUp.bind(this))
            document.body.addEventListener('mousemove', this.bodyDidMouseMove.bind(this))
            document.body.addEventListener('mouseleave', this.bodyDidMouseLeave.bind(this))
        }

        return this
    }

    /**
     * Static dialog type methods
     */
    static confirm() {
        let confirmOptions = {};
        let defaultConfirmOptions = {
            type: Dialog.TYPE_PRIMARY,
            title: null,
            message: null,
            closable: false,
            draggable: false,
            btnCancelLabel: Dialog.DEFAULT_TEXTS.CANCEL,
            btnCancelClass: null,
            btnCancelHotkey: null,
            btnOKLabel: Dialog.DEFAULT_TEXTS.OK,
            btnOKClass: null,
            btnOKHotkey: null,
            btnsOrder: Dialog.defaultOptions.btnsOrder,
            callback: null
        }

        if (typeof arguments[0] === 'object') {
            confirmOptions = {
                ...defaultConfirmOptions,
                ...arguments[0]
            }
        } else {
            confirmOptions = {...defaultConfirmOptions, ...{
                    message: arguments[0],
                    callback: typeof arguments[1] !== 'undefined' ? arguments[1] : null
                }
            }
        }

        if (confirmOptions.btnOKClass === null) {
            confirmOptions.btnOKClass = ['btn', confirmOptions.type.split('-')[1]].join('-');
        }

        let buttons = [{
            label: confirmOptions.btnCancelLabel,
            cssClass: confirmOptions.btnCancelClass,
            hotkey: confirmOptions.btnCancelHotkey,
            action: function (dialog) {
                if (typeof dialog.callback === 'function' && dialog.callback.call(this, false) === false) {
                    return false;
                }

                return dialog.close();
            }
        }, {
            label: confirmOptions.btnOKLabel,
            cssClass: confirmOptions.btnOKClass,
            hotkey: confirmOptions.btnOKHotkey,
            action: function (dialog) {
                if (typeof dialog.callback === 'function' && dialog.callback.call(this, true) === false) {
                    return false;
                }

                return dialog.close();
            }
        }]

        if (confirmOptions.btnsOrder === Dialog.BUTTONS_ORDER_OK_CANCEL) {
            buttons.reverse()
        }

        confirmOptions.buttons = buttons

        let dialog = new Dialog(confirmOptions)

        return dialog.open()
    }

    /**
     * Event listener callbacks
     */
    handleModalEvents() {
        this.modal.addEventListener('show.bs.modal', this.modalWillShow.bind(this))
        this.modal.addEventListener('shown.bs.modal', this.modalDidShow.bind(this))

        this.modal.addEventListener('hide.bs.modal', this.modalWillHide.bind(this))
        this.modal.addEventListener('hidden.bs.modal', this.modalDidHide.bind(this))

        this.modal.addEventListener('keyup', this.modalDidKeyUp.bind(this))

        return this
    }

    modalWillShow(event) {
        this.opened = true

        if (this.isModalEvent(event) && typeof this.onshow === 'function') {
            let openIt = this.onshow(this)

            if (openIt === false) {
                this.opened = false
            }

            return openIt
        }
    }

    isModalEvent(event) {
        // TODO what should we do with this?
        return true
        return typeof event.namespace !== 'undefined' && event.namespace === 'bs.modal'
    }

    modalDidShow() {
        this.isModalEvent(event) && typeof this.onshown === 'function' && this.onshown(dialog)
    }

    modalWillHide() {
        this.opened = false

        if (this.isModalEvent(event) && typeof this.onhide === 'function') {
            let hideIt = this.onhide(this);
            if (hideIt === false) {
                this.opened = true
            }

            return hideIt;
        }
    }

    modalDidHide() {
        this.isModalEvent(event) && typeof this.onhidden === 'function' && this.onhidden(this);

        if (this.isAutodestroy()) {
            this.relized = false

            Dialog.deleteDialog(this)
        }

        Dialog.moveFocus();

        // TODO what is this?
        // if ($('.modal').hasClass('in')) {
        //     $('body').addClass('modal-open');
        // }
    }

    modalHeaderDidMouseDown(event) {
        event.preventDefault();

        this.draggableData.isMouseDown = true;
        let dialogOffset = this.modalDialog.offset()

        this.draggableData.mouseOffset = {
            top: event.clientY - dialogOffset.top,
            left: event.clientX - dialogOffset.left
        }
    }

    closeButtonDidClick() {
        this.close()
    }

    bodyDidMouseMove(event) {
        if (!this.draggableData.isMouseDown) {
            return;
        }

        this.modalDialog.offset({
            top: event.clientY - this.draggableData.mouseOffset.top,
            left: event.clientX - this.draggableData.mouseOffset.left
        });
    }

    bodyDidMouseLeave() {
        this.draggableData.isMouseDown = false;
    }

    modalDidKeyUp(event) {
        event.keyCode === 27 && this.isClosable() && this.canCloseByKeyboard() && this.close()

        if (this._registeredButtonHotkeys[event.keyCode] !== undefined) {
            let button = this._registeredButtonHotkeys[event.keyCode]
            if (!button.disabled() && !button.hasFocus()) {
                button.focus()
                button.click()
            }
        }
    }

    /** others */

    static alert(message) {

    }

    static show(config) {

    }

    openAll() {

    }

    closeAll() {

    }

    static getDialog(id) {
        let dialog = null

        if (typeof Dialog.dialogs[id] !== 'undefined') {
            dialog = Dialog.dialogs[id]
        }

        return dialog
    }

    static addDialog(dialog) {
        Dialog.dialogs[dialog.id] = dialog

        return dialog
    }


    canCloseByBackdrop() {
        return this._config.closeByBackdrop
    }

    getModalForBootstrapDialogModal() {
        return this.modal
    }



    static getNamespace(name) {
        return `${Dialog.NAMESPACE}-${name}`
    }


    modalDidMouseUp() {
        this.draggableData.isMouseDown = false;
    }



    isModalEvent(event) {
        // TODO what should we do with this?
        return true
        return typeof event.namespace !== 'undefined' && event.namespace === 'bs.modal'
    }

    static deleteDialog(dialog) {
        delete Dialog.dialogs[dialog.getId()]
    }

    static moveFocus() {
        let lastDialogInstance = null

        for (let dialog of Dialog.dialogs) {
            if (dialog.isRealized() && dialog.isOpened()) {
                lastDialogInstance = dialog
            }
        }

        if (lastDialogInstance !== null) {
            lastDialogInstance.modal.focus()
        }
    }

    updateButtons() {
        if (!this.isRealized()) {
            return this
        }

        if (this.buttons.length === 0) {
            this.modalFooter.classList.add('d-none')
        } else {
            this.modalFooter.classList.remove('d-none')
            this.createFooterButtons()
        }

        return this
    }

    updateType() {
        if (!this.isRealized()) {
            return this
        }

        this.modal.classList.remove(Dialog.TYPES)
        this.modal.classList.add(this.type)

        return this
    }

    updateTitle() {
        if (!this.isRealized()) {
            return this
        }

        let title = this.title !== null ? this.createDynamicContent(this.title) : this.getDefaultText()
        let titleNode = this.modalHeader.querySelector(`.${Dialog.getNamespace('title')}`)
        titleNode.innerHTML = ''
        titleNode.append(title)
        titleNode.id = `${this.id}_title`

        return this
    }

    updateMessage() {
        if (!this.isRealized()) {
            return this
        }

        let message = this.createDynamicContent(this.message);
        let messageNode = this.modalBody.querySelector(`.${Dialog.getNamespace('message')}`)
        messageNode.innerHTML = ''
        messageNode.append(message);

        return this;
    }

    createDynamicContent(rawContent) {
        let content = null

        if (typeof rawContent === 'function') {
            content = rawContent.call(rawContent, this);
        } else {
            content = rawContent;
        }
        if (typeof content === 'string') {
            content = this.formatStringContent(content);
        }

        return content;
    }

    formatStringContent(content) {
        if (this.nl2br) {
            content.replace(/\r\n/g, '<br />');
            content.replace(/[\r\n]/g, '<br />');
        }

        return content;
    }

    getDefaultText() {
        return Dialog.DEFAULT_TEXTS[this.type];
    }

    updateClosable() {
        if (!this.isRealized()) {
            return this
        }

        let closeButtonNode = this.modalHeader.querySelector(`.${Dialog.getNamespace('close-button')}`)
        closeButtonNode.classList.toggle('d-none', this.isClosable)

        return this;
    }

    updateAnimate() {
        if (this.isRealized()) {
            this.modal.classList.toggle('fade', this.isAnimate());
        }

        return this;
    }

    isAnimate() {
        return this._config.animate
    }

    updateTabindex() {
        if (this.isRealized()) {
            this.modal.tabindex = this.getTabindex();
        }

        return this;
    }

    getTabindex() {
        return this._config.tabindex
    }

    get buttons() {
        return this._options.buttons
    }

    set buttons(buttons) {
        if (this._options.buttons !== buttons) {
            this._options.buttons = buttons

            this.updateButtons()
        }
    }

    addButtonObject(button) {
        this._indexedButtons[button.id] = button
        this._buttonObjects.push(button.node)
        this.modalFooter.append(button.node)
    }

    resetButtonObjects() {
        this._indexedButtons = {}

        for (let button of this._buttonObjects) {
            button.node.remove()
        }

        this._buttonObjects = []
    }

    get buttonSize() {
        if (typeof Dialog.BUTTON_SIZES[this.size] !== 'undefined') {
            return Dialog.BUTTON_SIZES[this.size];
        }

        return ''
    }

    get opened() {
        return this._opened
    }

    set opened(opened) {
        this._opened = opened
    }

    createFooterButtons() {
        this.resetButtonObjects()

        for (let button of this.buttons) {
            this.addButtonObject(new DialogButton(button, this))
        }
    }

    static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

Dialog.NAMESPACE = 'bootstrap-dialog';
Dialog.TYPE_DEFAULT = 'type-default';
Dialog.TYPE_INFO = 'type-info';
Dialog.TYPE_PRIMARY = 'type-primary';
Dialog.TYPE_SECONDARY = 'type-secondary';
Dialog.TYPE_SUCCESS = 'type-success';
Dialog.TYPE_WARNING = 'type-warning';
Dialog.TYPE_DANGER = 'type-danger';
Dialog.TYPE_DARK = 'type-dark';
Dialog.TYPE_LIGHT = 'type-light';
Dialog.TYPES = [
    Dialog.TYPE_DEFAULT,
    Dialog.TYPE_INFO,
    Dialog.TYPE_PRIMARY,
    Dialog.TYPE_SECONDARY,
    Dialog.TYPE_SUCCESS,
    Dialog.TYPE_WARNING,
    Dialog.TYPE_DARK,
    Dialog.TYPE_LIGHT,
    Dialog.TYPE_DANGER
];
Dialog.DEFAULT_TEXTS = {};
Dialog.DEFAULT_TEXTS[Dialog.TYPE_DEFAULT] = 'Default';
Dialog.DEFAULT_TEXTS[Dialog.TYPE_INFO] = 'Information';
Dialog.DEFAULT_TEXTS[Dialog.TYPE_PRIMARY] = 'Primary';
Dialog.DEFAULT_TEXTS[Dialog.TYPE_SECONDARY] = 'Secondary';
Dialog.DEFAULT_TEXTS[Dialog.TYPE_SUCCESS] = 'Success';
Dialog.DEFAULT_TEXTS[Dialog.TYPE_WARNING] = 'Warning';
Dialog.DEFAULT_TEXTS[Dialog.TYPE_DANGER] = 'Danger';
Dialog.DEFAULT_TEXTS[Dialog.TYPE_DARK] = 'Dark';
Dialog.DEFAULT_TEXTS[Dialog.TYPE_LIGHT] = 'Light';
Dialog.DEFAULT_TEXTS['OK'] = 'OK';
Dialog.DEFAULT_TEXTS['CANCEL'] = 'Cancel';
Dialog.DEFAULT_TEXTS['CONFIRM'] = 'Confirmation';
Dialog.SIZE_NORMAL = 'size-normal';
Dialog.SIZE_SMALL = 'size-small';
Dialog.SIZE_WIDE = 'size-wide';    // size-wide is equal to modal-lg
Dialog.SIZE_EXTRAWIDE = 'size-extrawide';    // size-wide is equal to modal-lg
Dialog.SIZE_LARGE = 'size-large';
Dialog.BUTTON_SIZES = {};
Dialog.BUTTON_SIZES[Dialog.SIZE_NORMAL] = '';
Dialog.BUTTON_SIZES[Dialog.SIZE_SMALL] = 'btn-small';
Dialog.BUTTON_SIZES[Dialog.SIZE_WIDE] = 'btn-block';
Dialog.BUTTON_SIZES[Dialog.SIZE_LARGE] = 'btn-lg';
Dialog.BUTTONS_ORDER_CANCEL_OK = 'btns-order-cancel-ok';
Dialog.BUTTONS_ORDER_OK_CANCEL = 'btns-order-ok-cancel';
Dialog.dialogs = {}
Dialog.defaultOptions = {
    type: Dialog.TYPE_PRIMARY,
    size: Dialog.SIZE_NORMAL,
    cssClass: '',
    title: null,
    message: null,
    nl2br: true,
    closable: true,
    closeByBackdrop: true,
    closeByKeyboard: true,
    closeIcon: '&#215;',
    spinicon: Dialog.ICON_SPINNER,
    autodestroy: true,
    draggable: false,
    animate: true,
    description: '',
    tabindex: -1,
    btnsOrder: Dialog.BUTTONS_ORDER_CANCEL_OK,
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .Modal to jQuery only if jQuery is present
 */
defineJQueryPlugin(Dialog)

export default Dialog