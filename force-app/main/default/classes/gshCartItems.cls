public class gshCartItems {
    // @AuraEnabled
    // public static Cart_Line_Item__c addToCart(string productId, string userId){
    //         try {
    //             Id accId = [SELECT AccountId FROM User WHERE Id = :userId LIMIT 1].AccountId;
    //             Customer_Cart__c cart = [SELECT ID, Customer_Name__c FROM Customer_Cart__c WHERE Customer_Name__c = :accId LIMIT 1];
    //             List<Cart_Line_Item__c> lineItemsToInsert = new List<Cart_Line_Item__c>();

    //             List<Cart_Line_Item__c> cartLineItems = [SELECT Product__c,Quantity__c FROM Cart_Line_Item__c WHERE Product__c = :productId AND Customer_Cart__c= :cart.Id LIMIT 1];
                
    //             system.debug(cartLineItems.size());

    //             if(!cartLineItems.isEmpty()){
                    
    //             // for (Cart_Line_Item__c lineItem : cartLineItems) {
    //             //     if (lineItem.Quantity__c == 1 || lineItem.Id == null) {
    //             //         lineItemsToInsert.add(lineItem);
    //             //     }
    //             // }

    //             if (!lineItemsToInsert.isEmpty()) {
    //                 insert lineItemsToInsert;
    //             }

    //             Cart_Line_Item__c cartItem = new Cart_Line_Item__c(Product__c = productId, Customer_Cart__c = cart.Id, Quantity__c=1);
    //             insert cartItem;
    //             return cartItem;
    //         }
    //         }catch (Exception e) {
    //             throw new AuraHandledException(e.getMessage());
    //     }
    // }

    @AuraEnabled
    public static String addToCartDetailPage(string productId, string userId, integer productQuantity, string productSize, string productColor){
        try {
            Id accId = [SELECT AccountId FROM User WHERE Id = :userId LIMIT 1].AccountId;
             // Query the customer cart based on the account ID
            Customer_Cart__c cart = [SELECT Id,Customer_Name__c FROM Customer_Cart__c WHERE Customer_Name__c = :accId LIMIT 1];

            // If the cart doesn't exist, create a new one
            // if (cart == null) {
            //     cart = new Customer_Cart__c(Customer_Name__c = accId);
            //     insert cart;
            // }

            // Query existing cart line items for the given product and cart
            List<Cart_Line_Item__c> existingLineItems = [
                SELECT Id,Name, Quantity__c, Color__c, Size__c 
                FROM Cart_Line_Item__c 
                WHERE Product__c = :productId AND Customer_Cart__c = :cart.Id];

            // If cart line items exist, update the quantity or insert a new line item
            if (!existingLineItems.isEmpty()) {
                for (Cart_Line_Item__c lineItem : existingLineItems) {
                    lineItem.Quantity__c += productQuantity;
                    lineItem.Color__c = productColor;
                    lineItem.Size__c = productSize;
                    
                }
                update existingLineItems;
                return 'Added to Cart Successfully';
            } else {
                // If no cart line items exist, create a new one
                Cart_Line_Item__c newCartItem = new Cart_Line_Item__c(
                    Product__c = productId, 
                    Customer_Cart__c = cart.Id, 
                    Quantity__c = productQuantity,
                    Color__c = productColor,
                    Size__c = productSize
                );
                insert newCartItem;
                return 'Added to Cart Successfully';
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
}

    
    @AuraEnabled
    public static List<Cart_Line_Item__c> getCartItems(string userId){
        try {
            ID accId=ApexUtilities.getAccountID(userId);
            ID cartId=[SELECT Id FROM Customer_Cart__c WHERE Customer_Name__c=:accId LIMIT 1].ID;
            return [SELECT Id, Product__r.Name, Color__c, Product__r.Price__c, Product__r.Available_Stock__c, Product__r.DisplayUrl, Quantity__c, Size__c FROM Cart_Line_Item__c WHERE Customer_Cart__c=:cartId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string updateCartItems(List<Cart_Line_Item__c> cartItems, List<Cart_Line_Item__c> cartItemsDeleted){
        try {
            if (!cartItems.isEmpty()) {
                update cartItems;
            }
            if (!cartItemsDeleted.isEmpty()) {
                delete cartItemsDeleted;
            }
            return 'Successful';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getCartPageData(String userId) {
        Map<String, Object> result = new Map<String, Object>();
        
        // Get cart items
        // List<CartLineItem> cartItems = [SELECT Id, Name, Quantity__c, ... FROM CartLineItem WHERE UserId__c = :userId];
        ID accId=ApexUtilities.getAccountID(userId);
        ID cartId=[SELECT Id FROM Customer_Cart__c WHERE Customer_Name__c=:accId LIMIT 1].ID;
        List<Cart_Line_Item__c> cartItems = [SELECT Id, Product__r.Name, Color__c, Product__r.Price__c, Product__r.Product_Category__c, Product__r.Available_Stock__c, Product__r.DisplayUrl, Quantity__c, Size__c FROM Cart_Line_Item__c WHERE Customer_Cart__c=:cartId];
        
        // Get account details
        // Account accountDetails = [SELECT Id, Name, ... FROM Account WHERE Id IN (SELECT AccountId FROM User WHERE Id = :userId)];
        Account accountDetails = [SELECT Id, Name, ShippingStreet,  ShippingCity, ShippingState,  ShippingPostalCode, BillingStreet, BillingCity, BillingState, BillingPostalCode, Wallet_Amount__c, PersonEmail  FROM Account WHERE Id=:accId LIMIT 1];
        
        result.put('cartItems', cartItems);
        result.put('accountDetails', accountDetails);
        
        return result;
    }
}