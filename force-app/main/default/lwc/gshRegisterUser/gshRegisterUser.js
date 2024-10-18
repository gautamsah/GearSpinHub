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

    /**
    * Function to get input field values
     * @param {Object} event - The event object containing field name and value
    */
    recieveData(event) {
        const fieldMap = {
            'first_name': 'firstName',
            'last_name': 'lastName',
            'email_id': 'emailId'
        };
        const { fieldName, fieldValue } = event.detail;
        console.log(JSON.stringify(event.detail));
        if (fieldMap[fieldName]) {
            this[fieldMap[fieldName]] = fieldValue;
        }
    }

    /**
     * Function to receive click event from child component and handle registration process
     * @param {Object} event - The event object containing click information
     */
    recieveClickedData(event) {
        this.isClicked = event.detail.isClicked;
        if (this.isFormValid()) {
            this.registerUser();
        }
        else {
            this.showToast('Error', 'Please fill out all fields', 'error');
            console.log(this.firstName + this.lastName + this.emailId);
        }
    }

    /**
     * Function to register user by calling an Apex method
     */
    registerUser() {
        portalUserRegistration({ firstName: this.firstName, lastName: this.lastName, email: this.emailId })
            .then(response => {
                if (response === 'Registered Successfully') {
                    this.showToast('Success', 'Password reset link has been sent to the registered email id', 'success');
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: '/login'
                        }
                    });
                } else if (response === 'Registeration Failed' || response === 'Error occured while Registration!') {
                    this.showToast('Failed', 'Registration Failed', 'error');
                } else if (response === 'Email already exists!!!') {
                    this.showToast('Error', 'Email Already Exists', 'error');
                }
            })
            .catch(error => {
                this.showToast('Error', 'We are having some trouble at the moment...', 'error');
                console.log(error);
            });
    }

    /**
     * Function to check if the form input fields are valid
     * @returns {Boolean} - Returns true if all required fields are filled, otherwise returns false
     */
    isFormValid() {
        this.firstName = this.firstName ? this.firstName.trim() : '';
        this.lastName = this.lastName ? this.lastName.trim() : '';
        this.emailId = this.emailId ? this.emailId.trim() : '';
        return this.firstName && this.lastName && this.emailId;
    }


    /**
    * Function to display toast message
    * @param {String} title - The title of the toast message
    * @param {String} message - The body message of the toast
    * @param {String} variant - The variant of the toast (success, error, warning)
    */
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }
}