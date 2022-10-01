({
	getVerificationDetails : function(component, event, helper) {
		var action  = component.get("c.getAllApplicantMeta");
        action.setParams({
            applicationId : component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            console.log('response',response.getReturnValue());
            component.set('v.allApplicantData', response.getReturnValue());
            var applicantData = JSON.parse(response.getReturnValue().strDataTableData); 
            var applicantIds = [];
            console.log(applicantData);
            for(var i=0; i<applicantData.length; i++){
                applicantIds.push(applicantData[i].Id);    
            }
            component.set('v.allLoanApplicant',applicantIds);
            
            let compDefinition = {
                componentDef: "c:fsFiv_B_Lwc",
                attributes: {
                    recordId: component.get("v.verificationRecord.Id"),
                    allApplicantData : component.get("v.allApplicantData"),
                    allLoanApplicant : component.get("v.allLoanApplicant"),
                    applicationId : component.get("v.verificationRecord.Application__c"),
                    staffLoan : component.get("v.verificationRecord.Application__r.Staff_Loan__c"),
                    riskDocument : component.get("v.verificationRecord.Application__r.Risk_Document__c"),
                    fivBReportGenereated : component.get("v.verificationRecord.If_FIVB_Report_Generated__c"),
                    preLoginOwnerName : component.get("v.verificationRecord.Application__r.Pre_Login__r.Owner.Name"),
                    verificationStatus : component.get("v.verificationRecord.Status__c")
                }
            };
            let encodedCompDef = btoa(JSON.stringify(compDefinition));
            var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
                "url": "/one/one.app#" + encodedCompDef
            });
            urlEvent.fire();  
        });
        $A.enqueueAction(action);
	}
})