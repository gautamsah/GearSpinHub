import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateOrderStatusApex from '@salesforce/apex/gshOrderItems.updateOrderStatus';

export default class GshProfileReview extends LightningElement {
    @api allCustomerReviews;
    @api allProducts;

    @track modalClass = 'modal fade-in-close';
    @track backdropClass = 'backdrop fade-in-close';
    selectedReview;
    editFeedback;
    

    receivedEditReviewClick(event) {
        // const reviewId = event.target.dataset.reviewId;
        // console.log('Received edit review click. Review ID:', reviewId);
        // this.selectedReview = this.allCustomerReviews.filter(review => review.Id === reviewId);
        // console.log('Selected review:', JSON.stringify(this.selectedReview));
        this.openModal();
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

    handleFeedbackChange(event) {
        this.editFeedback = event.target.value;
        console.log('Feedback changed. Updated review:', JSON.stringify(this.editFeedback));
    }
    
    updateReview(event) {
        // console.log('Updating review:', JSON.stringify(this.selectedReview));
        // Call an Apex method to update the review
        // this.updateReviewInApex(this.selectedReview);
        const reviewId = event.target.dataset.reviewId;
        // console.log('Received edit review click. Review ID:', reviewId);
        const selectedReviewproduct = this.allCustomerReviews.filter(review => review.Id === reviewId);
        
        // console.log('Selected review:', JSON.stringify(this.selectedReview));
        this.closeModal();
        this.selectedReview = null;
        this.editFeedback=null
    }
    handleStarRatingChange(event) {
        this.selectedReview= event.detail.ratingStars;
        console.log('Star rating changed. Updated review:', JSON.stringify(this.selectedReview));
    }
    openModal() {
        this.modalClass = 'modal fade-in-open';
        this.backdropClass = 'backdrop fade-in-open';
    }

    closeModal() {
        this.modalClass = 'modal fade-in-close';
        this.backdropClass = 'backdrop fade-in-close';
    }

}