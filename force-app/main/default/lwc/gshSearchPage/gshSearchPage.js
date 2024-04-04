import { LightningElement, track, wire } from 'lwc';
import getSearchProducts from '@salesforce/apex/gshAllProducts.getSearchProducts';
import getCategories from '@salesforce/apex/gshAllProducts.getAllCategories';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';

export default class GshSearchPage extends NavigationMixin(LightningElement) {
    @track searchResults = [];
    searchQuery = '';
    categories;

    @wire(CurrentPageReference)
    pageRef;

    connectedCallback() {
        if(this.pageRef.state.searchQuery){
            this.searchQuery = this.pageRef.state.searchQuery;
            this.searchFunction();
        }
        getCategories().then((result) => {
            console.log(JSON.stringify(result));
            this.categories = result;
        })
            .catch((error) => {
                console.log(error);
            });
    }

    handleInputChange(event) {
        this.searchQuery = event.target.value;
    }

    handleSearchClick() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/search-page?searchQuery='+this.searchQuery
            }
        });
    }
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            // If Enter key is pressed, simulate a click event on the search button
            this.template.querySelector('button').click();
        }
    }

    searchFunction(){
        getSearchProducts({ search: this.searchQuery })
            .then(result => {
                this.searchResults = result;
                console.log(JSON.stringify(result));
            })
            .catch(error => {
                console.error('Error fetching search results: ', error);
            });
    }

    onClickHandler(event) {
        const selectedCategory = event.target.dataset.value;
        this.searchQuery = selectedCategory;
        this.handleSearchClick();
        // this.dispatchEvent(
        //     new CustomEvent('categoryselect', { 
        //         detail: { category: selectedCategory } 
        //     }));
    }
}
