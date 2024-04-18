// export default class TestComp2 extends LightningElement {

import { LightningElement, api } from 'lwc';
import setImageUrl from '@salesforce/apex/test.setImageUrl';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import usersId from "@salesforce/user/Id";
import deleteFiles from '@salesforce/apex/test.deleteFiles';

export default class ImageUploaderLWC extends LightningElement {
    recordId;
    data;
    showLoadingSpinner = true;
    connectedCallback() {
        this.recordId = usersId; // Replace with your logic to get the record Id
        console.log(this.recordId);
        this.populateImageUrl();
    }

    //Getting related files of the current record
    populateImageUrl() {
        setImageUrl({ recordId: this.recordId })
            .then(result => {
                // Assuming the result contains the URL of the image
                if (result) {
                    this.data = result;
                } else {
                    this.data = null;
                }
                this.showLoadingSpinner = false;
            })
            .catch(error => {
                this.showLoadingSpinner = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }

    handleDelete() {
        deleteFiles({ recordId: this.recordId })
            .then(() => {
                // File deleted successfully
                this.data = null; // Clear the image data
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'File deleted successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                // Handle error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message, // Assuming the error message is available in the body
                        variant: 'error'
                    })
                );
            });
    }
}