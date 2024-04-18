public without sharing class gshGetAllRatings {
    @AuraEnabled
    public static List<Rating__c> getAllRatings(String productId){
        try {
            List<Rating__c> ratingRecords = [SELECT ID, Customer_Name__r.Name, Customer_Name__r.Profile_Pic__c, Rating_Date__c, Review__c, Stars__c FROM Rating__c WHERE Product__c=:productId ORDER BY CreatedDate DESC];
        
        for(Rating__c rating : ratingRecords) {
            
            if(rating.Customer_Name__r.Profile_Pic__c==null) {
                rating.Customer_Name__r.Profile_Pic__c = 'https://raw.githubusercontent.com/gautamsah/GearSpinHub/main/resources/user_nodp2.jpg';
            }
        }
        
        return ratingRecords;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}