/*	
*   @Class Name 	: 	PortalRegistrationController
*	@Description 	:	Registration Controller for guest users
*   @Author Name 	:	Rushi Patel (Horizontal Digital)
*/

public without sharing class NewClass {
    @AuraEnabled
    public static RegistrationStatus createPortalUser(String firstName, String lastName, String email){
        Savepoint rollbackStartPoint = Database.setSavepoint();
        RegistrationStatus payload = new RegistrationStatus();
        try{
            String contactId = createAccount(firstName, lastName);
            if(contactId != null || contactId != ''){
                List<User> checkForExistingUser = [SELECT Id FROM User WHERE Email =:email LIMIT 1];
                if(checkForExistingUser.isEmpty()){
                    Id profileId = [SELECT Id, Name FROM Profile WHERE Name = 'Black Bus Portal Login User'].Id;
                    payload = createCommunityUser(firstName , lastName , email , contactId, profileId);
                    if(payload.ErrorOccurred == true){
                        Database.rollback(rollbackStartPoint);
                    }
                    system.debug(payload);
                    return payload;
                }else{
                    Database.rollback(rollbackStartPoint);
                    payload.ErrorOccurred = true;
                    payload.DisplayMessage = 'User already exists!';
                    payload.InternalErrorMessage = 'User already exists!';
                }
            }else{
                Database.rollback(rollbackStartPoint);
                payload.ErrorOccurred = true;
                payload.DisplayMessage = 'Registration failed, please try again later';
                payload.InternalErrorMessage = 'Contact Id does not exist';
            }
        }
        catch(Exception error){
            
        }
        return payload;
    }
    
    public static String createAccount(String firstName, String lastName){
        Account userAccount = new Account(FirstName = firstName,
                                          LastName = lastName,
                                          RecordTypeId = [SELECT Id FROM RecordType WHERE SobjectType ='Account' AND IsActive =True AND DeveloperName ='PersonAccount' LIMIT 1].Id);
        insert userAccount;
        return [SELECT PersonContactId  FROM Account WHERE Id =:userAccount.Id LIMIT 1].PersonContactId; 
    }
    
    public static RegistrationStatus createCommunityUser(String firstName , String lastName , String emailId ,  String contactId, String profileId){
        RegistrationStatus returnData = new RegistrationStatus();
        try{          
            system.debug('FName : '+firstName+' | LName : '+lastName+' | '+' Email : '+emailId+ ' | ContactId : '+contactId+' | Profile Id : '+profileId);
            User communityUser = new User(FirstName = firstName, LastName = lastName,
                                          Email = emailId, ContactId = contactId, ProfileId = profileId,
                                          UserName = emailId, Alias = (firstName.substring(0,1) + lastName).toLowerCase(), CommunityNickName = firstName,
                                          TimeZoneSidKey = 'America/New_York', LocaleSidKey =  UserInfo.getLocale(),
                                          EmailEncodingKey = 'UTF-8', LanguageLocaleKey = 'en_US');
            insert communityUser;
            
            returnData.ErrorOccurred = false;
            returnData.DisplayMessage = 'Registration Successfull';
            returnData.InternalErrorMessage = '';
            returnData.StackTrace = '';
            
            return returnData;
        }
        catch(Exception ex){
            returnData.ErrorOccurred = true;
            returnData.DisplayMessage = 'Registration Failed';
            returnData.InternalErrorMessage = ex.getMessage();
            returnData.StackTrace = ex.getStackTraceString();
            
            return returnData;
        }
    }
    
    public class RegistrationStatus {
        @AuraEnabled public Boolean ErrorOccurred;
        @AuraEnabled public String DisplayMessage;
        @AuraEnabled public String InternalErrorMessage;
        @AuraEnabled public String StackTrace;
 	}
}