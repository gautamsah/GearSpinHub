import { LightningElement, track } from 'lwc';

export default class TestComp2 extends LightningElement {
    @track product = {
        image: 'helmet.jpg', // Replace with actual image URL
        originalPrice: '$395.00',
        salePrice: '$156.00',
        description: 'Lorem Ipsum...' // Add product description
    };

    @track quantity = 1;

    addToCart() {
        // Implement add to cart logic here
    }
}