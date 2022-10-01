({
	doinit : function(component, event, helper) {
		console.log("Record is loaded successfully.");
        	var action = component.get("c.getVerificationWithType");
            action.setParams({
                applicationId : component.get("v.recordId"),
                recordTypeName : "FIV - B"
            });
            action.setCallback(this, function(response){
                console.log('Verification Record '+ response.getReturnValue());
                component.set('v.verificationRecord', response.getReturnValue());
                helper.getVerificationDetails(component, event, helper);
            })
            $A.enqueueAction(action);            
	}
})