public without sharing class gshPaymentHandler {

    @AuraEnabled
    public static Integer generateAndSendOTP() {
        Integer otp = generateOTP();
        String recipientEmail = UserInfo.getUserEmail();
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        String[] toAddresses = new String[] { recipientEmail };
        mail.setToAddresses(toAddresses);
        mail.setSubject('Your OTP for Order Confirmation');
        
        String htmlBody = '<html><body>';
        htmlBody += '<p style="font-family: Arial, sans-serif; font-size: 16px;">';
        htmlBody += 'Your OTP for order confirmation is: <strong>' + otp + '</strong>';
        htmlBody += '</p>';
        htmlBody += '</body></html>';
        
        mail.setHtmlBody(htmlBody);
        
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        
        return otp;
    }
    
    private static Integer generateOTP() {
        Integer firstDigit = (Integer)Math.floor(Math.random() * 9) + 1;
        Integer otp = firstDigit;
        
        for(Integer i = 1; i < 6; i++) {
            Integer digit = (Integer)Math.floor(Math.random() * 10);
            otp = otp * 10 + digit;
        }
        
        return otp;
    }


    // public static INTEGER storedOtp { get; set; }
    // public static DECIMAL storedAmount { get; set; }

    // public static void setValue(String value) {
    //     storedOtp = value;
    // }

    // public static String getValue() {
    //     return storedOtp;
    // }

    @AuraEnabled
    public static String updateBalanceOtp(String transactionType, Decimal amount) {
        Integer otp = generateOTP();
        OtpCustomSetting__c otpSetting = OtpCustomSetting__c.getInstance(UserInfo.getUserId());
        if (otpSetting == null) {
            otpSetting = new OtpCustomSetting__c();
        }
        otpSetting.storedAmount__c = amount; // Example amount value
        otpSetting.storedOtp__c = otp;
        otpSetting.storedTransactionType__c = transactionType;
        upsert otpSetting;
        // storedOtp = otp;
        // storedAmount = amount;
        String recipientEmail = UserInfo.getUserEmail();
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        String[] toAddresses = new String[] { recipientEmail };
        mail.setToAddresses(toAddresses);
        mail.setSubject('Your OTP for Account Balance ' +transactionType);
        
        String htmlBody = '<html><body>';
        htmlBody += '<p style="font-family: Arial, sans-serif; font-size: 16px;">';
        htmlBody += 'Your OTP for Account Balance ' +transactionType +' is: <strong>' + otp + '</strong>';
        htmlBody += '</p>';
        htmlBody += '</body></html>';
        
        mail.setHtmlBody(htmlBody);
        
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        
        return 'Successful';
    }
    @AuraEnabled
    public static String updateBalanceVerification(INTEGER otp) {
        OtpCustomSetting__c otpSetting = OtpCustomSetting__c.getInstance(UserInfo.getUserId());
        Decimal storedAmount = otpSetting.storedAmount__c;
        INTEGER storedOtp = (Integer)otpSetting.storedOtp__c;
        String transactionType = otpSetting.storedTransactionType__c;
        system.debug('setttttttings'+otpSetting);
        system.debug('aammount'+storedAmount+'aammount'+storedOtp+'aammount'+otp+transactionType);
        if (storedOtp == otp) {
            if (transactionType=='Withdraw') {
                Id accountId = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()].AccountId;
                Account acc=[SELECT Id, Wallet_Amount__c FROM Account WHERE Id=:accountId LIMIT 1];
                if (acc.Wallet_Amount__c>=storedAmount) {
                    acc.Wallet_Amount__c-=storedAmount;
                    update acc;
                    // storedOtp=null;
                    // storedAmount=null;
                    return 'Successful';
                } else {
                    // storedOtp=null;
                    // storedAmount=null;
                    return 'Low Balance';
                }
            } 
            else if(transactionType=='Deposit') {
                Id accountId = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()].AccountId;
                Account acc=[SELECT Id, Wallet_Amount__c FROM Account WHERE Id=:accountId LIMIT 1];
                acc.Wallet_Amount__c+=storedAmount;
                update acc;
                // storedOtp=null;
                // storedAmount=null;
                return 'Successful';
            }
        }
        return 'Error';
        // String recipientEmail = UserInfo.getUserEmail();
        // Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        // String[] toAddresses = new String[] { recipientEmail };
        // mail.setToAddresses(toAddresses);
        // mail.setSubject('Your OTP for Account Balance ' +transactionType);
        
        // String htmlBody = '<html><body>';
        // htmlBody += '<p style="font-family: Arial, sans-serif; font-size: 16px;">';
        // htmlBody += 'Your OTP for Account Balance ' +transactionType ' is: <strong>' + otp + '</strong>';
        // htmlBody += '</p>';
        // htmlBody += '</body></html>';
        
        // mail.setHtmlBody(htmlBody);
        
        // Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        // storedOtp=null;
        // storedAmount=null;
        
    }
}