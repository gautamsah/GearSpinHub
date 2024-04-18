import { LightningElement, track } from 'lwc';
import generateAndSendOTP from '@salesforce/apex/gshPaymentHandler.generateAndSendOTP';
import { NavigationMixin } from 'lightning/navigation';
import gshOrderItems from '@salesforce/apex/gshOrderItems.gshOrderItems';
import updateCartItems from '@salesforce/apex/gshCartItems.updateCartItems';
import getCartPageData from '@salesforce/apex/gshCartItems.getCartPageData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import userId from "@salesforce/user/Id";
import generatePDF from '@salesforce/apex/gshOrderInvoiceController.generatePDF';

export default class GshCartDetail extends NavigationMixin(LightningElement) {
    userIdvar = userId;
    @track cartItemsDeleted = [];
    @track cartItems = [];
    @track selectedPaymentMethod = 'Wallet';
    accountDetails;
    walletBalance = 0;
    isLoaded = true;
    orderTotal = 0;
    grandTotal = 0;
    shippingCharges = 100;
    isshippingChargesFree = false;

    connectedCallback() {
        getCartPageData({ userId: this.userIdvar }).then((result) => {
            this.cartItems = result['cartItems'].map(item => ({ ...item }));
            this.accountDetails = result['accountDetails'];
            this.walletBalance = parseFloat(this.accountDetails.Wallet_Amount__c);
            this.isLoaded = false;
            this.calculateSubtotals();
            this.calculateGrandTotals();
        })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }

    calculateGrandTotals() {
        this.orderTotal = 0;
        this.cartItems.forEach(item => {
            this.orderTotal += item.subtotal;
        });
        if (this.orderTotal > 5000) {
            this.isshippingChargesFree = true;
            this.shippingCharges = 0;
            this.grandTotal = this.orderTotal;
        } else if (this.orderTotal <= 5000 && this.orderTotal > 0) {
            this.isshippingChargesFree = false;
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
        if (this.cartItems.length === 0) {
            this.grandTotal = 0;
            this.orderTotal = 0;
            this.isshippingChargesFree = false;
            this.shippingCharges = 0;
        } else {
            this.calculateGrandTotals();
        }
    }

    handlePaymentMethodChange(event) {
        this.selectedPaymentMethod = event.target.value;
    }

    updateCart() {
        if (this.cartItems.length === 0 && this.cartItemsDeleted.length === 0) {
            this.showToast('Empty Cart', 'Your cart is empty', 'warning');
            return;
        }
        else {
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
    }

    receivedUpdateCartClick() {
        this.updateCart();
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

    otp;
    isOTPVerified = false;
    enteredOTP;
    modalActive = false;

    genButtonDisabled = true;
    countdown = 30;
    get genButtonLabel() {
        return this.genButtonDisabled ? `Resend OTP in ${this.countdown} seconds` : 'Generate OTP';
    }

    receivedCheckoutClick() {
        if (!this.accountDetails.ShippingStreet || !this.accountDetails.ShippingCity || !this.accountDetails.ShippingState || !this.accountDetails.ShippingPostalCode || !this.accountDetails.BillingStreet || !this.accountDetails.BillingCity || !this.accountDetails.BillingState || !this.accountDetails.BillingPostalCode) {
            this.showToast('Failed', 'Enter Shipping & Billing Details', 'error');
        }
        else {
            if (this.walletBalance < this.grandTotal) {
                this.showToast('Failed', 'Insufficient Balance', 'error');
            } else {
                this.openModal();
                this.generateOtp();
            }
        }
    }
    generateOtp() {
        this.genButtonDisabled = true;
        generateAndSendOTP()
            .then(result => {
                this.otp = result;
                this.showToast('Success', 'Otp Generated Successfully', 'success');
                setTimeout(this.closeModal.bind(this), 120000);
                let countdownInterval = setInterval(() => {
                    this.countdown--;
                    if (this.countdown <= 0) {
                        clearInterval(countdownInterval);
                        this.genButtonDisabled = false;
                        this.countdown = 30;
                    }
                }, 1000);
            })
            .catch(error => {
                console.error('Error generating OTP:', error);
            });

    }
    verifyOtp() {
        if (this.enteredOTP && this.enteredOTP.length === 6) {
            if (this.enteredOTP == this.otp) {
                this.isOTPVerified = true;
                gshOrderItems({ userId: this.userIdvar, payment: this.selectedPaymentMethod, grandtotal: this.grandTotal, shippingCharges: this.shippingCharges }).then((result) => {
                    console.log('Order Update = ', result);
                    if (result) {
                        if (result == 'Low Balance') {
                            this.showToast('Failed', 'Insufficient Balance', 'error');
                        }
                        else {
                            this.showToast('Success', 'Item Ordered Successfully', 'success');
                            generatePDF({ orderId: result }).then((result) => {
                                console.log('Order Email = ', result);
                            })
                            this.orderDetailPage(result);
                        }
                    }
                    else {
                        this.showToast('Failed', 'An Error Occured', 'error');
                    }
                })
                    .catch((error) => {
                        console.log(error);
                    });
                this.closeModal();
            } else {
                this.isOTPVerified = false;
                this.showToast('Failed', 'Incorrect otp', 'error');
            }
        } else {
            this.isOTPVerified = false;
            this.showToast('Failed', 'Otp is of 6 digit', 'error');
        }
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
    get isCartEmpty() {
        return this.grandTotal == 0;
    }
    openProductPage(event) {
        const productId = event.target.dataset.productId;
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Product_Detail__c',
            },
            state: {
                'productId': productId,
            },
        });
    }

    orderDetailPage(orderId) {
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
    handleOtpInputChange(event) {
        this.enteredOTP = event.target.value;
        if (isNaN(this.enteredOTP)) {
            this.showToast('Failed', 'Enter Numeric Value', 'error');
        }
        console.log('Entered value:', this.enteredOTP, this.otp);
    }

}