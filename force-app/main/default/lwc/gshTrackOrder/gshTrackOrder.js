import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import TrackOrder from '@salesforce/apex/gshTrackOrder.TrackOrder';

export default class GshTrackOrder extends NavigationMixin(LightningElement) {
    @track orderDetails;
    @track orderId;
    @track showDetails = false;
    @track error;

    stepOrderPlaced = 'black';
    stepOrderCancelled = 'red';
    stepOrderShipped = 'black';
    stepOrderInTransit = 'black';
    stepOrderOutForDelivery = 'black';
    stepOrderDelivered = 'black';


    @wire(CurrentPageReference)
    pageRef;

    connectedCallback() {
        if (this.pageRef.state.orderId) {
            this.orderId = this.pageRef.state.orderId;
            this.trackOrders();
        }
    }

    trackOrders() {
        TrackOrder({ orderId: this.orderId })
            .then(result => {
                this.orderDetails = result[0]; // Access the first record in the list
                this.error = null; // Clear any previous error
                this.getProgress();
                this.showDetails = true; // Show details
            })
            .catch(error => {
                this.error = error;
                this.orderDetails = null; // Reset orderDetails if there's an error
                this.showDetails = false; // Hide details
            });
    }

    handleSearchInput(event) {
        this.orderId = event.target.value;
    }

    handleSearch() {
        this.trackOrders();
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/order-tracking-page?orderId=' + this.orderId
            }
        });
    }
    progressBar;
    showCancel = false;
    getProgress() {
        if (this.orderDetails.Order_Status__c === "Order Placed") {
            this.stepOrderPlaced = 'green';
            this.stepOrderCancelled = 'red';
            this.stepOrderShipped = 'black';
            this.stepOrderInTransit = 'black';
            this.stepOrderOutForDelivery = 'black';
            this.stepOrderDelivered = 'black';
            this.progressBar = 's1';
        }
        else if (this.orderDetails.Order_Status__c === "Cancelled") {
            this.stepOrderPlaced = 'green';
            this.stepOrderCancelled = 'red';
            this.stepOrderShipped = 'black';
            this.stepOrderInTransit = 'black';
            this.stepOrderOutForDelivery = 'black';
            this.stepOrderDelivered = 'black';
            this.showCancel = true;
            this.progressBar = 's6';
        }
        else if (this.orderDetails.Order_Status__c === "Shipped") {
            this.stepOrderPlaced = 'green';
            this.stepOrderCancelled = 'red';
            this.stepOrderShipped = 'green';
            this.stepOrderInTransit = 'black';
            this.stepOrderOutForDelivery = 'black';
            this.stepOrderDelivered = 'black';
            this.progressBar = 's2';
        }
        else if (this.orderDetails.Order_Status__c === "In Transit") {
            this.stepOrderPlaced = 'green';
            this.stepOrderCancelled = 'red';
            this.stepOrderShipped = 'green';
            this.stepOrderInTransit = 'green';
            this.stepOrderOutForDelivery = 'black';
            this.stepOrderDelivered = 'black';
            this.progressBar = 's3';
        }
        else if (this.orderDetails.Order_Status__c === "Out for Delivery") {
            this.stepOrderPlaced = 'green';
            this.stepOrderCancelled = 'red';
            this.stepOrderShipped = 'green';
            this.stepOrderInTransit = 'green';
            this.stepOrderOutForDelivery = 'green';
            this.stepOrderDelivered = 'black';
            this.progressBar = 's4';
        }
        else if (this.orderDetails.Order_Status__c === "Delivered") {
            this.stepOrderPlaced = 'green';
            this.stepOrderCancelled = 'red';
            this.stepOrderShipped = 'green';
            this.stepOrderInTransit = 'green';
            this.stepOrderOutForDelivery = 'green';
            this.stepOrderDelivered = 'green';
            this.progressBar = 's5';
        }
    }






}