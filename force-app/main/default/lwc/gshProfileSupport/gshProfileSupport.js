import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateCase from '@salesforce/apex/gshOrderItems.updateCase';

export default class GshProfileSupport extends LightningElement {
    @api allCases;

    connectedCallback() {
        if (this.allCases && Array.isArray(this.allCases)) {
            // Iterate through each case and update the 'closed' property
            this.allCases = this.allCases.map(item => ({
                ...item,
                closed: item.Status === 'Closed',
                showEscalated: this.shouldShowEscalated(item.Status),
                formattedCreatedDate: this.formattedDate(item.CreatedDate),
                formattedClosedDate: this.formattedDate(item.ClosedDate),
                displayedEmail: this.getDisplayedEmail(item)
            }));
            console.log('GSH log', JSON.stringify(this.allCases));
        }
    }

    formattedDate(dateStr) {
        if (!dateStr) return ''; // Handle case when dateStr is null or undefined
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    shouldShowEscalated(status) {
        return status !== 'Closed' && status !== 'Escalated';
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }

    getDisplayedEmail(item) {
        return item.ContactEmail ? item.ContactEmail : item.SuppliedEmail;
    }

    handleElevate(event) {
        const caseId = event.target.dataset.id;
        updateCase({ caseId: caseId })
            .then(result => {
                if (result == 'Successful') {
                    this.showToast('Success', 'Case Escalated Successfully', 'success');
                    const updatedCases = this.allCases.map(item => {
                        if (item.Id === caseId) {
                            return { ...item, Status: 'Escalated', showEscalated:false };
                        }
                        return item;
                    });
                    this.allCases = updatedCases;
                }
                else {
                    this.showToast('Failed', 'An Error Occured', 'error');
                }
            })
            .catch(error => {
                // Handle error
                console.error('Error elevating case:', error);
            });
    }
}