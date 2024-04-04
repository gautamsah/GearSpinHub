public without sharing class gshTrackOrder {
    @AuraEnabled
    public static List<Customer_Order__c> TrackOrder(String orderId) {
        try {
            return [SELECT Order_Status__c FROM Customer_Order__c WHERE Id=:orderId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}