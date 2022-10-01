public with sharing class AllocationHandler {
    
    public static final String UNASSIGNED_QUEUE_ID = UserInfo.getUserId(); 

    public static Map<String,String> getApplicationUserAllocation(List<Application__c> records, String fieldName){
        Map<String,String> returnMap = new Map<String,String>();
        Set<String> stages = new Set<String>();
        Set<String> subStages = new Set<String>();
        Map<String, String> applicationStageMap = new Map<String, String>();
        Map<String, String> applicationSubStageMap = new Map<String, String>();
        Map<String, String> applicationBranchMap = new Map<String, String>();
        
        Set<String> branches = new Set<String>();
        for(Application__c app : records){
            if((app.Sourcing_Branch__c != NULL)){
                branches.add(app.Sourcing_Branch__c);
            }
        }        
        Map<Id,Branch_Master__c> branchMap = new Map<Id,Branch_Master__c>();
        
        if(!branches.isEmpty()){
            branchMap = new Map<Id,Branch_Master__c>([SELECT Id,Name FROM Branch_Master__c WHERE Id IN : branches]);
        }
        
        for(Application__c app : records){
            System.debug('Application Stage = '+ app.get(fieldName));
            stages.add((String)app.get(fieldName));
            applicationStageMap.put(app.Id, (String)app.get(fieldName));       
            if(app.Sourcing_Branch__c != NULL && branchMap.containsKey(app.Sourcing_Branch__c)){
                applicationBranchMap.put(app.Id, branchMap.get(app.Sourcing_Branch__c).Name);   
            }               
        }
        Map<String,Allocation__c> allocationMap = new Map<String,Allocation__c>();
        allocationMap = getAllocations(stages);   
        if(!allocationMap.isEmpty()){
            Map<String, String> applicationBranchMap_FINAL = new Map<String, String>();
            Map<String, String> applicationStageMap_FINAL = new Map<String, String>();
            Map<String, String> applicationSubStageMap_FINAL = new Map<String, String>();

            for(String appId : applicationStageMap.keySet()){
                if(allocationMap.containsKey(applicationStageMap.get(appId))){
                    Allocation__c ac = allocationMap.get(applicationStageMap.get(appId));
                    if(ac.Allocation_Type__c == 'Push'){
                        applicationStageMap_FINAL.put(appId,applicationStageMap.get(appId));
                        applicationBranchMap_FINAL.put(appId,applicationBranchMap.get(appId));
                    }
                }else{
                    returnMap.put(appId,UNASSIGNED_QUEUE_ID);
                }
            }

            //KULDEEP METHOD
            Map<String,String> applicationUserMap = AllocationHandlerHelper.getUsersNew(applicationBranchMap_FINAL, applicationStageMap_FINAL, 'Round Robin');
            if(applicationUserMap != NULL && !applicationUserMap.isEmpty()){
                returnMap.putAll(applicationUserMap);
            }
        }
        return returnMap;
    }
    
    private static Map<String,Allocation__c> getAllocations(Set<String> stages){
        Map<String,Allocation__c> stageWiseAllocationMap = new Map<String,Allocation__c>();      
        for(Allocation__c all : [SELECT Allocation_Type__c, Mechanism__c, Stage__c FROM Allocation__c WHERE Stage__c IN : stages]){
            stageWiseAllocationMap.put(all.Stage__c, all);
        }
        return stageWiseAllocationMap;
    }    
}