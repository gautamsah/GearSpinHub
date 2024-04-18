import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateOrderStatusApex from '@salesforce/apex/gshOrderItems.updateOrderStatus';
import getOrderDetailData from '@salesforce/apex/gshOrderItems.getOrderDetailData';
import createReview from '@salesforce/apex/gshOrderItems.createReview';
import userId from "@salesforce/user/Id";
import generatePDFOnly from '@salesforce/apex/gshOrderInvoiceController.generatePDFOnly';
import generateOnlyPDF from '@salesforce/apex/gshOrderInvoiceController.generateOnlyPDF';
import { loadScript } from 'lightning/platformResourceLoader';

export default class GshOrderDetail extends NavigationMixin(LightningElement) {
    orderId;
    @track customerOrder;
    @track orderItems;
    @wire(CurrentPageReference)
    pageRef;
    orderItems;
    isLoaded = true;
    connectedCallback() {
        this.orderId = this.pageRef.state.orderId;
        getOrderDetailData({ orderId: this.orderId })
            .then(result => {
                this.customerOrder = result['customerOrder'];
                this.orderItems = result.ordersItems.map(item => ({
                    ...item,
                    showAddReview: !result.userRatings.some(rating => rating.Product__c === item.Product__c),
                    reviewStars: result.userRatings.find(rating => rating.Product__c === item.Product__c)?.Stars__c || 0,
                    subtotal: item.Quantity__c * item.Product__r.Price__c,
                }));
                this.isLoaded = false;
                this.AddReview();
                console.log('GSH log', JSON.stringify(this.orderItems));
            })
            .catch(error => {
                console.error('Error fetching order detail:', error);
            });
    }
    receivedInvoiceClick() {
        // Call the Apex method imperatively to generate the PDF
        generateOnlyPDF({ orderId: this.orderId })
            .then(result => {
                // Check if PDF blob is received
                if (result) {
                    // Convert Base64 string to Uint8Array
                    const uint8Array = new Uint8Array(atob(result).split('').map(char => char.charCodeAt(0)));
                    
                    // Create Blob object
                    const blob = new Blob([uint8Array], { type: 'application/pdf' });
                    
                    // Create URL for the blob
                    const url = window.URL.createObjectURL(blob);
                    
                    // Create link element and trigger download
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Invoice.pdf';
                    a.click();
                } else {
                    // Handle case where PDF generation failed
                    console.error('Failed to generate PDF');
                }
            })
            .catch(error => {
                // Handle error
                console.error('Error generating PDF:', error);
            });
    }
    base64ToUint8Array(base64String) {
        try {
            const binaryString = window.atob(base64String);
            const length = binaryString.length;
            const uint8Array = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
            }
            return uint8Array;
        } catch(error) {
            console.error('Error decoding Base64 string:', error);
            return null;
        }
    }
    
    AddReview() {
        this.orderItems = this.orderItems.map(item => {
            item.showAddReviewDelivered = item.showAddReview && this.customerOrder.Order_Status__c == 'Delivered';
            item.showDoneReviewDelivered = item.showAddReview == false && this.customerOrder.Order_Status__c == 'Delivered';
            return item;
        });
    }
    get orderTotal() {
        return this.customerOrder.Total_Amount__c - this.customerOrder.Shipping_Charges__c;
    }
    get isshippingChargesFree() {
        return this.customerOrder.Shipping_Charges__c == 0;
    }

    openProductPage(event) {
        event.stopPropagation();
        const productId = event.target.dataset.productId;
        // const category = event.target.dataset.category;
        // console.log(productId,'yoooooo');
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Product_Detail__c',
            },
            state: {
                'productId': productId,
                // 'productCategory':category,
            },
        });
    }

    openTrackingPage() {
        console.log('Order ID:', this.orderId);
        this[NavigationMixin.Navigate]({

            type: 'comm__namedPage',
            attributes: {
                name: 'Order_Tracking_Page__c',
            },
            state: {
                'orderId': this.orderId
            },
        });
    }


    receivedOrderCancelClick() {
        updateOrderStatusApex({ orderId: this.orderId })
            .then(result => {
                if (result == 'Successful') {
                    this.showToast('Success', 'Order Cancelled Successfully', 'success');
                    this.customerOrder.Order_Status__c = 'Cancelled';
                }
                else {
                    this.showToast('Failed', 'An Error Occured', 'error');
                }
            })
    }
    get showCancelButton() {
        return this.customerOrder.Order_Status__c != 'Cancelled' && this.customerOrder.Order_Status__c != 'Delivered' && this.customerOrder.Order_Status__c != 'Out For Delivery';
    }

    reviewProductId;
    reviewProductName;
    modalActive = false;
    feedbackContent;
    feedbackStar;
    @track modalClass = 'modal fade-in-close';
    @track backdropClass = 'backdrop fade-in-close';
    receivedReviewClick(event) {
        this.reviewProductId = event.target.dataset.productId;
        this.reviewProductName = event.target.dataset.productName;
        this.openModal();
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

    handleFeedbackChange(event) {
        this.feedbackContent = event.target.value;
    }

    createReview() {
        if (!this.feedbackContent || !this.feedbackStar) {
            this.showToast('Failed', 'Input Stars and Feedback', 'error');
        }
        else {
            createReview({ productId: this.reviewProductId, feedback: this.feedbackContent, star: this.feedbackStar })
                .then(result => {
                    if (result == 'Successful') {
                        this.showToast('Success', 'Review Created Successfully', 'success');
                        this.closeModal();
    
                        // Update orderItems array with the new review data
                        this.orderItems = this.orderItems.map(item => {
                            if (item.Product__c === this.reviewProductId) {
                                return { ...item, showAddReviewDelivered: false, showDoneReviewDelivered: true, reviewStars: this.feedbackStar };
                            }
                            return item;
                        });
                    }
                    else if (result == 'Already Exists') {
                        // Handle if the review already exists
                    }
                    else {
                        this.showToast('Failed', 'An Error Occurred', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error creating review:', error);
                    this.showToast('Failed', 'An Error Occurred', 'error');
                });
        }
    }
    
    handleStarRatingChange(event) {
        this.feedbackStar = event.detail.ratingStars;
        console.log('Star rating changed. Updated review:', this.feedbackStar);
    }
    openModal() {
        this.modalActive = true;
        this.modalClass = 'modal fade-in-open';
        this.backdropClass = 'backdrop fade-in-open';
    }

    closeModal() {
        this.modalClass = 'modal fade-in-close';
        this.backdropClass = 'backdrop fade-in-close';
        this.modalActive = false;
    }
    modal2Active=false;
    open2Modal() {
        this.modal2Active = true;
        this.modalClass = 'modal fade-in-open';
        this.backdropClass = 'backdrop fade-in-open';
    }

    close2Modal() {
        this.modalClass = 'modal fade-in-close';
        this.backdropClass = 'backdrop fade-in-close';
        this.modal2Active = false;
    }
}