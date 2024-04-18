import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import Id from "@salesforce/user/Id";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class GshProductCard extends NavigationMixin(LightningElement) {
    @api productId;
    @api productName;
    @api productDescription;
    @api productCategory;
    @api productPrice;
    @api productImage;
    @api productRating;
    @api productConsumed;
    @api productAvailable;

    // get getBackgroundImage(){
    //     return `background:url("${this.productImage}")`;
    // }

    connectedCallback(){
        console.log('productRating is ', this.productRating);
    }

    recieveClickedData(event){
        console.log('Product Id ', this.productId);
        console.log(event.detail.isClicked);
        this.dispatchEvent(
            new CustomEvent("productclick", {
                detail:{productId:this.productId}
            })
        );
    }
    // get star1(){
    //     return this.productRating >= 1 ? true: false;
    // }
    // get star2(){
    //     return this.productRating >= 2 ? true: false;
    // }
    // get star3(){
    //     return this.productRating >= 3 ? true: false;
    // }
    // get star4(){
    //     return this.productRating >= 4 ? true: false;
    // }
    // get star5(){
    //     return this.productRating >= 5 ? true: false;
    // }

    openproductdetail(event) {
        // Get the product Id from the clicked product card
        // const productId = event.currentTarget.dataset.productid;

        // Navigate to the product detail page
        console.log("clicked card with pid ", this.productId);
        this[NavigationMixin.Navigate]({

            type: 'comm__namedPage',
            attributes: {
                name: 'Product_Detail__c',
            },
            state: {
                'productId': this.productId,
                // 'productCategory':this.productCategory,
            },
        });
    }

    get soldOutStatus(){
        if(this.productAvailable==0){
            return true;
        }
        else{
            return false;
        }
    }

    // handleCardClick(event) {
    //     // Check if the clicked element is a star
    //     if (event.target.classList.contains('star')) {
    //         // Handle rating action here
    //         this.handleRatingClick();
    //     } else {
    //         // Handle card click action here (navigate to another page)
    //         // Define the page reference for the destination page
    //         const pageReference = {
    //             type: 'standard__webPage',
    //             attributes: {
    //                 url: 'https://example.com/destination-page' // Replace with your destination page URL
    //             }
    //         };

    //         // Navigate to the destination page
    //         this[NavigationMixin.Navigate](pageReference);
    //     }
    // }
}