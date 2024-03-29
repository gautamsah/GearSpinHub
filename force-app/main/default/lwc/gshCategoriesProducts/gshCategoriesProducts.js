import { LightningElement, wire } from 'lwc';
import getAllLatestProducts from '@salesforce/apex/gshAllProducts.getAllLatestProducts';
// import addToCart from '@salesforce/apex/gshCartItems.addToCart';
import userId from "@salesforce/user/Id";

export default class GshCategoriesProducts extends LightningElement {
    userId = userId; // Replace 'yourUserId' with the actual user ID
    allProducts; // Assuming allProducts is initialized with your product data
    displayedProducts;
    isLoaded = true;
    // Slice the array to display only the first 4 products
    // get displayedProducts() {
    //     return this.allProducts.slice(0, 4);
    // }

    // Event listener for the cartclick event dispatched from the child component
    connectedCallback() {
        // this.template.addEventListener('cartclick', this.receivedCartClick.bind(this));
        getAllLatestProducts().then((result) => {
            console.log(JSON.stringify(result));
            this.allProducts = result;
            this.displayedProducts = this.allProducts.slice(0, 4);
            this.isLoaded = false;
        })
            .catch((error) => {
                console.log(error);
            });
    }
    receivedCategoryClick(event){
        const selectedCategory = event.detail.category;
        // Filter products by selected category
        if (selectedCategory === '') {
            // Display the first 4 products if no category is selected
            this.displayedProducts = this.allProducts.slice(0, 4);
        } else {
            // Filter products by category and display the first 4
            this.displayedProducts = this.allProducts.filter(product => product.Product_Category__c === selectedCategory).slice(0, 4);
        }
    }
}