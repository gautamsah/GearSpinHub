// export default class TestComp2 extends LightningElement {


import { LightningElement, api, track } from 'lwc';

export default class TestComp2 extends LightningElement {
    @api ratingStars = 0;
    @track stars = [];

    connectedCallback() {
        this.initializeStars();
    }

    initializeStars() {
        this.stars = []; // Reset stars array
        for (let i = 0; i < 5; i++) {
            const filled = i < this.ratingStars;
            const path = this.getStarPath(filled);
            this.stars.push({ id: i + 1, filled, path });
        }
    }
    

    getStarPath(filled) {
        return filled ? "#FBB72C" : "#CCCCCC";
    }

    handleStarClick(event) {
    const starId = parseInt(event.currentTarget.dataset.starId, 10);
    this.ratingStars = starId;
    this.initializeStars();
    console.log(this.ratingStars);
}

}
