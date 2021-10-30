
import {newGuid} from './util/index'
import {defineJQueryPlugin} from 'bootstrap/js/src/util/index'
import Dialog from "./dialog"

class DialogButton {
    constructor(options, dialog) {
        this._options = {
            ...DialogButton.defaultConfig,
            ...options
        }

        this._dialog = dialog
        this._disabled = false

        this._registeredButtonHotkeys = {}
        this._id = this._options.id ? this._options.id : newGuid()
        this._node = null
        this._iconNode = null
        this._spinNode = null

        this.initButtonNode()
    }

    createButtonIcon(config) {
        let node = document.createElement('span')
        node.classList.add(Dialog.getNamespace('button-icon'))
        node.classList.add(config)

        return node
    }

    initButtonNode() {
        this._node = document.createElement('button')
        this._node.classList.add('btn')
        this._node.id = this.id

        // Icon
        if (this._options.icon !== undefined && this._options.icon.trim() !== '') {
            this._iconNode = this.createButtonIcon(this._options.icon)
            this._node.append(this._iconNode);
        }

        // Label
        if (this._options.label !== undefined) {
            this._node.append(this._options.label);
        }

        // title
        if (this._options.title !== undefined) {
            this._node.title = this._options.title
        }

        // Css class
        if (this._options.cssClass && this._options.cssClass.trim() !== '') {
            this._node.classList.add(this._options.cssClass);
        } else {
            this._node.classList.add('btn-secondary');
        }

        // Data attributes
        if (typeof this._options.data === 'object' && this._options.data.constructor === {}.constructor) {
            for (let key in this._options.data) {
                this._node.dataset[key] = this._options.data[key]
            }
        }

        // Hotkey
        if (this._options.hotkey !== undefined) {
            this._registeredButtonHotkeys[this._options.hotkey] = this._node;
        }

        // Button on click
        this._node.addEventListener('click', this.buttonDidClick.bind(this))

        //Initialize enabled or not
        if (this._options.enabled !== undefined) {
            this._node.toggleEnable(this._options.enabled);
        }

        this._node.classList.add('bootstrap5-dialog-button');

        return this._node;
    }

    toggleEnable(enable) {
        if (enable !== undefined) {
            this._disabled = !enable
        } else {
            this._disabled = !this._disabled
        }

        this._node.classList.toggle('disabled', this._disabled)
    }

    enable() {
        this.toggleEnable(true)
    }

    disable() {
        this.toggleEnable(false)
    }

    toggleSpin(spin) {
        if (spin) {
            // on
            if (this._spinNode === null) {
                this._spinNode = this.createButtonIcon(this.spinIcon)
                this._spinNode.classList.add('icon-spin')
            }
            this._node.prepend(this._spinNode)
            this._spinNode.classList.add('d-none')

            if (this._iconNode !== null) {
                this._iconNode.classList.add('d-none')
            }
        }
        else {
            // off
            if (this._spinNode !== null) {
                this._spinNode.classList.add('d-none')
            }

            if (this._iconNode !== null) {
                this._iconNode.classList.remove('d-none')
            }
        }
    }

    get spinIcon() {
        return this._options.spinicon;
    }

    spin() {
        this.toggleSpin(true);
    }

    stopSpin() {
        this.toggleSpin(false);
    }

    get id() {
        return this._id
    }

    get node() {
        return this._node
    }

    buttonDidClick(event) {
        if (this._options.autospin) {
            this.toggleSpin(true)
        }

        if (typeof this._options.action === 'function') {
            return this._options.action.call(this, this._dialog, event);
        }
    }
}
DialogButton.defaultConfig = {
    autospin: false,
    action: null,
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .Modal to jQuery only if jQuery is present
 */
defineJQueryPlugin(DialogButton)

export default DialogButton