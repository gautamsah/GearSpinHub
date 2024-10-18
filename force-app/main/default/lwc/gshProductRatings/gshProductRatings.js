import { LightningElement, wire, track, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import getAllRatings from '@salesforce/apex/gshGetAllRatings.getAllRatings';
import gshProductRatings from './gshProductRatings.html';
import gshProductRatingsStencil from './gshProductRatingsStencil.html';
export default class GshProductRatings extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference)
    pageRef;
    productId;
    reviewExists=false;
    @track allReviews;

    @api dateString = "2024-03-20";
    formattedDate;

    //new
    isLoading = true;

    render() {
        console.log("render function called",this.isLoading);
        return this.isLoading ? gshProductRatingsStencil : gshProductRatings;
    }

    connectedCallback() {
        this.productId = this.pageRef.state.productId;
        getAllRatings({ productId: this.productId}).then((result) => {
            this.allReviews = result;
            this.reviewExists = result.length > 0;
            this.formatDateFunc();
            console.log(JSON.stringify(this.allReviews));
            this.isLoading = false;
        }).catch((error) => {
            console.log(error);
        })
    }
    formatDateFunc(){
        this.allReviews = this.allReviews.map(review => {
            if (review.Rating_Date__c) {
                const dateObj = new Date(review.Rating_Date__c);
                const options = { month: 'long', day: 'numeric', year: 'numeric' };
                review.formattedDate = new Intl.DateTimeFormat('en-US', options).format(dateObj);
            }
            // if (!review.Customer_Name__r.Profile_Pic__c) {
            //     review.Customer_Name__r.Profile_Pic__c="https://raw.githubusercontent.com/gautamsah/GearSpinHub/main/resources/user_nodp2.jpg";
            // }
            return review;
        });
    }
}