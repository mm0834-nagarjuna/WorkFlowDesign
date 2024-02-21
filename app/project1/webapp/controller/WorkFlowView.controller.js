sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel) {
        "use strict";

        return Controller.extend("project1.controller.WorkFlowView", {
            onInit: function () {
                let oModel = new JSONModel()
                this.getView().setModel(oModel, 'WorkflowTemplete')
                let url = this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()+'WorkflowTemplete'
                console.log(url);
                this.fetchData(url)
            },
            fetchData: function(url){
                let that = this
                $.ajax({
                    url:url,
                    method:"GET",
                    success: function(data){
                        console.log(data.value)
                        that.getView().getModel('WorkflowTemplete').setData(data.value)
                        console.log(that.getView().getModel('WorkflowTemplete').getData());
                    },
                    error: function(error){
                        console.log(error);
                    }
                })
            }
        });
    });
