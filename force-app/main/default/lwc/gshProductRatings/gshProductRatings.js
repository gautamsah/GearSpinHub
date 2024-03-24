import { LightningElement, wire, track, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import getAllRatings from '@salesforce/apex/gshAllProducts.getAllRatings';

export default class GshProductRatings extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference)
    pageRef;
    productId;
    @track allReviews;

    @api dateString = "2024-03-20";
    formattedDate;

    connectedCallback() {
        this.productId = this.pageRef.state.productId;
        getAllRatings({ productId: this.productId}).then((result) => {
            this.allReviews = result;
            this.formatDateFunc();
            console.log(JSON.stringify(this.allReviews));
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
            if (!review.Customer_Name__r.Profile_Pic__c) {
                review.Customer_Name__r.Profile_Pic__c="";
            }
            return review;
        });
    }
}