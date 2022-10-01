({
    doinit: function(component, event, helper) {
        var eventParams = event.getParams();
        //if(eventParams.changeType === "LOADED") {
            console.log("Record is loaded successfully.");
            var action  = component.get("c.getVerificationWithType");
            action.setParams({
                applicationId : component.get("v.recordId"),
                recordTypeName : "FIV - C" 
            });
            action.setCallback(this, function(response) {
                console.log('Get Record');
                console.log('response',response);
                console.log('verification Record = ',response.getReturnValue());
                component.set('v.verificationRecord', response.getReturnValue());
                component.set('v.recordTypeDetails',response.getReturnValue().RecordType.Name);
                component.set('v.recordId', response.getReturnValue().Id);
                
                let compDefinition = {
                    componentDef: "c:fiv_c_LWC",
                    attributes: {
                        recordId: component.get("v.verificationRecord.Id"),
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
        //} 
        
    }    
})