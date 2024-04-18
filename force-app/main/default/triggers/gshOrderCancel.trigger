trigger gshOrderCancel on Customer_Order__c (after update) {
    // List to hold product IDs and their respective quantities to update
    List<Id> productIdsToUpdate = new List<Id>();
    Map<Id, Decimal> productQuantitiesToUpdate = new Map<Id, Decimal>();
    List<Account> accountsToUpdate = new List<Account>();

    // Iterate through the changed orders
    for (Customer_Order__c newOrder : Trigger.new) {
        Customer_Order__c oldOrder = Trigger.oldMap.get(newOrder.Id);

        // Check if the order status changed to "Cancelled" from any other status
        if (newOrder.Order_Status__c == 'Cancelled' && oldOrder.Order_Status__c != 'Cancelled') {
            // Query all related order line items for the current order
            List<Order_Line_Item__c> orderLineItems = [SELECT Id, Product__c, Quantity__c FROM Order_Line_Item__c WHERE Customer_Order__c = :newOrder.Id];

            // Iterate through the order line items and update the product quantities
            for (Order_Line_Item__c lineItem : orderLineItems) {
                Id productId = lineItem.Product__c;
                Decimal quantity = lineItem.Quantity__c;

                // Add product ID to the list if not already present
                if (!productIdsToUpdate.contains(productId)) {
                    productIdsToUpdate.add(productId);
                }

                // Update product quantity in the map
                if (productQuantitiesToUpdate.containsKey(productId)) {
                    productQuantitiesToUpdate.put(productId, productQuantitiesToUpdate.get(productId) + quantity);
                } else {
                    productQuantitiesToUpdate.put(productId, quantity);
                }
            }

            // Retrieve the related account ID from the order record
            Id accountId = newOrder.Customer_Name__c;

            // Query the existing wallet amount of the account
            Account existingAccount = [SELECT Id, Wallet_Amount__c FROM Account WHERE Id = :accountId];

            // Update the account's wallet amount by adding the cancelled order's total amount
            Decimal newWalletAmount = existingAccount.Wallet_Amount__c + newOrder.Total_Amount__c;

            // Create a new Account record to update the wallet amount
            Account accountToUpdate = new Account(Id = accountId);
            accountToUpdate.Wallet_Amount__c = newWalletAmount;

            // Add the account to the list of accounts to update
            accountsToUpdate.add(accountToUpdate);
        }
    }

    // Update product quantities
    List<Product2> productsToUpdate = [SELECT Id, Available_Stock__c, Consumed_Stock__c FROM Product2 WHERE Id IN :productIdsToUpdate];
    for (Product2 product : productsToUpdate) {
        Decimal quantityToUpdate = productQuantitiesToUpdate.get(product.Id);
        product.Available_Stock__c += quantityToUpdate;
        product.Consumed_Stock__c -= quantityToUpdate;
    }
    update productsToUpdate;

    // Perform the updates on the accounts
    update accountsToUpdate;
}