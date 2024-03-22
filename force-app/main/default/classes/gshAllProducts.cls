public class gshAllProducts {
    @AuraEnabled
    public static List<Product2> getAllProducts() {
        try {
            return [SELECT ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c,Average_Rating__c FROM Product2];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<String> getAllCategories(){
        try {
            List<String> picklistValues = new List<String>();
            String objectName='Product2';
            String fieldName='Product_Category__c';
            // Describe the object and field using Schema
            Schema.DescribeFieldResult fieldDescribe = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(fieldName).getDescribe();
            // Check if the field is a picklist
            if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
                // Retrieve picklist values
                List<Schema.PicklistEntry> picklistEntries = fieldDescribe.getPicklistValues();
                for (Schema.PicklistEntry entry : picklistEntries) {
                    picklistValues.add(entry.getValue());
                }
            }
            return picklistValues;
            // List<String> picklistValues = PicklistValuesController.getPicklistValues('ObjectName', 'FieldName');
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Product2> getAllLatestProducts() {
        try {
            return [SELECT ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c ,Average_Rating__c, Rating_Count__c FROM Product2 ORDER BY CreatedDate DESC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Product2> getProductDetail(String productId){
        try {
            return [SELECT ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c ,Average_Rating__c, Rating_Count__c, Product_Detail_Desc__c FROM Product2 WHERE Id=:productId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Product2> getRelatedProducts(String productId, String productCategory){
        try {
            return [SELECT ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c ,Average_Rating__c, Rating_Count__c FROM Product2 WHERE Id!=:productId AND Product_Category__c=:productCategory ORDER BY Available_Stock__c DESC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}