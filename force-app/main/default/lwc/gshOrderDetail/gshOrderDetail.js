import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateOrderStatusApex from '@salesforce/apex/gshOrderItems.updateOrderStatus';
import getOrderDetailData from '@salesforce/apex/gshOrderItems.getOrderDetailData';
import userId from "@salesforce/user/Id";

export default class GshOrderDetail extends NavigationMixin(LightningElement) {
    orderId;
    @track customerOrder;
    @track orderItems;
    @wire(CurrentPageReference)
    pageRef;
    orderItems;
    isLoaded=true;
    connectedCallback() {
        this.orderId = this.pageRef.state.orderId;
        getOrderDetailData({ orderId: this.orderId })
            .then(result => {
                this.customerOrder=result['customerOrder'];
                this.orderItems = result.ordersItems.map(item => ({
                    ...item,
                    showAddReview: !result.userRatings.some(rating => rating.Product__c === item.Product__c),
                    reviewStars: result.userRatings.find(rating => rating.Product__c === item.Product__c)?.Stars__c || 0,
                    subtotal: item.Quantity__c * item.Product__r.Price__c,
                }));
                this.isLoaded=false;
                this.AddReview();
                console.log('GSH log', JSON.stringify(this.orderItems));
            })
            .catch(error => {
                console.error('Error fetching order detail:', error);
            });
    }
    AddReview() {
        this.orderItems = this.orderItems.map(item => {
            item.showAddReviewDelivered= item.showAddReview && this.customerOrder.Order_Status__c == 'Delivered';
            item.showDoneReviewDelivered= item.showAddReview==false && this.customerOrder.Order_Status__c == 'Delivered';
            return item;
        });
    }
    get orderTotal(){
        return this.customerOrder.Total_Amount__c-this.customerOrder.Shipping_Charges__c;
    }
    get isshippingChargesFree(){
        return this.customerOrder.Shipping_Charges__c==0;
    }
    
    openProductPage(event){
        event.stopPropagation();
        const productId = event.target.dataset.productId;
        const category = event.target.dataset.category;
        console.log(productId,'yoooooo',category, event.target);
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Product_Detail__c',
            },
            state: {
                'productId': productId,
                'productCategory':category,
            },
        });
    }

    receivedOrderCancelClick() {
        updateOrderStatusApex({ orderId: this.orderId })
                .then(result => {
                    if (result == 'Successful') {
                        this.showToast('Success', 'Order Cancelled Successfully', 'success');
                        this.customerOrder.Order_Status__c='Cancelled';
                    }
                    else {
                        this.showToast('Failed', 'An Error Occured', 'error');
                    }
                })
    }
    get showCancelButton(){
        return this.customerOrder.Order_Status__c!='Cancelled' && this.customerOrder.Order_Status__c!='Delivered' && this.customerOrder.Order_Status__c!='Out For Delivery';
    }

    receivedReviewClick(event){
        const productId = event.target.dataset.productId;
        
    }
}
