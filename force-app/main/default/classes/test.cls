// public without sharing class test {
//     @AuraEnabled
//     public static string test(Account accountDetails) {
//         try {
//             // Fetch the Account record from the database
//             Account fetchAcc = [SELECT Id, FirstName, LastName, Name, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, Wallet_Amount__c, BillingStreet, BillingCity, BillingState, BillingPostalCode FROM Account WHERE Id = :accountDetails.Id LIMIT 1];
    
//             // Update the fields of the fetched Account record with the values from the input Account object
//             fetchAcc.ShippingStreet = accountDetails.ShippingStreet;
//             fetchAcc.ShippingCity = accountDetails.ShippingCity;
//             fetchAcc.ShippingState = accountDetails.ShippingState;
//             fetchAcc.ShippingPostalCode = accountDetails.ShippingPostalCode;
//             fetchAcc.BillingStreet = accountDetails.BillingStreet;
//             fetchAcc.BillingCity = accountDetails.BillingCity;
//             fetchAcc.BillingState = accountDetails.BillingState;
//             fetchAcc.BillingPostalCode = accountDetails.BillingPostalCode;
    
//             // Update the Account record
//             update fetchAcc;
    
//             return 'Successful';
//         } catch (Exception e) {
//             throw new AuraHandledException(e.getMessage());
//         }
//     }
// }
@RestResource(urlMapping='/gearspinhub/s/profile-page/*')
global without sharing class test {

    @HttpPost
    @AuraEnabled
    global static String test(Account accountDetails) {
        try {
            // Fetch the Account record from the database
            Account fetchAcc = [SELECT Id, FirstName, LastName, Name, 
                                ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, 
                                Wallet_Amount__c, BillingStreet, BillingCity, BillingState, BillingPostalCode 
                                FROM Account WHERE Id = :accountDetails.Id LIMIT 1];

            // Update the fields of the fetched Account record with the values from the input Account object
            fetchAcc.ShippingStreet = accountDetails.ShippingStreet;
            fetchAcc.ShippingCity = accountDetails.ShippingCity;
            fetchAcc.ShippingState = accountDetails.ShippingState;
            fetchAcc.ShippingPostalCode = accountDetails.ShippingPostalCode;
            fetchAcc.BillingStreet = accountDetails.BillingStreet;
            fetchAcc.BillingCity = accountDetails.BillingCity;
            fetchAcc.BillingState = accountDetails.BillingState;
            fetchAcc.BillingPostalCode = accountDetails.BillingPostalCode;

            // Update the Account record
            update fetchAcc;

            return 'Successful';
        } catch (Exception e) {
            return 'Error: ' + e.getMessage();
        }
    }
}
