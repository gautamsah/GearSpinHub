import { LightningElement, api } from 'lwc';

export default class GshInput extends LightningElement {
    @api inputLabel;
    @api inputType;
    @api inputPlaceholder;
    @api fieldName;
    @api variant;
    inputValue='';
    handleChange(event) {
        this.inputValue = event.target.value;
        console.log('input value in child ' + this.inputValue);
        this.dispatchEvent(
            new CustomEvent("changeinput", {
                detail: {
                    fieldValue:this.inputValue,
                    fieldName:this.fieldName
                }
            })
        );
    }

    get inputStyle(){
        return this.variant=='register' ? 'register-input ' : 'default-input';
    }
}