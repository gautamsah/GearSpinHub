public with sharing class gshNewsletter {
    @AuraEnabled
    public static String gshNewsletter(String email) {
        // Query to check if an email field record with the given value already exists
        List<Newsletter__c> existingEmailFields = [SELECT Id, Email__c FROM Newsletter__c WHERE Email__c = :email LIMIT 1];

        // If an existing email field record is found, return 'Exists'
        if (!existingEmailFields.isEmpty()) {
            return 'Exists';
        }

        // If no existing email field record is found, create a new Newsletter__c record
        Newsletter__c newEmailField = new Newsletter__c();
        newEmailField.Email__c = email;

        // Insert the new Newsletter__c record
        try {
            insert newEmailField;
            return 'Success'; // Return 'Success' if the insertion is successful
        } catch (Exception e) {
            // Handle any exceptions that occur during the insert operation
            System.debug('Error creating Newsletter__c record: ' + e.getMessage());
            return 'Error';
        }
    }
}