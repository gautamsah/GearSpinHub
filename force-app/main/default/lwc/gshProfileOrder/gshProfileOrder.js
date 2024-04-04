import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateOrderStatusApex from '@salesforce/apex/gshOrderItems.updateOrderStatus';
import { NavigationMixin } from 'lightning/navigation';

export default class GshProfileOrder extends NavigationMixin(LightningElement) {
    @api allCustomerOrders;
    @api allOrderItems;
    @api allProducts;

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
        const orderId = event.target.dataset.orderId;
        // console.log('Order ID:', orderId);
        this.updateOrderStatus(orderId);
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
                        this.showToast('Success', 'Item Ordered Successfully', 'success');
                        this.allCustomerOrders = this.allCustomerOrders.map(order => {
                            if (order.Id === orderToUpdate.Id) {
                                // Update the order status
                                return { ...order, Order_Status__c: 'Cancelled' };
                            }
                            return order;
                        });
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
}