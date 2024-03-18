public class gshAllProducts {
    @AuraEnabled
    public static List<Product2> getAllProducts() {
        try {
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    
    }
}