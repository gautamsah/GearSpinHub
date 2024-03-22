import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import getProductDetail from '@salesforce/apex/gshAllProducts.getProductDetail';
import { getRecord } from 'lightning/uiRecordApi';

export default class GshProductDetail extends NavigationMixin(LightningElement) {
    @track productQuantity = 0;
    productId;
    productDetail;
    imgUrl;
    productName;
    productDescription;
    productRating;
    productPrice;
    productCategory;
    productDetailDesc;
    productRatingCount;
    productActive;
    productStock;
    isLoaded = true;
    // Injects the current page reference into the component
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        if (currentPageReference) {
            const state = currentPageReference.state;
            // Check if 'productId' is available in the state parameters
            if (state && state.productId) {
                this.productId = state.productId;
                console.log(this.productId);
                // Now you have the productId, you can use it to fetch data or perform any other operations
                getProductDetail({ productId: this.productId }).then((result) => {
                    console.log(JSON.stringify(result));
                    this.productDetail = result;
                    this.isLoaded = false;
                    this.setValues();
                })
                    .catch((error) => {
                        console.log(error);
                    });
            }
            // else {
            //     this[NavigationMixin.Navigate]({
            //         type: 'comm__namedPage',
            //         attributes: {
            //             name: 'Error',
            //         },
            //     });
            // }
        }
    }

    // Method to set values
    setValues() {
        if (this.productDetail && this.productDetail.length > 0) {
            this.imgUrl = this.productDetail[0].DisplayUrl;
            this.productName = this.productDetail[0].Name;
            this.productDescription = this.productDetail[0].Description;
            this.productRating = this.productDetail[0].Average_Rating__c;
            this.productPrice = this.productDetail[0].Price__c;
            this.productCategory = this.productDetail[0].Product_Category__c;
            this.productDetailDesc = this.productDetail[0].Product_Detail_Desc__c;
            this.productRatingCount = this.productDetail[0].Rating_Count__c;
            this.productActive = this.productDetail[0].IsActive;
            this.productStock = this.productDetail[0].Available_Stock__c;
            console.log("product rating count is ",this.productRatingCount);
        }
    }
    handleQuantityChange(event) {
        this.productQuantity = parseInt(event.target.value, 10);
    }
    // Increase quantity
    increaseQuantity() {
        if (this.productQuantity < this.productStock) {
            this.productQuantity++;
        }
        else if (this.productQuantity >= this.productStock) {
            this.productQuantity = this.productStock;
        }
    }

    // Decrease quantity
    decreaseQuantity() {
        if (this.productQuantity > 0 && this.productQuantity < this.productStock) {
            this.productQuantity--;
        }
        else {
            this.productQuantity = this.productStock - 1;
        }
    }

    validateQuantity(event) {
        this.productQuantity = parseInt(event.target.value);
        let maxStock = parseInt(this.productStock);

        if (this.productQuantity > maxStock) {
            event.target.value = maxStock;
        }
    }

    // Define the handleColorClick method
    handleColorClick(event) {
        // Remove 'selected' class from all color dots
        const colorDots = this.template.querySelectorAll('.color-dot');
        colorDots.forEach(dot => dot.classList.remove('selected'));

        // Add 'selected' class to the clicked color dot
        event.target.classList.add('selected');

        // Get the selected color from the 'data-color' attribute
        const selectedColor = event.target.dataset.color;

        // Store the selected color data in JavaScript or use it directly
        // console.log('Selected color:', selectedColor);
        // You can perform further actions with the selected color data here
    }

    handleSelectChange(event) {
        // Get the selected option value
        const selectedOption = event.target.value;

        // Log or use the selected option value for further processing
        console.log('Selected option:', selectedOption);
        // You can perform further actions with the selected option value here
    }
    @track imageStyle = '';

    trackMouse(event) {
        const rect = event.target.getBoundingClientRect();
        const scaleX = 1.1; // Adjust the zoom level as needed
        const scaleY = 1.1; // Adjust the zoom level as needed
        const offsetX = (event.clientX - rect.left) * (scaleX - 1);
        const offsetY = (event.clientY - rect.top) * (scaleY - 1);
        this.imageStyle = `transform: scale(${scaleX}, ${scaleY}) translate(${-offsetX}px, ${-offsetY}px)`;
    }
    resetZoom() {
        this.imageStyle = '';
    }

    get star1(){
        return this.productRating >= 1 ? true: false;
    }
    get star2(){
        return this.productRating >= 2 ? true: false;
    }
    get star3(){
        return this.productRating >= 3 ? true: false;
    }
    get star4(){
        return this.productRating >= 4 ? true: false;
    }
    get star5(){
        return this.productRating >= 5 ? true: false;
    }
}