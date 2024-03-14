import { LightningElement, api } from 'lwc';

export default class GshButton extends LightningElement {

    @api buttonLabel;
    @api buttonName;
    @api variant;
    isClicked;
    mouseClick(event) {
        this.isClicked = true;
        console.log('Button in child component clicked is ' + this.isClicked);
        this.dispatchEvent(
            new CustomEvent("clickbutton", {
                detail: {
                    isClicked:this.isClicked
                }
            })
        );
    }

    get buttonStyle(){
        return this.variant=='register' ? 'register-button' : 'default-button';
    }
}