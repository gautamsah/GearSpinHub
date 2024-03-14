import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import registration_img from "@salesforce/resourceUrl/registration_img";
import portalUserRegistration from '@salesforce/apex/gshPortalUserRegisteration.registerUser';

export default class GshRegisterUser extends NavigationMixin(LightningElement) {
    firstName = '';
    lastName = '';
    emailId = '';

    image_url = registration_img;
    isClicked = false;
    recieveData(event) {
        console.log(event.detail.fieldValue);
        console.log(event.detail.fieldName);
        if (event.detail.fieldName == 'first_name') {
            this.firstName = event.detail.fieldValue;
        }
        else if (event.detail.fieldName == 'last_name') {
            this.lastName = event.detail.fieldValue;
        }
        else if (event.detail.fieldName == 'email_id') {
            this.emailId = event.detail.fieldValue;
        }

    }
    recieveClickedData(event) {
        // console.log(event.detail.isClicked);
        //this.isClicked=event.detail.isClicked;

        if (!this.isFormValid()) {
            this.showToast('Error', 'Please fill out all fields', 'error');
            return;
        }

        else {
            console.log('Button Clicked');
            // .then(result => {
            //     console.log(result);
            //     console.log('Class Called');
            // })
            // .catch(error =>{
            //     console.log(error);
            // });
            portalUserRegistration({ firstName: this.firstName, lastName: this.lastName, email: this.emailId })
                .then(response => {
                    console.log(response);
                    if (response === 'Registered Successfully') {
                        console.log(response);
                        const event1 = new ShowToastEvent({
                            title: 'Success!',
                            message: 'Registered Successfully',
                            variant: 'success'
                        });
                        this.dispatchEvent(event1);
                        this.resetRegisterationData();
                        this[NavigationMixin.Navigate]({
                            type: 'comm__namedPage',
                            attributes: {
                                name: 'Login'
                            },
                        })
                    }
                    else if (response === 'Registeration Failed' || response === 'Error occured while Registration!') {
                        console.log(response);
                        const event2 = new ShowToastEvent({
                            title: 'Failed!',
                            message: 'Registeration Failed',
                            variant: 'error'
                        });
                        this.dispatchEvent(event2);
                        this.resetRegisterationData();

                    }
                    else if (response === 'Email already exists!!!') {
                        console.log(response);
                        const event4 = new ShowToastEvent({
                            title: 'Error!',
                            message: 'Please fill all the fields',
                            variant: 'error'
                        });
                        this.dispatchEvent(event4);
                        this.resetRegisterationData();
                    }
                })
                .catch(error => {
                    window.alert("We are having some trouble at the moment...");
                    console.log(error);
                })

        }
    }


    isFormValid() {
        return this.firstName.trim() !== '' && this.lastName.trim() !== '' && this.emailId.trim() !== '';
    }

    ShowToastEvent(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }

    showMessage(response,variants){
        const event = new ShowToastEvent({
            title: 'Success!',
            message: response,
            variant: variants
            });
            this.dispatchEvent(event);
        this.firstName = '';
        this.lastName = '';
        this.email = '';
    }
    
    resetRegisterationData() {
        this.firstName = '';
        this.lastName = '';
        this.emailId = '';
    }

}