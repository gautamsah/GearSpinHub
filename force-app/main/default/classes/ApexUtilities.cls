global class ApexUtilities {
    // public ApexUtilities() {}
    global static String getAccountID(ID userId){
        User user = [SELECT AccountId FROM User WHERE Id = :userId LIMIT 1];
        return user.AccountId;
    }   
}