import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateReview from '@salesforce/apex/gshOrderItems.updateReview';

export default class GshProfileReview extends LightningElement {
    @api allCustomerReviews;
    @api allProducts;
    @track modalClass = 'modal fade-in-close';
    @track backdropClass = 'backdrop fade-in-close';
    selectedRecordId;
    selectedReview;
    editStar;
    editFeedback;
    modalActive=false;

    get showNoContentText(){
        if (this.allCustomerReviews.length==0) {
            return true;
        }
    }

    receivedEditReviewClick(event) {
        this.selectedRecordId = event.target.dataset.reviewId;
        console.log('Received edit review click. Review ID:', this.selectedRecordId);
        this.selectedReview = this.allCustomerReviews.find(review => review.Id === this.selectedRecordId);
        this.editStar=this.selectedReview.Stars__c;
        this.editFeedback=this.selectedReview.Review__c;
        console.log(this.editStar, this.editFeedback);
        this.openModal();
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

    handleFeedbackChange(event) {
        this.editFeedback = event.target.value;
    }
    
    updateReview() {
        console.log('Updating review:', JSON.stringify(this.selectedReview));
        console.log(this.selectedRecordId);
        updateReview({ recordId: this.selectedRecordId, feedback: this.editFeedback, star: this.editStar })
            .then(result => {
                if (result == 'Successful') {
                    this.showToast('Success', 'Review Updated Successfully', 'success');
                    this.allCustomerReviews = this.allCustomerReviews.map(item => {
                        if (item.Id === this.selectedRecordId) {
                            return {
                                ...item,
                                Review__c: this.editFeedback,
                                Stars__c: this.editStar,
                            };
                        }
                        return item;
                    });
                    console.log('Updated review:', JSON.stringify(this.allCustomerReviews));
                }
                else {
                    this.showToast('Failed', 'An Error Occured', 'error');
                }
            })
            .catch(error => {
                console.error('Error fetching order detail:', error);
            });
        // console.log('Selected review:', JSON.stringify(this.selectedReview));
        this.closeModal();

    }
    handleStarRatingChange(event) {
        this.editStar= event.detail.ratingStars;
        console.log('Star rating changed. Updated review:', this.editStar);
    }
    openModal() {
        this.modalActive=true;
        this.modalClass = 'modal fade-in-open';
        this.backdropClass = 'backdrop fade-in-open';
    }

    closeModal() {
        this.modalClass = 'modal fade-in-close';
        this.backdropClass = 'backdrop fade-in-close';
        // this.selectedReview = null;
        // this.selectedRecordId = null;
        // this.editStar = null;
        // this.editFeedback = null;
        this.modalActive=false;
    }

}