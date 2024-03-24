// export default class TestComp2 extends LightningElement {


import { LightningElement, track } from 'lwc';

export default class TestComp2 extends LightningElement {
    @track items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
    ];
    @track processedData = [];

    connectedCallback() {
        this.processItems();
    }

    processItems() {
        this.processedData = this.items.map(item => {
            // Simulated processing logic (replace with your actual processing logic)
            let processedName = item.name.toUpperCase();
            console.log(`Processing item ${item.id} with name: ${item.name}`);
            console.log(`Processed name: ${processedName}`);
            return { id: item.id, name: item.name, processedName: processedName };
        });
        console.log('Processed data:', this.processedData);
    }
}
