import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateProfileAddress from '@salesforce/apex/gshOrderItems.updateProfileAddress';
// import updateProfileAddress from '@salesforce/apex/test.test';

export default class GshProfileAddress extends LightningElement {
    @api accountDetails;
    @track ShippingNotEditing = true;
    @track BillingNotEditing = true;

    pincodeOptions = {
        "100001": "Andaman and Nicobar Islands",
        "200001": "Andhra Pradesh",
        "300001": "Arunachal Pradesh",
        "400001": "Assam",
        "500001": "Bihar",
        "600001": "Chandigarh",
        "700001": "Chhattisgarh",
        "800001": "Dadra and Nagar Haveli",
        "900001": "Daman and Diu",
        "110001": "Delhi",
        "120001": "Goa",
        "130001": "Gujarat",
        "140001": "Haryana",
        "150001": "Himachal Pradesh",
        "160001": "Jammu and Kashmir",
        "170001": "Jharkhand",
        "180001": "Karnataka",
        "190001": "Kerala",
        "210001": "Ladakh",
        "220001": "Lakshadweep",
        "230001": "Madhya Pradesh",
        "240001": "Maharashtra",
        "250001": "Manipur",
        "260001": "Meghalaya",
        "270001": "Mizoram",
        "280001": "Nagaland",
        "290001": "Odisha",
        "310001": "Puducherry",
        "320001": "Punjab",
        "330001": "Rajasthan",
        "340001": "Sikkim",
        "350001": "Tamil Nadu",
        "360001": "Telangana",
        "370001": "Tripura",
        "380001": "Uttar Pradesh",
        "390001": "Uttarakhand",
        "400001": "West Bengal"
        // Add more mappings as needed
    };
    

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
        if (name === 'ShippingPostalCode' || name === 'BillingPostalCode') {
            // this.validatePositiveNumber(name, value);
            this.validateAndSetState(name, value);
        }
    }

    validateAndSetState(fieldName, fieldValue) {
        // Convert the field value to a number
        const postalCode = parseInt(fieldValue, 10);
    
        // Check if the postal code is a positive number
        if (!isNaN(postalCode) && postalCode > 0) {
            // Get the corresponding state for the entered postal code
            const state = this.pincodeOptions[fieldValue];
            if (state) {
                // Update the corresponding state field
                if (fieldName === 'ShippingPostalCode') {
                    this.ShippingState = state;
                } else if (fieldName === 'BillingPostalCode') {
                    this.BillingState = state;
                }
            } else {
                // Handle case when the postal code is not found in the pincodeOptions
                // this.showToast('Failed', 'Enter a correct Postal Code', 'error');
                fieldName=fieldValue;
            }
        } else {
            // Handle case when the entered postal code is not a positive number
            this.showToast('Failed', 'Enter a correct Postal Code', 'error');
        }
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

    get stateOptions() {
        return [
            { label: 'Andaman and Nicobar Islands', value: 'Andaman and Nicobar Islands' },
            { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
            { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
            { label: 'Assam', value: 'Assam' },
            { label: 'Bihar', value: 'Bihar' },
            { label: 'Chandigarh', value: 'Chandigarh' },
            { label: 'Chhattisgarh', value: 'Chhattisgarh' },
            { label: 'Dadra and Nagar Haveli', value: 'Dadra and Nagar Haveli' },
            { label: 'Daman and Diu', value: 'Daman and Diu' },
            { label: 'Delhi', value: 'Delhi' },
            { label: 'Goa', value: 'Goa' },
            { label: 'Gujarat', value: 'Gujarat' },
            { label: 'Haryana', value: 'Haryana' },
            { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
            { label: 'Jammu and Kashmir', value: 'Jammu and Kashmir' },
            { label: 'Jharkhand', value: 'Jharkhand' },
            { label: 'Karnataka', value: 'Karnataka' },
            { label: 'Kerala', value: 'Kerala' },
            { label: 'Ladakh', value: 'Ladakh' },
            { label: 'Lakshadweep', value: 'Lakshadweep' },
            { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
            { label: 'Maharashtra', value: 'Maharashtra' },
            { label: 'Manipur', value: 'Manipur' },
            { label: 'Meghalaya', value: 'Meghalaya' },
            { label: 'Mizoram', value: 'Mizoram' },
            { label: 'Nagaland', value: 'Nagaland' },
            { label: 'Odisha', value: 'Odisha' },
            { label: 'Puducherry', value: 'Puducherry' },
            { label: 'Punjab', value: 'Punjab' },
            { label: 'Rajasthan', value: 'Rajasthan' },
            { label: 'Sikkim', value: 'Sikkim' },
            { label: 'Tamil Nadu', value: 'Tamil Nadu' },
            { label: 'Telangana', value: 'Telangana' },
            { label: 'Tripura', value: 'Tripura' },
            { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
            { label: 'Uttarakhand', value: 'Uttarakhand' },
            { label: 'West Bengal', value: 'West Bengal' }
        ];
    }
    
    handleShippingStateChange(event) {
        this.ShippingState = event.detail.value;
    }
    handleBillingStateChange(event) {
        this.BillingState = event.detail.value;
    }
}