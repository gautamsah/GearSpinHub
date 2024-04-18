import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class GshSearchResultAura extends NavigationMixin(LightningElement) {
    connectedCallback() {
        const currentUrl = window.location.href;
        const queryParams = this.extractQueryParams(currentUrl);
        if (queryParams && queryParams.searchQuery) {
            const newUrl = `/gearspinhub/s/search-page?searchQuery=${queryParams.searchQuery}`;
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: newUrl
                }
            });
        }
    }

    extractQueryParams(url) {
        const params = new URL(url).pathname.split('/').filter(param => param);
        if (params && params.length > 0) {
            return { searchQuery: params.pop() };
        }
        return null;
    }
}