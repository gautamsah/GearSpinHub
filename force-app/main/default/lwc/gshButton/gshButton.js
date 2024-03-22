import { LightningElement, api } from 'lwc';

export default class GshButton extends LightningElement {

    @api buttonLabel;
    @api buttonName;
    @api variant;
    isClicked;
    mouseClick() {
        this.isClicked=true;
        this.dispatchEvent(
            new CustomEvent("clickbutton", {
                detail:{isClicked: this.isClicked}
            })
        );
    }

    get buttonStyle(){
        if(this.variant=='register'){
            return 'register-button';
        }
        else if(this.variant=='addtocart'){
            return 'addtocart-button';
        }
        else if(this.variant=='buynow'){
            return 'buynow-button';
        }
        else{
            return 'default-button';
        }
    }
}