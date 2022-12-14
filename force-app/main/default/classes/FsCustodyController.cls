public without sharing class  FsCustodyController {
    
    @AuraEnabled
    public static String createRecords(String wrpObject){
        Custody__c custodyObj = new Custody__c();
        custodyObj = (Custody__c)JSON.deserialize(wrpObject, Custody__c.class);
        upsert custodyObj;
        return custodyObj.Id;
    }
    
    @AuraEnabled
    public static List<ContentVersion> getAdditionalRecords(String parentId){
        return [SELECT Id, CreatedDate, ContentDocumentId, Remarks__c, Title, Uploaded_From__c, Document_Name__c, Parent_Id__c, Current_Record_Id__c,
                                Agreement_Document_Type__c, Owner.Name, Document_Number__c, Document_Date__c, Number_of_Pages__c, Document_Condition__c
                                FROM ContentVersion WHERE Is_Additional_Document__c = true AND Parent_Id__c =: parentId];
    }
    
   
    @AuraEnabled
    public static Custody__c getExistingRecord(String recordId){
        Custody__c csObj;
        List<Custody__c> csobjList = [SELECT Id,Old_Application_Number__c, Name, Stage_in_Date__c, Application_Number__c,Application_Number__r.Name, Loan_Account_Number__c, Disbursement_Date__c, Branch_Name__c, State__c, Application_Type__c, File_Inward_Status__c, Remarks__c, Handoff_Date__c, File__c, Box_Bar_Code__c, Storage_Vendor_Name__c, File_Status__c, Maker_Id__c, Checker_Id__c, Maker__c, Checker_Remarks__c, Customer_Name__c FROM Custody__c WHERE Application_Number__c =:recordId LIMIT 1];
        if(csobjList.size()>0){
            csObj=csobjList[0];
            //  csObj.ApplicationExternalId = csobjList[0].Application_Number__r.Name;
            return csObj;
        }
        return null;
    }
    
    @AuraEnabled
    public static String getSource(String recordId){
        
        String appval='';
        List<Application__c> appList= [SELECT Id,Pre_Login__r.recordtype.name,Sourcing_Branch__r.State__c,Sourcing_Branch__c,(select Id,Customer_Type__c,Applicant_Name__c from Loan_Applicants__r where Customer_Type__c=:'Primary Applicant' LIMIT 1) FROM Application__c WHERE Id =:recordId LIMIT 1];
        
        if(appList.size()>0){
            for(Application__c appObj : appList){
                appval+=appObj.Sourcing_Branch__c;
                appval+='#';
                appval+=appObj.Sourcing_Branch__r.State__c;
                appval+='#';
                appval+=appObj.Pre_Login__r.recordtype.name;
                appval+='#';
                for(Loan_Applicant__c loanAppObj : appObj.Loan_Applicants__r){
                    appval+=loanAppObj.Id;
                }
            }
        }
        
        return appval;   
    }
    
    @AuraEnabled
    public static String getAccess(){
        
        List<PermissionSetAssignment> permissionSetList =  [SELECT Id, PermissionSetId, PermissionSet.Name, PermissionSet.ProfileId, PermissionSet.Profile.Name, AssigneeId, Assignee.Name FROM PermissionSetAssignment WHERE AssigneeId=:UserInfo.getUserId()];
        if(permissionSetList.size()>0){
            for(PermissionSetAssignment psObj : permissionSetList){
                if(psObj.PermissionSet.Name=='File_Inward_Permission_Set'){
                    return 'fileInward';
                }else if(psObj.PermissionSet.Name=='Vendor_Handoff_permission_Set'){
                    return 'custodyStorage';
                }else if(psObj.PermissionSet.Name=='Document_Checker_Permission_Set'){
                    return 'vdc';
                }else if(psObj.PermissionSet.Name=='Document_Maker_Permission_Set'){
                    return 'doc';
                }
            }
        }
        
        User userObj = new User();
        userObj = [select Id,profile.name,Name from User where Id =:UserInfo.getUserId()];
        if(userObj.profile.name == 'System Administrator' ){
            return 'admin';
        }
        
        return '';
    }
    
    @AuraEnabled
    public static String getRepaymentDoc(String recordId){
        
        List<Application__c> appList= [select id,(Select Id,ContentDocument.title, LinkedEntityId, ContentDocumentId FROM ContentDocumentLinks) from Application__c where Id=:recordId];
        
        if(appList.size()>0){
            
            for(Application__c appObj : appList){
                for(ContentDocumentLink obj : appObj.ContentDocumentLinks){
                    if(obj.ContentDocument.title=='RepaySchedule'){
                        return obj.ContentDocumentId;
                    }
                }
            }
        }
        
        return '';
        
        
        /*  List<ContentVersion> contentVersionList = [SELECT Id,Title, ContentDocumentId, FirstPublishLocationId FROM ContentVersion where FirstPublishLocationId =:recordId AND Title='RepaySchedule'];
if(contentVersionList.size()>0){
return contentVersionList[0].ContentDocumentId;
}
return '';*/
    }
    
    
    @AuraEnabled
    public static string getUsers(){
        
        String chckerId='';
        String makerId='';
        String userIds='';
        for(User userObj : [select Id,Name from User where Name =:'Custody Document Checker' OR Name =:'Custody Document Maker']){
            if(userObj.Name=='Custody Document Checker'){
                chckerId+=userObj.Id;
            }else{
                makerId+=userObj.Id;
            }
        }
        
        userIds = chckerId+'#'+makerId;
        
        return userIds;
        
    }
    @AuraEnabled
    public static List<DocWrapper> getContentVersionRecordsNew(String parentId){
        List<ContentVersion> listOfContentVersion = new List<ContentVersion>();
        List<DocWrapper> wrapperList = new List<DocWrapper>();
        Map<String,String> mapOfDocSetCode = new Map<String,String>();
        Set<String> docNames = new Set<String>();
        listOfContentVersion = [SELECT Id, CreatedDate, ContentDocumentId, Remarks__c, Title, Uploaded_From__c, Document_Name__c, Parent_Id__c, Current_Record_Id__c,
                                Agreement_Document_Type__c, Owner.Name, Document_Number__c, Document_Date__c, Number_of_Pages__c, Document_Condition__c
                                FROM ContentVersion 
                                WHERE Parent_Id__c =:parentId];
        
        for(ContentVersion cv : listOfContentVersion){
            if(String.isNotBlank(cv.Document_Name__c)){
                docNames.add(cv.Document_Name__c);
            }
        }
        
        if(!docNames.isEmpty()){
            for(Document_Set_Code__c docSetCode : [SELECT Id, Document_Set_Code__c FROM Document_Set_Code__c WHERE Id IN: docNames]){
                mapOfDocSetCode.put(docSetCode.Id, docSetCode.Document_Set_Code__c);
            }
            
            for(ContentVersion cv : listOfContentVersion){
                DocWrapper docWrapObj = new DocWrapper();
                docWrapObj.cv = cv;
                if(String.isNotBlank(cv.Document_Name__c) && mapOfDocSetCode.containsKey(cv.Document_Name__c)){
                    docWrapObj.docNumber = mapOfDocSetCode.get(cv.Document_Name__c);
                }
                wrapperList.add(docWrapObj);
            }
            
        }
        return wrapperList;
    }
    
    public class DocWrapper{
        @AuraEnabled public ContentVersion cv;
        @AuraEnabled public String docNumber;
        
        public DocWrapper(){
            cv = new ContentVersion();
            docNumber = '';
        }
    }
}