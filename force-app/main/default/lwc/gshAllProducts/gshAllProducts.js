import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllProducts from '@salesforce/apex/gshAllProducts.getAllProducts';
import addToCart from '@salesforce/apex/gshCartItems.addToCart';
import userId from "@salesforce/user/Id";

export default class GshAllProducts extends NavigationMixin(LightningElement) {
    allProducts;
    isLoaded = true;
    userIdvar = userId;
    connectedCallback() {
        getAllProducts().then((result) => {
            console.log(JSON.stringify(result));
            this.allProducts = result;
            this.isLoaded = false;
        })
            .catch((error) => {
                console.log(error);
            });
    }
    // receivedCartClick(event){
    //     console.log(event.detail.productId)

    //     addToCart({productId:event.detail.productId ,userId: this.userIdvar}).then((result) => {
    //             console.log(JSON.stringify(result));
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //         })
    // }

    receivedCartClick(event) {
        console.log('User id is: ', this.userIdvar);
        const productId = event.detail.productId;
        console.log('Product Id: ', productId);
        addToCart({ productId: productId, userId: this.userIdvar })
            .then((result) => {
                console.log(JSON.stringify(result));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    disconnectedCallback() {
        console.log("Cart Updated")
    }

}