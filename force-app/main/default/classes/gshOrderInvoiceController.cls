public without sharing class gshOrderInvoiceController {
    public Customer_Order__c order { get; set; }
    public List<Order_Line_Item__c> orderLineItems { get; set; }
    public Decimal grandTotal { get; set; }
    public String accountEmail { get; set; }
    public List<String> billingAddressParts { get; set; }
    public List<String> shippingAddressParts { get; set; }
    
    public gshOrderInvoiceController() {
        String orderId = ApexPages.currentPage().getParameters().get('id');
        if (orderId != null && String.isNotBlank(orderId)) {
            order = [SELECT Id, Name, Customer_Name__r.Name, Billing_Address__c, Shipping_Address__c, Total_Amount__c,
                            Order_Status__c, Payment_Mode__c, Shipping_Charges__c, Customer_Name__r.PersonEmail, CreatedDate
                    FROM Customer_Order__c WHERE Id = :orderId LIMIT 1];

            orderLineItems = [SELECT Id, Name, Quantity__c, Product__r.Name, Product__r.Price__c, Color__c, Size__c
                                FROM Order_Line_Item__c WHERE Customer_Order__c = :orderId];

            
            grandTotal = order.Total_Amount__c - order.Shipping_Charges__c;

            accountEmail = order.Customer_Name__r.PersonEmail;
            
            billingAddressParts = getSplitAddress(order.Billing_Address__c);
            
            shippingAddressParts = getSplitAddress(order.Shipping_Address__c);
        }
    }

    // @AuraEnabled
    // public List<String> getSplitAddress(String address) {
    //     List<String> parts = new List<String>();
    //     if (address != null && String.isNotBlank(address)) {
    //         parts = address.split(',\\s*', 3);
    //     }
    //     return parts;
    // }

    public List<String> getSplitAddress(String address) {
        List<String> parts = new List<String>();
        if (address != null && String.isNotBlank(address)) {
            List<String> addressParts = new List<String>(address.split(',\\s*'));
            String firstLine = '';
            for(Integer i = 0; i < addressParts.size() - 2; i++) {
                firstLine += addressParts[i];
                if(i < addressParts.size() - 3) {
                    firstLine += ', ';
                }
            }
            parts.add(firstLine);
            // Add the second last part as the second line
            parts.add(addressParts.get(addressParts.size() - 2));
            // Add the last part as the third line
            parts.add(addressParts.get(addressParts.size() - 1));
        }
        return parts;
    }
    
    @AuraEnabled
    public static string generatePDF(String orderId) {
        try {
            Customer_Order__c order = [SELECT Id, Name, Customer_Name__c FROM Customer_Order__c WHERE Id = :orderId LIMIT 1];
            
            Account relatedAccount = [SELECT Id,Name, PersonEmail FROM Account WHERE Id = :order.Customer_Name__c LIMIT 1];
            String recipientEmail = relatedAccount.PersonEmail;
            
            PageReference pdfPage = Page.gshOrderInvoice;
            pdfPage.getParameters().put('id', orderId);
            Blob pdfBlob = pdfPage.getContentAsPDF();
            
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setSubject('Invoice for Order: ' + order.Name);
            email.setPlainTextBody('Please find attached the invoice for your order.');
            email.setToAddresses(new List<String>{recipientEmail});
            
            Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
            attachment.setFileName('Invoice.pdf');
            attachment.setBody(pdfBlob);
            email.setFileAttachments(new List<Messaging.EmailFileAttachment>{attachment});
            String htmlBody = '<html><body>';
            htmlBody += '<p><span style="font-size: 14px;">Hello </span><strong style="font-size: 14px;">'+ relatedAccount.Name +'</strong><span style="font-size: 14px;">,</span></p><p><br></p><p><span style="font-size: 14px;">Congratulations!!! Your Order has been placed successfully.</span></p><p>Click here to track order -&gt; <a href="https://gautamsah-dev-ed.develop.my.site.com/gearspinhub/s/order-tracking-page?orderId='+order.Id+'" rel="noopener noreferrer" target="_blank">Track Order</a></p><p>Your Tracking Code is <strong>'+order.Id+'</strong></p><p><br></p><p><br></p><p><span style="font-size: 14px;">Thank you for choosing </span><strong style="font-size: 14px;">Gear Spin Hub</strong><span style="font-size: 14px;"> with us.</span></p>';
            htmlBody += '</body></html>';
            
            email.setHtmlBody(htmlBody);
            Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email});
            
            return 'Successful';
        } catch (Exception e) {
            System.debug('Error generating PDF: ' + e.getMessage());
            return 'error';
        }
    }

    @AuraEnabled(cacheable=true)
    public static Blob generatePDFOnly(String orderId) {
        try {
            Customer_Order__c order = [SELECT Id, Name, Customer_Name__c FROM Customer_Order__c WHERE Id = :orderId];
            
            PageReference pdfPage = Page.gshOrderInvoice;
            pdfPage.getParameters().put('id', orderId);
            Blob pdfBlob = pdfPage.getContentAsPDF();
            
            return pdfBlob;
        } catch (Exception e) {
            System.debug('Error generating PDF: ' + e.getMessage());
            return null;
        }
    }

    @AuraEnabled()
    public static String generateOnlyPDF(String orderId) {
        try {
            Customer_Order__c order = [SELECT Id, Name, Customer_Name__c FROM Customer_Order__c WHERE Id = :orderId];
            
            PageReference pdfPage = Page.gshOrderInvoice;
            pdfPage.getParameters().put('id', orderId);
            Blob pdfBlob = pdfPage.getContentAsPDF();
            
            // Return the Base64-encoded PDF blob
            return EncodingUtil.base64Encode(pdfBlob);
        } catch (Exception e) {
            // Handle exception
            System.debug('Error generating PDF: ' + e.getMessage());
            return null;
        }
    }
}
// Instead of sending email, you can save the PDF as a ContentVersion, attach it to the related record, etc.