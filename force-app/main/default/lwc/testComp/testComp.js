// export default class TestComp extends LightningElement {


import { LightningElement, track } from 'lwc';

export default class ModalWithButton extends LightningElement {
    @track modalClass = 'modal fade-in-close';
    @track backdropClass = 'backdrop fade-in-close';

    openModal() {
        this.modalClass = 'modal fade-in-open';
        this.backdropClass = 'backdrop fade-in-open';
    }

    closeModal() {
        this.modalClass = 'modal fade-in-close';
        this.backdropClass = 'backdrop fade-in-close';
    }
}
