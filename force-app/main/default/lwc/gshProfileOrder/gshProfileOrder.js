import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateOrderStatusApex from '@salesforce/apex/gshOrderItems.updateOrderStatus';
import { NavigationMixin } from 'lightning/navigation';

export default class GshProfileOrder extends NavigationMixin(LightningElement) {
    @api allCustomerOrders;
    @api allOrderItems;
    @api allProducts;

    PAGE_SIZE = 5;

    @track pageNumber = 1;
    @track isFirstPage = true;
    @track isLastPage = false;
    displayedOrders;
    orderId;
    connectedCallback() {
        if (this.orderDetails) {
            this.updateDisplayedOrders();
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    updateDisplayedOrders() {
        const startIndex = (this.pageNumber - 1) * this.PAGE_SIZE;
        const endIndex = startIndex + this.PAGE_SIZE;
        this.displayedOrders = this.orderDetails.slice(startIndex, endIndex);
        this.isFirstPage = this.pageNumber === 1;
        this.isLastPage = endIndex >= this.orderDetails.length;
    }

    previousPage() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.updateDisplayedOrders();
        }
    }

    nextPage() {
        if (!this.isLastPage) {
            this.pageNumber++;
            this.updateDisplayedOrders();
        }
    }


    get orderDetails() {
        return this.allCustomerOrders.map(order => ({
            ...order,
            showCancelButton: this.showCancelButton(order.Order_Status__c),
            showReviewButton: this.showReviewButton(order.Order_Status__c)
        }));
    }
    showCancelButton(orderStatus) {
        return orderStatus !== 'Delivered' && orderStatus !== 'Cancelled' && orderStatus !== 'Out For Delivery';
    }
    showReviewButton(orderStatus) {
        return orderStatus === 'Delivered';
    }

    receivedOrderCancelClick(event) {
        // const orderId = event.target.dataset.orderId;
        // console.log('Order ID:', orderId);
        this.updateOrderStatus(this.orderId);
    }
    receivedReviewClick(event) {
        const orderId = event.target.dataset.orderId;
        // console.log('Order ID:', orderId);
    }
    onOrderDetailClick(event) {
        const orderId = event.target.dataset.orderId;
        console.log(JSON.stringify(this.allOrderItems));
        console.log('Order ID:', orderId);
        this[NavigationMixin.Navigate]({

            type: 'comm__namedPage',
            attributes: {
                name: 'Order_Detail__c',
            },
            state: {
                'orderId': orderId
            },
        });
    }
    updateOrderStatus(orderId) {
        // Find the order to update
        const orderToUpdate = this.allCustomerOrders.find(order => order.Id === orderId);
        if (orderToUpdate) {
            // Call the Apex method to update the order status
            updateOrderStatusApex({ orderId: orderToUpdate.Id })
                .then(result => {
                    // console.log('Order status updated successfully:', result);
                    if (result == 'Successful') {
                        this.showToast('Success', 'Ordered Cancelled Successfully', 'success');
                        this.allCustomerOrders = this.allCustomerOrders.map(order => {
                            if (order.Id === orderToUpdate.Id) {
                                // Update the order status
                                return { ...order, Order_Status__c: 'Cancelled' };
                            }
                            return order;
                        });
                        this.updateDisplayedOrders();
                    }
                    else {
                        this.showToast('Failed', 'An Error Occured', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error updating order status:', error);
                });
        } else {
            console.error('Order not found:', orderId);
        }
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

    get totalPage() {
        const totalPage = Math.ceil(this.orderDetails.length / this.PAGE_SIZE);
        console.log('Total page:', totalPage);
        return totalPage;
    }
    modalClass = 'modal fade-in-close';
    backdropClass = 'backdrop fade-in-close';
    modalActive=false;
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
    orderCancelModalClick(event) {
        this.orderId = event.target.dataset.orderId;
        this.openModal();
    }

    get showPagination(){
        if(this.allCustomerOrders.length==0){
            return false;
        }
        else{
            return true;
        }
    }
}