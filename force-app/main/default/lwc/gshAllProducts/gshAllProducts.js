import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllProducts from '@salesforce/apex/gshAllProducts.getAllProducts';
import userId from "@salesforce/user/Id";

export default class GshAllProducts extends NavigationMixin(LightningElement) {
    allProducts;
    allProductsCount;
    isLoaded = true;
    userIdvar = userId;
    connectedCallback() {
        getAllProducts().then((result) => {
            this.allProducts = result;
            this.allProductsCount=this.allProducts.length;
            this.isLoaded = false;
        })
            .catch((error) => {
                console.log(error);
            });
    }

    receivedCartClick(event) {
        const productId = event.detail.productId;
        addToCart({ productId: productId, userId: this.userIdvar })
            .then((result) => {
                console.log(JSON.stringify(result));
            })
            .catch((error) => {
                console.error(error);
            });
    }
}