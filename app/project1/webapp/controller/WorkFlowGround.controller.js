sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller,JSONModel) {
	return Controller.extend("project1.controller.WorkFlowGround", {
		onInit: function () {
			var oGraph = this.byId("graph");
            console.log(oGraph);
            let workflowdesignModel = new JSONModel()
            this.getView().setModel(workflowdesignModel)
            let that = this
            $.ajax({
                url:this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'WorkflowTemplete'+'?$expand=Nodes,Lines',
                method:"GET",
                success:function(data){
                    console.log(data.value);
                    that.getView().getModel().setData(data.value[0])
                    console.log(that.getView().getModel().getData());
                },
                error:function(error){
                    console.log(error);
                }
            })
			
		}
	});
	
});