public without sharing class test {    
    @AuraEnabled
    public static ContentVersion saveFile(Id recordId, String strFileName, String base64Data) {        
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        ContentVersion cv = new ContentVersion();
        cv.Title = strFileName;
        cv.PathOnClient = '/' + strFileName;
        cv.FirstPublishLocationId = recordId;
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        cv.IsMajorVersion = true;
        insert cv;
        return cv;
    }
    
    @AuraEnabled
    public static String setImageUrl(Id recordId){
        list<id> lstConDocs = new list<id>();
        for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:recordId]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }
        if(!lstConDocs.isEmpty()) {
            ContentDistribution cdl = new ContentDistribution();
            cdl.ContentVersionId = [SELECT Id, Title, ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN :lstConDocs LIMIT 1].Id;
            cdl.Name = 'PublicShare';
            insert cdl;            
            return [SELECT DistributionPublicUrl, ContentDownloadUrl FROM ContentDistribution WHERE Id = :cdl.Id LIMIT 1].ContentDownloadUrl;
        }
        else {
            return null;
        }        
    }
    
    @AuraEnabled
    public static void deleteFiles(Id recordId){ 
        list<id> lstConDocs = new list<id>();
        for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:recordId]) {
            lstConDocs.add(cntLink.ContentDocumentId);
        }
        if(!lstConDocs.isEmpty()) {
            delete [SELECT Id FROM ContentDocument WHERE id IN:lstConDocs]; 
        }
    }      
}