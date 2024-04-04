import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProductPageData from '@salesforce/apex/gshAllProducts.getProductPageData';
import addToCart from '@salesforce/apex/gshCartItems.addToCartDetailPage';
import { getRecord } from 'lightning/uiRecordApi';
import userId from "@salesforce/user/Id";

export default class GshProductDetail extends NavigationMixin(LightningElement) {
    @track productQuantity = 0;
    userIdvar = userId;
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
    productSize;
    productColor;
    @track cartQuantity = 0;
    cartProduct;
    isLoaded = true;


    @wire(CurrentPageReference)
    pageRef;
    connectedCallback() {
        this.productId = this.pageRef.state.productId;
        getProductPageData({ userId: this.userIdvar, productId: this.productId }).then((result) => {
            console.log(JSON.stringify(result));
            this.productDetail = result['productSelected'].map(item => ({ ...item }));
            this.cartQuantity = result['cartQuantity'];
            this.cartProduct = result['cartProduct'];
            // if (!this.cartProduct) {
            //     this.cartProduct.Quantity__c = 0;
            // }
            console.log(this.productStock-this.cartProduct.Quantity__c);
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
            console.log("product rating count is ", this.productRatingCount);
        }
    }
    handleQuantityChange(event) {
        this.productQuantity = parseInt(event.target.value, 10);
    }
    increaseQuantity() {
        const maxAllowed = this.productStock - (this.cartProduct.Quantity__c ? this.cartProduct.Quantity__c : 0);
        if (this.productQuantity < maxAllowed) {
            this.productQuantity++;
        } else {
            this.productQuantity = maxAllowed;
        }
        // console.log(this.productQuantity , maxAllowed, this.cartProduct.Quantity__c, this.cartProduct);
    }

    decreaseQuantity() {
        const maxAllowed = this.productStock - (this.cartProduct.Quantity__c ? this.cartProduct.Quantity__c : 0);
        if (this.productQuantity > 0) {
            this.productQuantity--;
        } else {
            this.productQuantity = maxAllowed > 0 ? maxAllowed - 1 : 0;
        }
    }

    validateQuantity(event) {
        this.productQuantity = parseInt(event.target.value);
        let maxStock = parseInt(this.productStock) - (this.cartProduct.Quantity__c ? this.cartProduct.Quantity__c : 0);

        if (this.productQuantity > maxStock) {
            event.target.value = maxStock;
            this.productQuantity = maxStock
        }
    }

    handleColorClick(event) {
        const colorDots = this.template.querySelectorAll('.color-dot');
        colorDots.forEach(dot => dot.classList.remove('selected'));
        event.target.classList.add('selected');
        this.productColor = event.target.dataset.color;
        console.log('Selected color:', this.productColor);
    }

    handleSelectChange(event) {
        this.productSize = event.target.value;
        console.log('Selected option:', this.productSize);
    }
    @track imageStyle = '';

    trackMouse(event) {
        const rect = event.target.getBoundingClientRect();
        const scaleX = 1.1;
        const scaleY = 1.1;
        const offsetX = (event.clientX - rect.left) * (scaleX - 1);
        const offsetY = (event.clientY - rect.top) * (scaleY - 1);
        this.imageStyle = `transform: scale(${scaleX}, ${scaleY}) translate(${-offsetX}px, ${-offsetY}px)`;
    }
    resetZoom() {
        this.imageStyle = '';
    }

    get star1() {
        return this.productRating >= 1 ? true : false;
    }
    get star2() {
        return this.productRating >= 2 ? true : false;
    }
    get star3() {
        return this.productRating >= 3 ? true : false;
    }
    get star4() {
        return this.productRating >= 4 ? true : false;
    }
    get star5() {
        return this.productRating >= 5 ? true : false;
    }

    receivedCartClick(event) {
        // console.log(this.productColor);
        // console.log('user',this.userIdvar);
        if (!this.userIdvar) {
            this.showToast('Failed', 'Please login first', 'error');
        }
        else if (!this.productColor || !this.productSize || this.productQuantity <= 0 || !this.productQuantity) {
            this.showToast('Failed', 'Please select color, size, and quantity', 'error');
            return;
        }
        else {
            addToCart({
                productId: this.productId,
                userId: this.userIdvar,
                productQuantity: this.productQuantity,
                productSize: this.productSize,
                productColor: this.productColor
            }).then((result) => {
                console.log(JSON.stringify(result));
                if (result === 'Added to Cart Successfully') {
                    this.showToast('Success', 'Added to Cart Successfully', 'success');
                    this.cartQuantity += this.productQuantity;
                    // console.log("Cart Quantity",this.cartQuantity);
                }
                else {
                    this.showToast('Failed', 'An Error Occured', 'error');
                }
            })
                .catch((error) => {
                    this.showToast('Failed', 'An Error Occured', 'error');
                    console.log(error);
                })
        }
    }

    cartIconCLick() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Cart_Page__c',
            },
        });
    }
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }
    categoryCLick() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Search_Page__c',
            },
            state: {
                'searchQuery': this.productCategory,
            },
        });
    }
}