import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateProfileAddress from '@salesforce/apex/gshOrderItems.updateProfileAddress';
// import updateProfileAddress from '@salesforce/apex/test.test';

export default class GshProfileAddress extends LightningElement {
    @api accountDetails;
    @track ShippingNotEditing = true;
    @track BillingNotEditing = true;

    ShippingStreet;
    ShippingCity;
    ShippingState;
    ShippingPostalCode;
    BillingCity;
    BillingState;
    BillingPostalCode;
    BillingStreet;

    connectedCallback() {
        this.ShippingStreet = this.accountDetails.ShippingStreet;
        this.ShippingCity = this.accountDetails.ShippingCity;
        this.ShippingState = this.accountDetails.ShippingState;
        this.ShippingPostalCode = this.accountDetails.ShippingPostalCode;
        this.BillingStreet = this.accountDetails.BillingStreet;
        this.BillingCity = this.accountDetails.BillingCity;
        this.BillingState = this.accountDetails.BillingState;
        this.BillingPostalCode = this.accountDetails.BillingPostalCode;
    }

    // Method to handle edit button click for Shipping address
    handleShippingEditClick() {
        this.ShippingNotEditing = false;
    }

    // Method to handle cancel button click for Shipping address
    handleShippingCancelClick() {
        this.ShippingCity = this.accountDetails.ShippingCity;
        this.ShippingState = this.accountDetails.ShippingState;
        this.ShippingStreet = this.accountDetails.ShippingStreet;
        this.ShippingPostalCode = this.accountDetails.ShippingPostalCode;
        this.ShippingNotEditing = true;
    }

    // Method to handle edit button click for Billing address
    handleBillingEditClick() {
        this.BillingNotEditing = false;
    }

    // Method to handle cancel button click for Billing address
    handleBillingCancelClick() {
        this.BillingStreet = this.accountDetails.BillingStreet;
        this.BillingCity = this.accountDetails.BillingCity;
        this.BillingState = this.accountDetails.BillingState;
        this.BillingPostalCode = this.accountDetails.BillingPostalCode;
        this.BillingNotEditing = true;
    }

    // Method to handle input change
    handleInputChange(event) {
        console.log('Event:', event);
        const { name, value } = event.target;

        // console.log('Name:', name);
        // console.log('Value:', value);
        // Update the corresponding variable based on the input field name
        this[name] = value;

        // console.log('Name:', name);
        // console.log('Value:', value);

    }

    handleShippingUpdateClick() {
        let updatedAccountDetails = { ...this.accountDetails };

        updatedAccountDetails.ShippingStreet = this.ShippingStreet;
        updatedAccountDetails.ShippingCity = this.ShippingCity;
        updatedAccountDetails.ShippingState = this.ShippingState;
        updatedAccountDetails.ShippingPostalCode = this.ShippingPostalCode;

        this.accountDetails = updatedAccountDetails;

        this.ShippingNotEditing = true;
        console.log(JSON.stringify(this.accountDetails));
        this.updateUserData();
    }

    handleBillingUpdateClick() {
        let updatedAccountDetails = { ...this.accountDetails };

        updatedAccountDetails.BillingStreet = this.BillingStreet;
        updatedAccountDetails.BillingCity = this.BillingCity;
        updatedAccountDetails.BillingState = this.BillingState;
        updatedAccountDetails.BillingPostalCode = this.BillingPostalCode;

        this.accountDetails = updatedAccountDetails;

        this.BillingNotEditing = true;
        console.log(JSON.stringify(this.accountDetails));
        this.updateUserData();
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }
    updateUserData(){
        updateProfileAddress({ accountDetails: this.accountDetails }).then((result) => {
            console.log('Updated Address = ', result);
            if (result == 'Successful') {
                this.showToast('Success', 'Updated Address', 'success');
            } else {
                this.showToast('Failed', 'An Error Occured', 'error');
            }
        })
            .catch((error) => {
                console.log(error);
            });
    }
}
