import { LightningElement,wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
// import { publish,subscribe,unsubscribe,createMessageContext,releaseMessageContext } from 'lightning/messageService';
import DATA_MESSAGE_CHANNEL from '@salesforce/messageChannel/MyMessageChannel__c';

export default class TestComp extends LightningElement {
    @wire(MessageContext)
    messageContext;

    sendData() {
        const jsonData = {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
        };

        const messagePayload = { data: JSON.stringify(jsonData) };
        publish(this.messageContext, DATA_MESSAGE_CHANNEL, messagePayload);
    }
}