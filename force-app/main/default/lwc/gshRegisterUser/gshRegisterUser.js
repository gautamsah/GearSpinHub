import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import registration_img from "@salesforce/resourceUrl/registration_img";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import portalUserRegistration from '@salesforce/apex/gshPortalUserRegisteration.registerUser';

export default class GshRegisterUser extends NavigationMixin(LightningElement) {
    @api firstName = '';
    @api lastName = '';
    @api emailId = '';

    image_url = registration_img;
    isClicked = false;

    recieveData(event) {
        const { fieldName, fieldValue } = event.detail;
        console.log(JSON.stringify(event.detail));
        if (fieldName === 'first_name') {
            this.firstName = fieldValue;
        } else if (fieldName === 'last_name') {
            this.lastName = fieldValue;
        } else if (fieldName === 'email_id') {
            this.emailId = fieldValue;
        }
    }

    recieveClickedData(event) {
        this.isClicked = event.detail.isClicked;

        if (this.isFormValid()) {
            console.log('inside form valid false');
            this.registerUser();
        }
        else{
            this.showToast('Error', 'Please fill out all fields', 'error');
            console.log(this.firstName+this.lastName+this.emailId);
        }
    }

    registerUser() {
        portalUserRegistration({ firstName: this.firstName, lastName: this.lastName, email: this.emailId })
            .then(response => {
                if (response === 'Registered Successfully') {
                    this.showToast('Success', 'Password reset link has been sent to the registered email id', 'success');
                    // this.resetRegisterationData();
                    this.navigateToLogin();
                } else if (response === 'Registeration Failed' || response === 'Error occured while Registration!') {
                    this.showToast('Failed', 'Registration Failed', 'error');
                    // this.resetRegisterationData();
                } else if (response === 'Email already exists!!!') {
                    this.showToast('Error', 'Email Already Exists', 'error');
                    // this.resetRegisterationData();
                }
            })
            .catch(error => {
                this.showToast('Error', 'We are having some trouble at the moment...', 'error');
                console.log(error);
            });
    }

    isFormValid() {
        // Trim the input values
        this.firstName = this.firstName ? this.firstName.trim() : '';
        this.lastName = this.lastName ? this.lastName.trim() : '';
        this.emailId = this.emailId ? this.emailId.trim() : '';

        // Check if all fields are non-empty
        return this.firstName && this.lastName && this.emailId;
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

    // resetRegisterationData() {
    //     this.firstName = '';
    //     this.lastName = '';
    //     this.emailId = '';
    // }

    navigateToLogin() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Login'
            },
        });
    }
}