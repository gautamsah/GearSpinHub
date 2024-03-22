import { LightningElement, wire } from 'lwc';
import getCategories from '@salesforce/apex/gshAllProducts.getAllCategories';

export default class GshCategoriesNav extends LightningElement {
    categories;

    // @wire(getCategories)
    // wiredCategories({ error, data }) {
    //     if (data) {
    //         this.categories = data;
    //     } else if (error) {
    //         console.error('Error fetching categories:', error);
    //     }
    // }
    connectedCallback() {
        getCategories().then((result) => {
            console.log(JSON.stringify(result));
            this.categories = result;
        })
            .catch((error) => {
                console.log(error);
            });
    }

    onClickHandler(event) {
        const selectedCategory = event.target.dataset.value;
        // Dispatch an event to notify the parent component about the selected category
        this.dispatchEvent(
            new CustomEvent('categoryselect', { 
                detail: { category: selectedCategory } 
            }));
    }
}