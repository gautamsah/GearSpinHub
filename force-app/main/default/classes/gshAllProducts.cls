public class gshAllProducts {
    @AuraEnabled
    public static List<Product2> getAllProducts() {
        try {
            return [SELECT ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c,Average_Rating__c FROM Product2];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
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

    // @AuraEnabled
    // public static List<Product2> getProductDetail(String productId){
    //     try {
    //         return [SELECT ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c ,Average_Rating__c, Rating_Count__c, Product_Detail_Desc__c FROM Product2 WHERE Id=:productId LIMIT 1];
    //     } catch (Exception e) {
    //         throw new AuraHandledException(e.getMessage());
    //     }
    // }
    // @AuraEnabled
    // public static Decimal getCartItemCount(string userId){
    //     try {
    //         ID accId=ApexUtilities.getAccountID(userId);
    //         return [SELECT ID, Distinct_Item_Count__c FROM Customer_Cart__c WHERE Customer_Name__c=:accId LIMIT 1].Distinct_Item_Count__c;
    //     } catch (Exception e) {
    //         throw new AuraHandledException(e.getMessage());
    //     }
    // }

    @AuraEnabled
    public static Map<String, Object> getProductPageData(String userId, String productId) {
        Map<String, Object> result = new Map<String, Object>();
        ID accId= [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()].AccountId;

        List<Product2> productSelected = [SELECT Id, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c ,Average_Rating__c, Rating_Count__c, Product_Detail_Desc__c FROM Product2 WHERE Id=:productId LIMIT 1];
        
        Integer cartQuantity=0;
        Cart_Line_Item__c cartProduct=new Cart_Line_Item__c();
        if(accId!=NULL){
            Customer_Cart__c cart=[SELECT Id FROM Customer_Cart__c WHERE Customer_Name__c=:accId LIMIT 1];
            List<Cart_Line_Item__c> cartItems = [SELECT Id, Product__r.Name, Color__c, Product__r.Price__c, Product__r.Available_Stock__c, Product__r.DisplayUrl, Quantity__c, Size__c FROM Cart_Line_Item__c WHERE Customer_Cart__c=:cart.Id];
            for (Cart_Line_Item__c item : cartItems) {
                cartQuantity+=(Integer)item.Quantity__c;
                if(item.Product__c == productSelected[0].Id){
                    cartProduct=item;
                }
            }
        }



        result.put('productSelected', productSelected);
        result.put('cartQuantity', cartQuantity);
        result.put('cartProduct', cartProduct);
        
        return result;
    }

    @AuraEnabled
    public static List<Product2> getRelatedProducts(String productId){
        try {
            Product2 productSelected=[SELECT Id, Product_Category__c FROM Product2 WHERE Id=:productId LIMIT 1];
            return [SELECT ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c ,Average_Rating__c, Rating_Count__c FROM Product2 WHERE Id!=:productId AND Product_Category__c=:productSelected.Product_Category__c ORDER BY Available_Stock__c DESC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    @AuraEnabled
    public static List<Product2> getSearchProducts(String search) {
        try {
            String searchQuery = '*' + search + '*';

            // Perform SOSL query to search for products
            List<List<SObject>> searchResults = [FIND :searchQuery IN ALL FIELDS RETURNING Product2 (ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c, Average_Rating__c)];

            // Extract the search results from the query result
            List<Product2> products = new List<Product2>();
            for (List<SObject> searchResult : searchResults) {
                for (SObject obj : searchResult) {
                    products.add((Product2)obj);
                }
            }
            sortProductsByRating(products);
            return products;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static void sortProductsByRating(List<Product2> products) {
        products.sort(new RatingComparator());
    }
    
    public class RatingComparator implements Comparator<Product2> {
        public Integer compare(Product2 p1, Product2 p2) {
            if (p1.Average_Rating__c == p2.Average_Rating__c) {
                return 0;
            } else if (p1.Average_Rating__c > p2.Average_Rating__c) {
                return -1;
            } else {
                return 1;
            }
        }
    }
}