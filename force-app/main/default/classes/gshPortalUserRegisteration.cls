/*	
*   @Class Name 	: 	gshPortalUserRegisteration
*	@Description 	:	Registration Controller for guest users
*   @Author Name 	:	Gautam Sah (Horizontal Digital)
*/
public without sharing class gshPortalUserRegisteration {
    
    /********************************************************************************
     * Method       : registerUser
     * Description  : To register User
     * Parameters   : firstName - The first name of the user
     *                lastName - The last name of the user
     *                email - The email address of the user
     * Returns      : String - The registration status message
     ********************************************************************************/
    @AuraEnabled
    public static String registerUser(String firstName, String lastName, String email){
        Savepoint rollbackStartPoint = Database.setSavepoint();
        try {
            System.debug('Received FirstName: ' + firstName);
            System.debug('Received lastName: ' + lastName);
            System.debug('Received Email: ' + email);
            String contactId =	getUserAccContactId( firstName,lastName,email );
            if(contactId != null || contactId != '' ){
                System.debug('Contact Id : '+contactId);
                List<User> checkForExistingUser = [SELECT Id FROM User WHERE Email =:Email LIMIT 1];
                if(checkForExistingUser.isEmpty()){
                    System.debug('No Existing User Found Block');
                    Profile profile = [SELECT Id, Name FROM Profile WHERE Name = 'GSH Community User'];
                    Id profileId = profile.Id;
                    System.debug('Profile Id : '+profileId);
                    String response = createCommUser(firstName , lastName , email , contactId, profileId);

                    // String response = 'Registered Successfully';

                    System.debug('Response : '+response);
                    if(response == 'Registeration Failed'){
                        Database.rollback(rollbackStartPoint);
                        System.debug('Rollback Called');
                        System.debug('Registration Failed');
                    }
                    return response;
                }else{
                    Database.rollback(rollbackStartPoint);
                    System.debug('Rollback Called');
                    System.debug('Email already exists!!!');
                    return 'Email already exists!!!';
                }
            }else{
                Database.rollback(rollbackStartPoint);
                System.debug('Rollback Called');
                system.debug('Contact Id is empty or null');
                return 'Contact Id is empty or null';
            }
        }
        catch(Exception ex){
        Database.rollback(rollbackStartPoint);
        System.debug('Rollback Called');
        System.debug('Error occured while Registration!!!'+ex.getMessage()+' @@ '+ex.getStackTraceString());
        return 'Error occured while Registration!';
    }
}

    /********************************************************************************
     * Method       : getUserAccContactId
     * Description  : To retrieve the contact Id associated with the user account
     * Parameters   : firstName - The first name of the user
     *                lastName - The last name of the user
     *                emailId - The email address of the user
     * Returns      : String - The contact Id
     ********************************************************************************/
    public static String getUserAccContactId(String firstName , String lastName, String emailId ){
        Id personAccountRecordTypeId =  [SELECT Id FROM RecordType WHERE SobjectType ='Account' AND IsActive =True AND DeveloperName ='PersonAccount' LIMIT 1].Id;
        System.debug('personAccountRecordTypeId : '+personAccountRecordTypeId);
        Account userAccount = new Account(FirstName = firstName,LastName = lastName,PersonEmail = emailId,RecordTypeId = personAccountRecordTypeId);
        insert userAccount;
        System.debug('AccountId'+userAccount.Id);
        Id userAccountContactId =[SELECT PersonContactId  FROM Account WHERE Id =:userAccount.Id LIMIT 1].PersonContactId;
        return userAccountContactId;
    }

    /********************************************************************************
     * Method       : createCommUser
     * Description  : To create a community user with the provided details
     * Parameters   : firstName - The first name of the user
     *                lastName - The last name of the user
     *                emailId - The email address of the user
     *                contactId - The contact Id associated with the user
     *                profileId - The profile Id of the community user
     * Returns      : String - The registration status message
     ********************************************************************************/
    public static String createCommUser(String firstName , String lastName , String emailId ,  String contactId, String profileId){
        try{
            system.debug(UserInfo.getLocale());
            
            system.debug('FirstName : '+firstName+' | LastName : '+lastName+' | '+' Email : '+emailId+ ' | ContactId : '+contactId+' | Profile Id : '+profileId);
            User communityUser = new User(FirstName = firstName, LastName = lastName,Email = emailId,ContactId = contactId,
                                            ProfileId = profileId,UserName = emailId,Alias = firstName,CommunityNickName = emailId,TimeZoneSidKey = 'Asia/Colombo',
                                            LocaleSidKey =  'en_US',EmailEncodingKey = 'UTF-8',LanguageLocaleKey = 'en_US' );
            insert communityUser;
            system.debug('Registered Successfully! User Id is: '+communityUser.Id);
            return 'Registered Successfully';
        }
        catch(Exception ex){
            
            system.debug(ex.getMessage());
            system.debug(ex.getStackTraceString());
            return 'Registeration Failed';
        }
    }
}