import { LightningElement, track } from 'lwc';
import getCartItems from '@salesforce/apex/gshCartItems.getCartItems';
import { NavigationMixin } from 'lightning/navigation';
import gshOrderItems from '@salesforce/apex/gshOrderItems.gshOrderItems';
import updateCartItems from '@salesforce/apex/gshCartItems.updateCartItems';
import getCartPageData from '@salesforce/apex/gshCartItems.getCartPageData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import userId from "@salesforce/user/Id";

export default class GshCartDetail extends NavigationMixin(LightningElement) {
    userIdvar = userId;
    @track cartItemsDeleted = [];
    @track cartItems = [];
    @track selectedPaymentMethod='Wallet';
    accountDetails;
    walletBalance=0;
    isLoaded = true;
    orderTotal = 0;
    grandTotal = 0;
    shippingCharges=100;
    isshippingChargesFree=false;
    // renderedCallback() {
    connectedCallback() {
        console.log('Connected Callback Ran');
        // getCartItems({ userId: this.userIdvar }).then((result) => {
        // console.log(JSON.stringify(result));
        // this.cartItems = result;
        // this.isLoaded = false;
        // this.calculateSubtotals();
        getCartPageData({ userId: this.userIdvar }).then((result) => {
            console.log(JSON.stringify(result));
            // console.log('Data: ', result);
            this.cartItems = result['cartItems'].map(item => ({ ...item })); // Clone each object
            this.accountDetails = result['accountDetails'];
            this.walletBalance=parseFloat(this.accountDetails.Wallet_Amount__c);
            // console.log(this.cartItems);
            // console.log(this.accountDetails);
            this.isLoaded = false;
            this.calculateSubtotals();
            this.calculateGrandTotals();
        })
            .catch((error) => {
                // console.log(error);
                console.error('Error fetching data:', error);
            });
    }

    // disconnectedCallback(){
    //     this.updateCart();
    // }


    calculateGrandTotals() {
        this.orderTotal = 0;
        this.cartItems.forEach(item => {
            this.orderTotal += item.subtotal;
        });
        if (this.orderTotal > 5000) {
            this.isshippingChargesFree=true;
            this.shippingCharges = 0;
            this.grandTotal = this.orderTotal;
        } else if (this.orderTotal <= 5000 && this.orderTotal > 0) {
            this.isshippingChargesFree=false;
            this.shippingCharges = 100;
            this.grandTotal = this.orderTotal + this.shippingCharges;
        }
        console.log('Shipping Charges:', this.shippingCharges);
    }
    

    calculateSubtotals() {
        this.cartItems = this.cartItems.map(item => {
            item.subtotal = item.Quantity__c * item.Product__r.Price__c;
            item.fullName = item.Product__r.Name + " - " + item.Size__c + ", " + item.Color__c;
            return item;
        });
    }

    increaseQuantity(event) {
        const index = event.target.dataset.index;
        const cartItem = this.cartItems[index];
        if (cartItem.Quantity__c < cartItem.Product__r.Available_Stock__c) {
            cartItem.Quantity__c++;
            cartItem.subtotal = cartItem.Quantity__c * cartItem.Product__r.Price__c;
            this.cartItems = [...this.cartItems];
            this.calculateGrandTotals();
        }
    }

    decreaseQuantity(event) {
        const index = event.target.dataset.index;
        const cartItem = this.cartItems[index];
        if (cartItem.Quantity__c > 1) {
            cartItem.Quantity__c--;
            cartItem.subtotal = cartItem.Quantity__c * cartItem.Product__r.Price__c;
            this.cartItems = [...this.cartItems];
            this.calculateGrandTotals();
        }
    }

    removeItem(event) {
        const index = event.target.dataset.index;
        const updatedCartItems = [...this.cartItems];
        const cartItemToDelete = updatedCartItems[index];
        cartItemToDelete.Quantity__c = 0;
        this.cartItemsDeleted.push(cartItemToDelete);
        updatedCartItems.splice(index, 1);
        this.cartItems = updatedCartItems;
        console.log(this.cartItems);
        console.log(this.cartItemsDeleted);
        console.log(JSON.stringify(this.cartItems));
        console.log(JSON.stringify(this.cartItemsDeleted));
        this.calculateGrandTotals();
    }

    handlePaymentMethodChange(event) {
        this.selectedPaymentMethod = event.target.value;
    }

    updateCart() {
        updateCartItems({ cartItems: this.cartItems, cartItemsDeleted: this.cartItemsDeleted }).then((result) => {
            console.log('Updated cart = ', result);
            if (result == 'Successful') {
                this.showToast('Success', 'Updated Cart', 'success');
            } else {
                this.showToast('Failed', 'An Error Occured', 'error');
            }
        })
            .catch((error) => {
                console.log(error);
            });
    }

    receivedUpdateCartClick() {
        this.updateCart();
    }
    
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }
    

    receivedCheckoutClick(){
        gshOrderItems({ userId: this.userIdvar, payment: this.selectedPaymentMethod, grandtotal: this.grandTotal, shippingCharges:this.shippingCharges }).then((result) => {
            console.log('Order Update = ', result);
            if (result == 'Successful') {
                this.showToast('Success', 'Item Ordered Successfully', 'success');
            }
            else if(result == 'Low Balance'){
                this.showToast('Failed', 'Insufficient Balance', 'error');
            }
            else {
                this.showToast('Failed', 'An Error Occured', 'error');
            }
        })
            .catch((error) => {
                console.log(error);
            });
    }

    get hasShippingAddress() {
        return this.accountDetails &&
            (this.accountDetails.ShippingStreet &&
            this.accountDetails.ShippingCity &&
            this.accountDetails.ShippingState &&
            this.accountDetails.ShippingPostalCode);
    }
    get hasBillingAddress() {
        return this.accountDetails &&
            (this.accountDetails.BillingStreet &&
            this.accountDetails.BillingCity &&
            this.accountDetails.BillingState &&
            this.accountDetails.BillingPostalCode);
    }
    openProductPage(event){
        const productId = event.target.dataset.productId;
        const category = event.target.dataset.category;
        console.log(productId,'yoooooo',category);
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
}

// handleSelectionChange(event) {
//     const itemId = event.target.dataset.itemId;
//     const type = event.target.dataset.type;
//     const selectedValue = event.target.value;
//     const cartItem = this.cartItems.find(item => item.id === itemId);
//     if (type === 'color') {
//         cartItem.color = selectedValue;
//     } else if (type === 'size') {
//         cartItem.size = selectedValue;
//     }
//     this.calculateSubtotals();
// }