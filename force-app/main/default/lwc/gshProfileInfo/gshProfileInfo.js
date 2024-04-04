import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateProfileInfo from '@salesforce/apex/gshOrderItems.updateProfileInfo';
import updateProfileInfoUser from '@salesforce/apex/gshOrderItems.updateProfileInfoUser';

export default class GshProfileInfo extends LightningElement {
    @api accountDetails;
    @track ProfileNotEditing = true;
    FirstName;
    LastName;
    Email;
    Phone;
    Gender;

    connectedCallback() {
        this.FirstName = this.accountDetails.FirstName;
        this.LastName = this.accountDetails.LastName;
        this.Email = this.accountDetails.PersonEmail;
        this.Phone = this.accountDetails.Phone;
        this.Gender = this.accountDetails.Gender__c;
    }

    get FullName() {
        return this.FirstName + " " + this.LastName;
        // return "Gokul";
    }

    get options() {
        return [
            // { label: 'choose one...', value: '' },
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Others', value: 'Others' }
        ];
    }

    handleChange(event) {
        this.Gender = event.detail.value;
    }
    handleEditClick() {
        this.ProfileNotEditing = false;
    }
    handleCancelClick() {
        this.FirstName = this.accountDetails.FirstName;
        this.LastName = this.accountDetails.LastName;
        this.Email = this.accountDetails.PersonEmail;
        this.Phone = this.accountDetails.Phone;
        this.Gender = this.accountDetails.Gender__c;
        this.ProfileNotEditing = true;
    }
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
    handleUpdateClick() {
        let updatedAccountDetails = { ...this.accountDetails };

        updatedAccountDetails.FirstName = this.FirstName;
        updatedAccountDetails.LastName = this.LastName;
        updatedAccountDetails.PersonEmail = this.Email;
        updatedAccountDetails.Phone = this.Phone;
        updatedAccountDetails.Gender__c = this.Gender;

        this.accountDetails = updatedAccountDetails;

        console.log(JSON.stringify(this.accountDetails));
        this.updateUserData();
        this.ProfileNotEditing = true;
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }
    updateUserData() {
        console.log(this.accountDetails.FirstName, this.accountDetails.LastName, this.accountDetails.PersonEmail, this.accountDetails.Phone, this.accountDetails.Gender__c);
        if (!this.accountDetails.FirstName || !this.accountDetails.LastName || !this.accountDetails.PersonEmail || !this.accountDetails.Phone || !this.accountDetails.Gender__c) {
            this.showToast('Failed', 'Enter All Fields Value', 'error');
        }
        else {
            updateProfileInfo({ accountDetails: this.accountDetails }).then((result) => {
                console.log('Updated Profile Info = ', result);
                // if (result == 'Successful') {
                    // this.showToast('Success', 'Updated Profile Info', 'success');
                // } else {
                    // this.showToast('Failed', 'An Error Occured', 'error');
                // }
            })
                .catch((error) => {
                    console.log(error);
                });
            updateProfileInfoUser({ accountDetails: this.accountDetails }).then((result) => {
                console.log('Updated Profile Info = ', result);
                if (result == 'Successful') {
                    this.showToast('Success', 'Updated Profile Info', 'success');
                } else {
                    this.showToast('Failed', 'An Error Occured', 'error');
                }
            })
                .catch((error) => {
                    console.log(error);
                });
        }
    }
    
}