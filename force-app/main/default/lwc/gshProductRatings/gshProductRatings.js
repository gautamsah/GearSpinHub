import { LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import DATA_MESSAGE_CHANNEL from '@salesforce/messageChannel/MyMessageChannel__c';
import getAllRatings from '@salesforce/apex/gshAllProducts.getAllRatings';

export default class GshProductRatings extends LightningElement {
    @track rating = 1;
    @track comment = '';
    @track reviews = []; // Array to store existing reviews

    handleRatingChange(event) {
        this.rating = event.target.value;
    }

    handleCommentChange(event) {
        this.comment = event.target.value;
    }

    handleSubmitReview() {
        // Create new review object
        const newReview = {
            id: this.reviews.length + 1,
            rating: this.rating,
            comment: this.comment
        };

        // Add new review to the reviews array
        this.reviews = [...this.reviews, newReview];

        // Reset input fields
        this.rating = 1;
        this.comment = '';
    }
}