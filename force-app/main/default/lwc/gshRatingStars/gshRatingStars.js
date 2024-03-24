import { LightningElement, api, track } from 'lwc';

export default class GshRatingStars extends LightningElement {
    @api ratingStars = 0;
    @track stars = [];

    connectedCallback() {
        this.initializeStars();
    }

    initializeStars() {
        for (let i = 0; i < 5; i++) {
            const filled = i < this.ratingStars;
            const path = this.getStarPath(filled);
            this.stars.push({ id: i + 1, filled, path });
        }
    }

    getStarPath(filled) {
        return filled
            ? "#FBB72C"
            : '#CCCCCC';
    }
}