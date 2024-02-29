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
    function (Controller, JSONModel, Fragment, Filter, FilterOperator, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("project1.controller.WorkFlowView", {
            onInit: function () {
                let oNewWorkFlowModel = new JSONModel({
                    workflowName: "",
                    workflowDescription: "",

                })

                this.getView().setModel(oNewWorkFlowModel, "oNewWorkFlow")
            },

            onNewWorkFlow: function () {

                if (!this.onNewWorkFlowDialog) {
                    this.onNewWorkFlowDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: "project1.fragments.addworkflow",
                        controller: this
                    }).then(function (oDialog) {
                        this.getView().addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                this.onNewWorkFlowDialog.then((oDialog) => {
                    oDialog.open()
                });
            },

            onCreateWorkFlow: function () {

                let oNewWorkFlowData = this.getView().getModel('oNewWorkFlow').getData();

                if (oNewWorkFlowData.workflowName) {

                    this.crudOfWorkFlowTemplate('POST', oNewWorkFlowData)
                    this.onCancelWorkFlow()


                } else {
                    MessageBox.warning('please provide Work Flow Name')

                }

            },
            onCancelWorkFlow: function () {
                this.byId('createWorkFlow').close()
            },
            handleDelete: function (oEvent) {

                let oItem = oEvent.getParameters('listItem')
                let oTitle = oItem.listItem.mProperties.title


                this.crudOfWorkFlowTemplate('DELETE', null, oTitle)

            },

            crudOfWorkFlowTemplate: function (method, data, title) {
                let that = this

                switch (method) {
                    case "POST": {

                        $.ajax({
                            url: this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'WorkflowTemplete',
                            method: "POST",
                            contentType: 'application/json',
                            data: JSON.stringify(data),
                            success: function () {


                                that.crudOfWorkFlowTemplate('GET')

                                that.getView().getModel('oNewWorkFlow').setData({
                                    workflowName: "",
                                    workflowDescription: ""
                                })

                                that.onPageRefresh()

                                MessageToast.show('Work Flow Created')
                            },
                            error: function (error) {
                                MessageBox.error(error.responseJSON.error.message)
                            }

                        })

                        break;
                    }

                    case "DELETE": {


                        $.ajax({
                            url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}${'WorkflowTemplete'}('${title}')`,
                            method: "DELETE",
                            success: function () {


                                that.crudOfWorkFlowTemplate('GET')

                                that.onPageRefresh()

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

                    }
                }
            },
            onSelect: function (oEvent) {
                let oworkFlowName = oEvent.getSource().getTitle()
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("WorkFlowGround", { workflowName: oworkFlowName });
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
            onPageRefresh: function () {
                let oBind = this.byId('WorkFlowList').getBinding('items')
                oBind.refresh()
                MessageToast.show('Data Refreshed')
            }
        });
    });
