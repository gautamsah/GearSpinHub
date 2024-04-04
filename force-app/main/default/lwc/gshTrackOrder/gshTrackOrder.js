import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import TrackOrder from '@salesforce/apex/gshTrackOrder.TrackOrder';

export default class GshTrackOrder extends NavigationMixin(LightningElement) {
    @track orderDetails;
    @track orderId;
    @track showDetails = false;
    @track error;

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
                url: '/order-tracking-page?orderId='+this.orderId
            }
        });
    }
}
