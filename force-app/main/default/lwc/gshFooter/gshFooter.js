import { LightningElement } from 'lwc';
import gshNewsletter from '@salesforce/apex/gshNewsletter.gshNewsletter';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { label  } from 'c/gshLabelUtility';


export default class GshFooter extends LightningElement {
    allLabel=label;
    mapMarkers = [
        {
            location: {
                Street: 'L and T Circle',
                City: 'Vadodara',
                State: 'Gujarat',
            },

            title: 'L and T Circle',
        },
    ];
    zoomLevel = 18;
    listView = 'visible';
    email;
    emailShown="";
    emailInput(event){
        this.email = event.target.value;
    }
    subscribeClick(){
        if(this.email){
            gshNewsletter({ email: this.email }).then((result) => {
                // console.log(JSON.stringify(result));
                console.log('Data: ', result);
                this.email=null;
                this.emailShown=null;
                if (result) {
                    if (result == 'Exists') {
                        this.showToast('Failed', 'Already Subscribed', 'error');
                    }
                    else if(result == 'Success'){
                        this.showToast('Success', 'Subscribed Successfully', 'success');
                    }
                    else{
                        this.showToast('Failed', 'An Error Occured', 'error');
                    }
                }
            })
                .catch((error) => {
                    console.log(error);
                    // console.error('Error fetching data:', error);
                });
        }
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

}