import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class GshSearchDetailAura extends NavigationMixin(LightningElement) {
    connectedCallback() {
        const currentUrl = window.location.href;
        const newUrl = this.convertUrl(currentUrl);
        if (newUrl) {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: newUrl
                }
            });
        }
    }

    convertUrl(url) {
        // Check if the current URL format is '/gearspinhub/s/detail/:recordId'
        const detailRegex = /\/gearspinhub\/s\/detail\/([a-zA-Z0-9]+)$/;
        const detailMatch = url.match(detailRegex);
        if (detailMatch && detailMatch.length === 2) {
            // Extract the recordId from the URL
            const recordId = detailMatch[1];
            // Construct the new URL format '/gearspinhub/s/product-detail?productId=:recordId'
            return `/gearspinhub/s/product-detail?productId=${recordId}`;
        }

        // Check if the current URL format is '/gearspinhub/s/product-detail?productId=:recordId'
        const productDetailRegex = /\/gearspinhub\/s\/product-detail\?productId=([a-zA-Z0-9]+)$/;
        const productDetailMatch = url.match(productDetailRegex);
        if (productDetailMatch && productDetailMatch.length === 2) {
            // Extract the recordId from the URL
            const recordId = productDetailMatch[1];
            // Construct the new URL format '/gearspinhub/s/detail/:recordId'
            return `/gearspinhub/s/detail/${recordId}`;
        }

        // Return null if the current URL format is not recognized
        return null;
    }
}