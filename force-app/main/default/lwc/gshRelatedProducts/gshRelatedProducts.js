import { LightningElement, wire, api } from 'lwc';
import getRelatedProducts from '@salesforce/apex/gshAllProducts.getRelatedProducts';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import userId from "@salesforce/user/Id";
import gshRelatedProducts from './gshRelatedProducts.html';
import gshRelatedProductsStencil from './gshRelatedProductsStencil.html';
export default class GshRelatedProducts extends NavigationMixin(LightningElement) {
    userId = userId; // Replace 'yourUserId' with the actual user ID
    allProducts; // Assuming allProducts is initialized with your product data
    displayedProducts;
    isLoaded = true;
    // @api productCategory;
    @api productId;

    //new
    isLoading = true;

    render() {
        console.log("render function called",this.isLoading);
        return this.isLoading ? gshRelatedProductsStencil : gshRelatedProducts;
    }

    @wire(CurrentPageReference)
    pageRef;
    // Event listener for the cartclick event dispatched from the child component
    connectedCallback() {
        // this.productCategory = this.pageRef.state.productCategory;
        this.productId = this.pageRef.state.productId;

        // this.template.addEventListener('cartclick', this.receivedCartClick.bind(this));
        getRelatedProducts({productId:this.productId}).then((result) => {
            console.log(JSON.stringify(result));
            this.allProducts = result;
            console.log(this.allProducts);
            this.displayedProducts = this.allProducts.slice(0, 4);
            // this.isLoaded = false;
            this.isLoading = false;
        })
            .catch((error) => {
                console.log(error);
            });
    }
    handleCardClick(event) {
        location.reload();
    }
}