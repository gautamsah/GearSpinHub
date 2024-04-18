import { LightningElement } from 'lwc';

export default class GshFeaturesBanner extends LightningElement {

    renderedCallback() {
        const style = document.createElement('style');
        style.innerText = `.slds-carousel__content {
            display: none;
        }
        .slds-carousel__autoplay {
            display: none;
        }
        .slds-carousel__indicator-action.slds-is-active, .slds-carousel__indicator-action.slds-is-active:hover {
            background: rgb(255 0 0);
            border-color: rgb(255 0 0);
        }
        .slds-carousel__indicator-action.slds-is-active, .slds-carousel__indicator-action.slds-is-active:hover {
            background: rgb(255 0 0);
            border-color: rgb(255 0 0);
        }
        .slds-carousel__indicator-action:active{
            background: rgb(255 0 0);
            border-color: rgb(255 0 0);
        }
        `;
        this.template.querySelector('lightning-carousel').appendChild(style);
    }
//     get getBackgroundImage(){
//         return `background-image:url("${this.imageUrl}")`;
//     }
    // renderedCallback(){
    //     let element = this.template.querySelector('.bg');
    //     element.style.backgroundImage = `url("https://raw.githubusercontent.com/gautamsah/GearSpinHub/main/resources/home_bg.jpg")`;
    // }
}