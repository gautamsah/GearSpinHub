public without sharing class gshOrderItems {
    @AuraEnabled
    public static string gshOrderItems(String userId, String payment, Decimal grandtotal, Decimal shippingCharges){
        try {
            String accId = ApexUtilities.getAccountID(userId);
            Account userAccount = [SELECT Wallet_Amount__c, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, BillingStreet, BillingCity, BillingState, BillingPostalCode FROM Account WHERE ID=:accId LIMIT 1];
            ID cartId=[SELECT Id FROM Customer_Cart__c WHERE Customer_Name__c=:accId LIMIT 1].ID;
            String shippingAdd = userAccount.ShippingStreet + ', ' + userAccount.ShippingCity + ', ' + userAccount.ShippingState + ' - ' + userAccount.ShippingPostalCode;
            String billingAdd = userAccount.BillingStreet + ', ' + userAccount.BillingCity + ', ' + userAccount.BillingState + ' - ' + userAccount.BillingPostalCode;
            system.debug('inside try'+billingAdd);
            if(userAccount.Wallet_Amount__c >= grandtotal){
                Customer_Order__c newOrder = new Customer_Order__c(
                Customer_Name__c=accId, 
                Order_Status__c='Order Placed', 
                Payment_Mode__c=payment, 
                Total_Amount__c=grandtotal,
                Shipping_Charges__c=shippingCharges,
                Shipping_Address__c=shippingAdd,
                Billing_Address__c=billingAdd);
                
                insert newOrder;
                
                userAccount.Wallet_Amount__c-=grandtotal;
                update userAccount;

                system.debug('inside newOrder');
                List<Cart_Line_Item__c> cartItems = [SELECT Id, Product__r.Name, Color__c, Product__c, Product__r.Price__c, Product__r.Available_Stock__c, Product__r.DisplayUrl, Quantity__c, Size__c FROM Cart_Line_Item__c WHERE Customer_Cart__c=:cartId];
                Set<Id> productIds = new Set<Id>();
                for(Cart_Line_Item__c item : cartItems) {
                    productIds.add(item.Product__c);
                }
                Map<Id, Product2> productsMap = new Map<Id, Product2>([SELECT Id, Available_Stock__c, Consumed_Stock__c FROM Product2 WHERE Id IN :productIds]);
                List<Order_Line_Item__c> orderItems = new List<Order_Line_Item__c>();
                List<Product2> productsToUpdate = new List<Product2>();
                
                for(Cart_Line_Item__c cartItem: cartItems){
                    Product2 product = productsMap.get(cartItem.Product__c);
                    
                    if(product != null) {
                        product.Available_Stock__c -= cartItem.Quantity__c;
                        product.Consumed_Stock__c += cartItem.Quantity__c;
                        productsToUpdate.add(product);
                    }
                    Order_Line_Item__c orderItem = new Order_Line_Item__c(
                        Customer_Order__c = newOrder.ID,
                        Color__c = cartItem.Color__c,
                        Product__c = cartItem.Product__c,
                        Quantity__c = cartItem.Quantity__c,
                        Size__c = cartItem.Size__c
                        );
                        orderItems.add(orderItem);
                    }
                    update productsToUpdate;
                    insert orderItems;
                    delete cartItems;
                    // gshOrderInvoiceController controllerInstance = new gshOrderInvoiceController();
                    // String pdfGenerationResponse = controllerInstance.generatePDF(newOrder);
                    // system.debug('pdfGenerationResponse '+pdfGenerationResponse);
                    system.debug('Order sucessfull');
                    return newOrder.Id;
                    }
                else{
                    system.debug('Order failed');
                    return 'Low Balance';
            }
        // return '0';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getProfilePageData(String userId) {
        Map<String, Object> result = new Map<String, Object>();
        User userDetails=[SELECT ID,FirstName, LastName, Email, Username, CommunityNickname, Phone FROM User WHERE Id=:userId LIMIT 1];
        ID accId=ApexUtilities.getAccountID(userId);
        Id contactId=[SELECT Id FROM Contact WHERE AccountId=:accId].Id;

        // Account accountDetails = [SELECT Id, Name, ... FROM Account WHERE Id IN (SELECT AccountId FROM User WHERE Id = :userId)];
        Account accountDetails = [SELECT ID,FirstName,LastName, Name, PersonEmail, Phone, Gender__c, ShippingStreet,  ShippingCity, ShippingState,  ShippingPostalCode, Wallet_Amount__c, BillingStreet, BillingCity, BillingState, BillingPostalCode FROM Account WHERE Id=:accId LIMIT 1];
        
        List<Customer_Order__c> customerOrders=[SELECT ID,Name,Customer_Name__c,Order_Status__c,Payment_Mode__c,Shipping_Address__c,Billing_Address__c,Total_Amount__c,Shipping_Charges__c  FROM Customer_Order__c WHERE Customer_Name__c=:accId ORDER BY CreatedDate DESC];
        Set<ID> customerOrdersIds = new Set<ID>();
        for (Customer_Order__c cusOrder : customerOrders) {
            customerOrdersIds.add(cusOrder.ID);
            // system.debug('id '+ cusOrder.ID);
        }
        List<Order_Line_Item__c> orderItems = [SELECT ID, Name,Customer_Order__c,Product__c,Product__r.Name, Color__c,Size__c,Quantity__c FROM Order_Line_Item__c WHERE Customer_Order__c IN :customerOrdersIds];
        List<Rating__c> userRatings = [SELECT ID, Customer_Name__c,Product__c,Rating_Date__c,Review__c,Stars__c,Product__r.Name, Product__r.DisplayUrl FROM Rating__c WHERE Customer_Name__c=:accId ORDER BY CreatedDate DESC];
        // List<Product2> allProducts = [SELECT ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c ,Average_Rating__c, Rating_Count__c FROM Product2];
        List<Case> allCases = [SELECT Id, ContactEmail, AccountId,SuppliedEmail,Subject,Status,ContactId, CreatedDate,ClosedDate, CaseNumber   FROM Case WHERE SuppliedEmail=:userDetails.Email OR ContactEmail=:userDetails.Email ORDER BY CreatedDate DESC];

        result.put('accountDetails', accountDetails);
        result.put('customerOrders', customerOrders);
        result.put('ordersItems', orderItems);
        result.put('userRatings', userRatings);
        // result.put('allProducts', allProducts);
        result.put('userCases', allCases);

        
        return result;
    }

    @AuraEnabled
    public static string updateProfileAddress(Account accountDetails) {
        try {
            Account fetchAcc = [SELECT Id, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, 
                                BillingStreet, BillingCity, BillingState, BillingPostalCode 
                                FROM Account WHERE Id = :accountDetails.Id LIMIT 1];
            // if (accountDetails.ShippingStreet != null) {
                fetchAcc.ShippingStreet = accountDetails.ShippingStreet;
            // }
            // if (accountDetails.ShippingCity != null) {
                fetchAcc.ShippingCity = accountDetails.ShippingCity;
            // }
            // if (accountDetails.ShippingState != null) {
                fetchAcc.ShippingState = accountDetails.ShippingState;
            // }
            // if (accountDetails.ShippingPostalCode != null) {
                fetchAcc.ShippingPostalCode = accountDetails.ShippingPostalCode;
            // }
            // if (accountDetails.BillingStreet != null) {
                fetchAcc.BillingStreet = accountDetails.BillingStreet;
            // }
            // if (accountDetails.BillingCity != null) {
                fetchAcc.BillingCity = accountDetails.BillingCity;
            // }
            // if (accountDetails.BillingState != null) {
                fetchAcc.BillingState = accountDetails.BillingState;
            // }
            // if (accountDetails.BillingPostalCode != null) {
                fetchAcc.BillingPostalCode = accountDetails.BillingPostalCode;
            // }
            
            // Update the Account record
            update fetchAcc;
            
            system.debug('update address');
            return 'Successful';
        } catch (Exception e) {
            System.debug('updateProfileAddress' + e);
            System.debug(e.getStackTraceString());
            System.debug(e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static string updateProfileInfo(Account accountDetails) {
        try {
            Account fetchAcc = [SELECT Id, FirstName, LastName, PersonEmail, Phone, Gender__c
                                FROM Account WHERE Id = :accountDetails.Id LIMIT 1];
                fetchAcc.FirstName = accountDetails.FirstName;
                fetchAcc.LastName = accountDetails.LastName;
                fetchAcc.PersonEmail = accountDetails.PersonEmail;
                fetchAcc.Phone = accountDetails.Phone;
                fetchAcc.Gender__c = accountDetails.Gender__c;
                
            update fetchAcc;
            
            system.debug('update address');
            return 'Successful';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static string updateProfileInfoUser(Account accountDetails) {
        try {
            User userinfo=[SELECT ID,FirstName, LastName, Email, Username, CommunityNickname, Phone FROM User WHERE Id=:UserInfo.getUserId() LIMIT 1];
                userinfo.FirstName = accountDetails.FirstName;
                userinfo.CommunityNickname = accountDetails.PersonEmail;
                userinfo.LastName = accountDetails.LastName;
                userinfo.Email = accountDetails.PersonEmail;
                userinfo.Username = accountDetails.PersonEmail;
                userinfo.Phone = accountDetails.Phone;
            
            update userinfo;
            system.debug('update address');
            return 'Successful';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    

    @AuraEnabled
    public static string updateOrderStatus(ID orderId){
    try {
        Id accId = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()].AccountId;
        Account accountDetails= [SELECT Id, Wallet_Amount__c FROM Account WHERE Id=:accId LIMIT 1];
        Customer_Order__c customerOrder = [SELECT Id, Order_Status__c, Total_Amount__c FROM Customer_Order__c WHERE Id=:orderId LIMIT 1];
        customerOrder.Order_Status__c = 'Cancelled';

        // accountDetails.Wallet_Amount__c+=customerOrder.Total_Amount__c;
        // List<Order_Line_Item__c> orderItems = [SELECT Id, Product__c, Quantity__c FROM Order_Line_Item__c WHERE Customer_Order__c = :orderId];

        // Map<Id, Decimal> productIdToQuantity = new Map<Id, Decimal>();

        // for (Order_Line_Item__c orderLineItem : orderItems) {
        //     Id productId = orderLineItem.Product__c;
        //     Decimal quantity = orderLineItem.Quantity__c;

        //     if (productIdToQuantity.containsKey(productId)) {
        //         quantity += productIdToQuantity.get(productId);
        //     }
        //     productIdToQuantity.put(productId, quantity);
        // }

        // List<Product2> productsToUpdate = [SELECT Id, Available_Stock__c, Consumed_Stock__c FROM Product2 WHERE Id IN :productIdToQuantity.keySet()];
        // for (Product2 product : productsToUpdate) {
        //     product.Available_Stock__c += productIdToQuantity.get(product.Id);
        //     product.Consumed_Stock__c -= productIdToQuantity.get(product.Id);
        // }

        // update productsToUpdate;

        update customerOrder;

        // update accountDetails;
        return 'Successful';
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}



    @AuraEnabled
    public static Map<String, Object> getOrderDetailData(String orderId) {
    Map<String, Object> result = new Map<String, Object>();
    Id accId = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()].AccountId;
    try {
        Customer_Order__c customerOrder = [SELECT ID, Name, Customer_Name__c, Order_Status__c, Payment_Mode__c, Shipping_Address__c, Billing_Address__c, Total_Amount__c, Shipping_Charges__c  
                                            FROM Customer_Order__c 
                                            WHERE Id = :orderId AND Customer_Name__c = :accId 
                                            LIMIT 1];
        
        List<Order_Line_Item__c> orderItems = [SELECT ID, Name, Customer_Order__c, Product__c, Product__r.Name, Product__r.DisplayUrl, Product__r.Price__c, Product__r.Product_Category__c, Color__c, Size__c, Quantity__c 
                                                FROM Order_Line_Item__c 
                                                WHERE Customer_Order__c = :customerOrder.Id];
        List<Rating__c> userRatings = [SELECT ID, Customer_Name__c, Product__c, Rating_Date__c, Review__c, Stars__c, Product__r.Name, Product__r.DisplayUrl 
                                        FROM Rating__c 
                                        WHERE Customer_Name__c = :accId 
                                        ORDER BY CreatedDate DESC];
        List<Product2> allProducts = [SELECT ID, Name, IsActive, Price__c, Product_Category__c, Description, DisplayUrl, Available_Stock__c, Consumed_Stock__c ,Average_Rating__c, Rating_Count__c FROM Product2];
        

        result.put('customerOrder', customerOrder);
        result.put('ordersItems', orderItems);
        result.put('userRatings', userRatings);
        result.put('allProducts', allProducts);

    } catch (Exception e) {
        result.put('error', 'No order found with the provided ID or unauthorized access.');
    }
    
    return result;
    }



    @AuraEnabled
    public static string updateReview(ID recordId, String feedback, Decimal star){
        try {
            Rating__c review =[SELECT Stars__c, Review__c FROM Rating__c WHERE Id=:recordId LIMIT 1];
            review.Stars__c=star;
            review.Review__c=feedback;
            update review;
            return 'Successful';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static string createReview(ID productId, String feedback, Decimal star){
        try {
            Id accId = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()].AccountId;

            List<Rating__c> reviewFound =[SELECT Id FROM Rating__c WHERE Customer_Name__c=:accId AND Product__c=:productId];
            if (reviewFound.isEmpty()) {
                Rating__c review = new Rating__c();
                review.Customer_Name__c=accId;
                review.Product__c=productId;
                review.Stars__c=star;
                review.Review__c=feedback;
                insert review;
                return 'Successful';
            }
            else{
                return 'Already Exists';
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=false)
    public static String updateCase(String caseId) {
        try {
            Case c = [SELECT Id, Status FROM Case WHERE Id = :caseId LIMIT 1];
            if(c.Status != 'Escalated') {
                c.Status = 'Escalated';
                update c;
                return 'Successful';
            }
            return 'Error';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}