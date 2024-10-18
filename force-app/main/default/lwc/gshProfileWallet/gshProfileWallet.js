import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateBalanceOtp from '@salesforce/apex/gshPaymentHandler.updateBalanceOtp';
import updateBalanceVerification from '@salesforce/apex/gshPaymentHandler.updateBalanceVerification';

const TRANSACTION_TYPE = {
    WITHDRAW: 'Withdraw',
    DEPOSIT: 'Deposit'
};

export default class GshProfileWallet extends LightningElement {
    @api accountBalance;
    @api accountEmail;
    // balance = accountBalance;
    transactionAmount = 0;
    selectedTransactionType = '';
    inputLabel = '';
    transactionButtonLabel = '';

    genButtonDisabled = true;
    countdown = 30;
    get genButtonLabel() {
        return this.genButtonDisabled ? `Resend OTP in ${this.countdown} seconds` : 'Generate OTP';
    }
    transactionOptions = [
        { label: 'Select Transaction Type', value: '' },
        { label: 'Withdraw', value: TRANSACTION_TYPE.WITHDRAW },
        { label: 'Deposit', value: TRANSACTION_TYPE.DEPOSIT }
    ];

    handleAmountChange(event) {
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        this.transactionAmount = event.target.value;
        // console.log(this.accountBalance, 'balance');
    }

    handleTransactionChange(event) {
        this.selectedTransactionType = event.detail.value;
        this.inputLabel = this.selectedTransactionType === TRANSACTION_TYPE.WITHDRAW ? 'Withdraw Amount' : 'Deposit Amount';
        this.transactionButtonLabel = this.selectedTransactionType === TRANSACTION_TYPE.WITHDRAW ? 'Withdraw' : 'Deposit';
    }

    performTransaction() {
        const amount = parseInt(this.transactionAmount);
        this.openModal();
        this.generateOtp(amount);

    }
    generateOtp(amount) {
        this.genButtonDisabled = true;
        updateBalanceOtp({ transactionType: this.transactionButtonLabel, amount: amount })
            .then(result => {
                console.log('Result from updateBalanceOtp:', result);
                if (result === 'Successful') {
                    this.showToast('Success', 'Otp Sent to your email', 'success');
                    setTimeout(this.closeModal.bind(this), 120000);
                    let countdownInterval = setInterval(() => {
                        this.countdown--;
                        if (this.countdown <= 0) {
                            clearInterval(countdownInterval);
                            this.genButtonDisabled = false;
                            this.countdown = 30;
                        }
                    }, 1000);
                } else {
                    this.showToast('Failed', 'An Error Occured', 'error');
                    this.closeModal();
                }
            })
            .catch(error => {
                console.error('Error generating OTP:', error);
                this.showToast('Failed', 'An Error Occurred', 'error');
                this.closeModal();
            });
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }


    modalClass = 'slds-modal slds-fade-in-close';
    backdropClass = 'slds-backdrop slds-backdrop_close';

    otp;
    isOTPVerified = false;
    enteredOTP;
    modalActive = false;

    verifyOtp() {
        if (this.enteredOTP && this.enteredOTP.toString().length === 6) {
            updateBalanceVerification({ otp: this.enteredOTP })
                .then(result => {
                    if (result) {
                        if (result == 'Successful') {
                            this.showToast('Success', 'Transaction Done Successfully', 'success');
                            if (this.transactionButtonLabel === 'Withdraw') {
                                this.accountBalance -= parseInt(this.transactionAmount);
                            }
                            else {
                                this.accountBalance += parseInt(this.transactionAmount);
                            }
                            this.closeModal();
                        }
                        else if (result == 'Low Balance') {
                            this.showToast('Failed', 'Insufficient Balance', 'error');
                            this.closeModal();
                        }
                        else {
                            this.showToast('Failed', 'Incorrect Otp', 'error');
                        }
                    }
                    else {
                        this.showToast('Failed', 'An Error Occured', 'error');
                        this.closeModal();
                    }
                })
                .catch(error => {
                    console.error('Error generating OTP:', error);
                });

        } else {
            // Invalid OTP length, handle accordingly
            // this.isOTPVerified = false;
            this.showToast('Failed', 'Otp is of 6 digit', 'error');
        }
    }

    openModal() {
        this.modalActive = true;
        this.modalClass = 'modal fade-in-open';
        this.backdropClass = 'backdrop fade-in-open';
    }

    closeModal() {
        this.modalClass = 'modal fade-in-close';
        this.backdropClass = 'backdrop fade-in-close';
        this.transactionAmount = 0;
        this.selectedTransactionType = '';
        this.inputLabel = '';
        this.transactionButtonLabel = '';

        this.modalActive = false;
    }
    handleOtpInputChange(event) {
        this.enteredOTP = parseInt(event.target.value);
        if (isNaN(this.enteredOTP)) {
            this.showToast('Failed', 'Enter Numeric Value', 'error');
        }
        // console.log('Entered value:', this.enteredOTP, this.otp);
    }
}