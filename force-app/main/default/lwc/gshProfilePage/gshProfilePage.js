import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProfilePageData from '@salesforce/apex/gshOrderItems.getProfilePageData';
import userId from "@salesforce/user/Id";

export default class GshProfilePage extends LightningElement {
    userIdvar = userId;
    @track isPersonalInfoSelected = true;
    @track isOrdersSelected = false;
    @track isAddressSelected = false;
    @track isReviewsSelected = false;
    @track isWalletSelected = false;
    @track isSupportTicketSelected = false;
    isNotLoaded=true;
    @track selectedTab = 'dashboard';

    @track accountDetails;
    allCustomerOrders;
    allOrdersItems;
    allCustomerRatings;
    allCases;
    // allProducts;
    walletBalance;

    @track isEditing = false;
    @track firstName = 'John';
    @track lastName = 'Doe';
    @track email = 'john.doe@example.com';

    connectedCallback() {
        getProfilePageData({ userId: this.userIdvar }).then((result) => {
            console.log(JSON.stringify(result));
            console.log('Data: ', result);
            this.accountDetails = result['accountDetails'];
            this.allCustomerOrders = result['customerOrders'].map(item => ({ ...item }));
            this.allOrdersItems = result['ordersItems'].map(item => ({ ...item }));
            this.allCustomerRatings = result['userRatings'].map(item => ({ ...item }));
            this.allCases = result['userCases'].map(item => ({ ...item }));
            // this.allProducts = result['allProducts'].map(item => ({ ...item }));
            // if (result['userCases']) {
                // this.allCases = result['userCases'].map(item => ({ ...item }));
            // }
            this.walletBalance = parseFloat(this.accountDetails.Wallet_Amount__c);
            this.formatDateFunc();
            this.isNotLoaded=false;
            console.log(this.accountDetails);
            console.log(JSON.stringify(this.allCustomerOrders));
            console.log(JSON.stringify(this.allOrdersItems));
            console.log(JSON.stringify(this.allCustomerRatings));
            console.log(JSON.stringify(this.allCases));
            // console.log(JSON.stringify(this.allProducts));
        })
            .catch((error) => {
                // console.log(error);
                console.error('Error fetching data:', error);
            });
    }

    loadComponent(event) {
        this.selectedTab = event.target.dataset.section;
        const section = event.target.dataset.section;
        this.resetSections();
        switch (section) {
            case 'dashboard':
                this.isWalletSelected = true;
                break;
            case 'personal-info':
                this.isPersonalInfoSelected = true;
                break;
            case 'orders':
                this.isOrdersSelected = true;
                break;
            case 'address':
                this.isAddressSelected = true;
                break;
            case 'reviews':
                this.isReviewsSelected = true;
                break;
            case 'support-ticket':
                this.isSupportTicketSelected = true;
                break;
            default:
                break;
        }
    }

    resetSections() {
        this.isWalletSelected = false;
        this.isPersonalInfoSelected = false;
        this.isOrdersSelected = false;
        this.isAddressSelected = false;
        this.isReviewsSelected = false;
        this.isSupportTicketSelected = false;
    }

    get WalletClass() {
        return this.isWalletSelected ? 'profile-section  profile-section-selected' : 'profile-section ';
    }

    get PersonalInfoClass() {
        return this.isPersonalInfoSelected ? 'profile-section profile-section-first profile-section-selected' : 'profile-section profile-section-first';
    }

    get OrdersClass() {
        return this.isOrdersSelected ? 'profile-section profile-section-selected' : 'profile-section';
    }

    get AddressClass() {
        return this.isAddressSelected ? 'profile-section profile-section-selected' : 'profile-section';
    }

    get ReviewsClass() {
        return this.isReviewsSelected ? 'profile-section profile-section-selected' : 'profile-section';
    }

    get SupportTicketClass() {
        return this.isSupportTicketSelected ? 'profile-section profile-section-selected' : 'profile-section';
    }


    handleEditClick() {
        this.isEditing = true;
    }

    handleUpdateClick() {
        this.isEditing = false;
    }

    get editButtonLabel() {
        return this.isEditing ? 'Cancel' : 'Edit';
    }

    get updateButtonClass() {
        return this.isEditing ? 'slds-hide' : '';
    }

    formatDateFunc() {
        this.allCustomerRatings = this.allCustomerRatings.map(review => {
            if (review.Rating_Date__c) {
                const parts = review.Rating_Date__c.split('-');
                const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                review.formattedDate = formattedDate;
                console.log(formattedDate);
                console.log(JSON.stringify(formattedDate));
                console.log(JSON.stringify(review.formattedDate));
            }
            // review.modalFeedback=review.Review__c;
            // review.modalStar=review.Stars__c;
            return review;
        });
    }

    
}