({
    doinit: function(component, event, helper) {
        var eventParams = event.getParams();
            console.log("Record is loaded successfully.");
            var action  = component.get("c.getVerificationWithType");
            action.setParams({
                applicationId : component.get("v.recordId"),
                recordTypeName : "Online EC" 
            });
            action.setCallback(this, function(response) {
                console.log('Get Record');
                console.log('response',response);
                console.log('verification Record = ',response.getReturnValue());
                component.set('v.verificationRecord', response.getReturnValue());
                component.set('v.recordTypeDetails',response.getReturnValue().RecordType.Name);
                //component.set('v.recordId', response.getReturnValue().Id);
                console.log('Verification ##' , component.get("v.verificationRecord").Id);
                console.log('Application ID = ##' , component.get("v.verificationRecord").Application__c);
                console.log('RECORDTYPE NAME= ',component.get("v.verificationRecord").RecordType.Name);
                
                let compDefinition = {
                    componentDef: "c:fsOnlineEcLWC",
                    attributes: {
                        recordId: component.get("v.verificationRecord").Id,
                        applicationId : component.get("v.verificationRecord").Application__c,
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