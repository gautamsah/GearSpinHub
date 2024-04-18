trigger gshCartLineItem on Cart_Line_Item__c (after insert, after update, after delete) {
// trigger UpdateDistinctProductCount on Cart_Line_Item__c (after insert, after update, after delete) {
    // Method to update Distinct Product Count field on Customer Cart object
    public static void updateDistinctProductCount(Set<Id> cartIds) {
        // Query to get the count of distinct products related to each Customer Cart
        Map<Id, Integer> cartDistinctProductCountMap = new Map<Id, Integer>();
        for (AggregateResult aggregateResult : [
            SELECT Customer_Cart__c cartId, COUNT_DISTINCT(Product__c) distinctProductCount
            FROM Cart_Line_Item__c
            WHERE Customer_Cart__c IN :cartIds
            GROUP BY Customer_Cart__c
        ]) {
            Id cartId = (Id)aggregateResult.get('cartId');
            Integer distinctProductCount = (Integer)aggregateResult.get('distinctProductCount');
            cartDistinctProductCountMap.put(cartId, distinctProductCount);
        }
        
        // Update Distinct Product Count field on Customer Cart object
        List<Customer_Cart__c> cartsToUpdate = new List<Customer_Cart__c>();
        for (Customer_Cart__c cart : [SELECT Id, Distinct_Item_Count__c FROM Customer_Cart__c WHERE Id IN :cartIds]) {
            Integer distinctProductCount = cartDistinctProductCountMap.get(cart.Id) != null ? cartDistinctProductCountMap.get(cart.Id) : 0;
            if (cart.Distinct_Item_Count__c != distinctProductCount) {
                cart.Distinct_Item_Count__c = distinctProductCount;
                cartsToUpdate.add(cart);
            }
        }
        update cartsToUpdate;
    }

    // Trigger handler
    if (Trigger.isAfter) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            Set<Id> cartIds = new Set<Id>();
            for (Cart_Line_Item__c cartLine : Trigger.new) {
                cartIds.add(cartLine.Customer_Cart__c);
            }
            if (!cartIds.isEmpty()) {
                updateDistinctProductCount(cartIds);
            }
        }
        if (Trigger.isDelete) {
            Set<Id> cartIds = new Set<Id>();
            for (Cart_Line_Item__c cartLine : Trigger.old) {
                cartIds.add(cartLine.Customer_Cart__c);
            }
            if (!cartIds.isEmpty()) {
                updateDistinctProductCount(cartIds);
            }
        }
    }
}