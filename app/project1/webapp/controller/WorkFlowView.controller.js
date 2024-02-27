sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, Filter, FilterOperator, MessageBox,MessageToast) {
        "use strict";

        return Controller.extend("project1.controller.WorkFlowView", {
            onInit: function () {
                let newWorkFlowModel = new JSONModel({
                    workflowName: "",
                    workflowDescription: ""
                })

                let oModel = new JSONModel()
                this.getView().setModel(oModel, 'WorkflowTemplete')
                this.getView().setModel(newWorkFlowModel, "newWorkFlow")

                this.CRUD_OF_WorkFlowTemplete('GET')

            },
            onNewWorkFlow: function () {
                console.log('hello');
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: "project1.fragments.addworkflow",
                        controller: this
                    }).then(function (oDialog) {
                        this.getView().addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                this.pDialog.then((oDialog) => {
                    oDialog.open()
                });
            },

            onCreate_workFlow: function () {

                let newWorkFlowData = this.getView().getModel('newWorkFlow').getData();
                let that = this
                if (newWorkFlowData.workflowName) {

                    this.CRUD_OF_WorkFlowTemplete('POST', newWorkFlowData)
                    this.onCancle_WorkFlow()

                } else {
                    console.log("please provide some data");

                }

            },
            onCancle_WorkFlow: function () {
                this.byId('createWorkFlow').close()
            },
            handleDelete: function (oEvent) {
                console.log(oEvent);
                let oItem = oEvent.getParameters('listItem')
                let title = oItem.listItem.mProperties.title
                console.log(title)

                this.CRUD_OF_WorkFlowTemplete('DELETE', null, title)

            },

            CRUD_OF_WorkFlowTemplete: function (method, data, title) {
                let that = this

                switch (method) {
                    case "GET": {
                        console.log('GET');
                        $.ajax({
                            url: this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'WorkflowTemplete',
                            method: "GET",
                            success: function (data) {
                                console.log(data.value)
                                that.getView().getModel('WorkflowTemplete').setData(data.value)
                                console.log(that.getView().getModel('WorkflowTemplete').getData());
                                
                            },
                            error: function (error) {
                               
                                MessageBox.error(error.responseJSON.error.message)
                            }
                        })
                        break;
                    }
                    case "POST": {
                        console.log('POST');
                        $.ajax({
                            url: this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'WorkflowTemplete',
                            method: "POST",
                            contentType: 'application/json',
                            data: JSON.stringify(data),
                            success: function () {
                                console.log('data posted');

                                that.CRUD_OF_WorkFlowTemplete('GET')

                                that.getView().getModel('newWorkFlow').setData({
                                    workflowName: "",
                                    workflowDescription: ""
                                })

                                MessageToast.show('Work Flow Created')
                            },
                            error: function (error) {
                                MessageBox.error(error.responseJSON.error.message)
                            }

                        })
                        break;
                    }
                    case "PATCH": {
                        console.log('PATCH');
                        break;
                    } case "DELETE": {
                        console.log('DELETE');

                        $.ajax({
                            url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}${'WorkflowTemplete'}('${title}')`,
                            method: "DELETE",
                            success: function () {
                                console.log('Data Deleted');

                                that.CRUD_OF_WorkFlowTemplete('GET')

                                MessageToast.show('Work Flow Deleted ')
                            },
                            error: function (error) {
                                MessageBox.error(error.responseJSON.error.message)
                            }
                        })

                        break;
                    }
                    default: {
                        console.log('default') 
                        break;
                    }
                }
            },
            onSelect: function (oEvent) {
                let workFlowName = oEvent.getSource().getTitle()
                console.log(workFlowName);
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("WorkFlowGround", { workflowName: workFlowName });
            },
            onSearchWorkFlow: function (oEvent) {
                const aFilter = [];
                const sQuery = oEvent.getParameter("query");
                if (sQuery) {

                    const oWorkFlowFilter = new Filter(
                        "workflowName", FilterOperator.Contains, sQuery
                    );
                    aFilter.push(oWorkFlowFilter);
                }

                const oList = this.byId("WorkFlowList");
                const oBinding = oList.getBinding("items");
                oBinding.filter(aFilter);

            },

           

        });
    });
