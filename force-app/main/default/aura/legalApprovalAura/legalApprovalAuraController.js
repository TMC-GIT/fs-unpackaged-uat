({
    doinit : function(component, event, helper) {
        console.log('Application Id ' + component.get("v.recordId"));
        var action  = component.get("c.getLegalApproval");
        action.setParams({
            applicationId : component.get("v.recordId"),
        });
        action.setCallback(this, function(response) {
            console.log('verification Record = ',response.getReturnValue());
            component.set('v.recordId', response.getReturnValue().Id);
            let compDefinition = {
                componentDef: "c:legalApprovalLWC",
                attributes: {
                    recordId: component.get("v.recordId")
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