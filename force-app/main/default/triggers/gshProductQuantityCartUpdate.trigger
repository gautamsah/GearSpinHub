trigger gshProductQuantityCartUpdate on Product2 (after update) {
    // Map to store product IDs and their corresponding available stock
    Map<Id, Decimal> productIdToStock = new Map<Id, Decimal>();
    
    // Query for related cart line items
    Map<Id, List<Cart_Line_Item__c>> productIdToCartLineItems = new Map<Id, List<Cart_Line_Item__c>>();
    for (Cart_Line_Item__c cartLineItem : [SELECT Id, Product__c, Quantity__c, IsDeleted FROM Cart_Line_Item__c WHERE Product__c IN :Trigger.newMap.keySet() AND IsDeleted = false]) {
        if (!productIdToCartLineItems.containsKey(cartLineItem.Product__c)) {
            productIdToCartLineItems.put(cartLineItem.Product__c, new List<Cart_Line_Item__c>());
        }
        productIdToCartLineItems.get(cartLineItem.Product__c).add(cartLineItem);
    }

    // List to store cart line items to be deleted
    List<Cart_Line_Item__c> cartLineItemsToDelete = new List<Cart_Line_Item__c>();

    // Iterate over the updated products
    for (Product2 updatedProduct : Trigger.new) {
        Product2 oldProduct = Trigger.oldMap.get(updatedProduct.Id);
        
        // Check if the available stock has changed
        if (oldProduct.Available_Stock__c != updatedProduct.Available_Stock__c) {
            Decimal availableStock = updatedProduct.Available_Stock__c;
            productIdToStock.put(updatedProduct.Id, availableStock);
            
            // Check if there are cart line items associated with the product
            if (productIdToCartLineItems.containsKey(updatedProduct.Id)) {
                List<Cart_Line_Item__c> cartLineItems = productIdToCartLineItems.get(updatedProduct.Id);
                for (Cart_Line_Item__c cartLineItem : cartLineItems) {
                    // If available stock is less than cart line item quantity, update the quantity
                    if (availableStock < cartLineItem.Quantity__c && availableStock != 0) {
                        cartLineItem.Quantity__c = availableStock;
                    }
                    // If available stock is 0, add the cart line item to the list to be deleted
                    else if (availableStock == 0) {
                        cartLineItemsToDelete.add(cartLineItem);
                    }
                }
            }
        }
    }



    // Update cart line items
    List<Cart_Line_Item__c> cartLineItemsToUpdate = new List<Cart_Line_Item__c>();
    for (List<Cart_Line_Item__c> items : productIdToCartLineItems.values()) {
        for (Cart_Line_Item__c item : items) {
            // Check if the record is not deleted
            if (!item.IsDeleted) {
                cartLineItemsToUpdate.add(item);
            }
        }
    }
    // update cartLineItemsToUpdate;
    if (!cartLineItemsToUpdate.isEmpty()) {
        update cartLineItemsToUpdate;
    }
    // Delete cart line items with quantity 0
    if (!cartLineItemsToDelete.isEmpty()) {
        delete cartLineItemsToDelete;
    }
}