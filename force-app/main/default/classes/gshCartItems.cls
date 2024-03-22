public class gshCartItems {
    @AuraEnabled
    public static Cart_Line_Item__c addToCart(string productId, string userId){
            try {
                Id accId = [SELECT AccountId FROM User WHERE Id = :userId LIMIT 1].AccountId;
                Customer_Cart__c cart = [SELECT ID, Customer_Name__c FROM Customer_Cart__c WHERE Customer_Name__c = :accId LIMIT 1];
                List<Cart_Line_Item__c> lineItemsToInsert = new List<Cart_Line_Item__c>();

                List<Cart_Line_Item__c> cartLineItems = [SELECT Product__c,Quantity__c FROM Cart_Line_Item__c WHERE Product__c = :productId AND Customer_Cart__c= :cart.Id LIMIT 1];
                
                system.debug(cartLineItems.size());

                if(!cartLineItems.isEmpty()){
                    
                // for (Cart_Line_Item__c lineItem : cartLineItems) {
                //     if (lineItem.Quantity__c == 1 || lineItem.Id == null) {
                //         lineItemsToInsert.add(lineItem);
                //     }
                // }

                if (!lineItemsToInsert.isEmpty()) {
                    insert lineItemsToInsert;
                }

                // Cart_Line_Item__c cartItem = new Cart_Line_Item__c(Product__c = productId, Customer_Cart__c = cart.Id, Quantity__c=1);
                insert cartItem;
                return cartItem;
            } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        }
    } 
}