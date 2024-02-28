sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/ui/core/Fragment",
    "sap/m/Label",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
], function (Controller, JSONModel, Button, Fragment, Label, MessageBox, MessageToast) {
    let oNodeKey, LineKey
    return Controller.extend("project1.controller.WorkFlowGround", {
        _currentNode: '', _WorkFlowName: '',
        onInit: function () {

            let workflowdesignModel = new JSONModel()

            let NodeModel = new JSONModel({
                "nodeKey": "",
                "nodeTitle": "",
                "nodeDescription": "",
                "workFlowNameNode": ""
            })

            let LineModel = new JSONModel({
                "workFlowNameLine": "",
                "fromNodeKey": "",
                "toNodeKey": "",
                "lineKey": ''
            })

            let DecisionModel = new JSONModel({
                "from_NodeKey": "",
                "Decision": "",
                "to_NodeKey": ""
            })

            this.getView().setModel(workflowdesignModel)
            this.getView().setModel(NodeModel, 'createNodeModel')
            this.getView().setModel(NodeModel, 'editNodeModel')
            this.getView().setModel(LineModel, 'createLineModel')
            this.getView().setModel(LineModel, 'editLineModel')
            this.getView().setModel(DecisionModel, "createDecisionModel")

            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute('WorkFlowGround').attachPatternMatched(this._onObjectMatched, this)



        },
        _onObjectMatched: function (oEvent) {
            this._WorkFlowName = oEvent.getParameter('arguments').workflowName;

            this.fetchWorkFlowGround()

            this.createToolbar()

            MessageToast.show(`${this._WorkFlowName} is opened`)


        },




        createToolbar: function () {
            let WorkFlowName = this._WorkFlowName
            var oGraph = this.byId("graph");
            var oToolbar = oGraph.getToolbar();

            oToolbar.insertContent(new Label("title", {
                text: WorkFlowName,
            }), 0);

            oToolbar.insertContent(new Button("addButton", {
                icon: "sap-icon://add",
                press: this.addNode.bind(this)
            }), 1);


            oToolbar.insertContent(new Button("backButton", {
                icon: "sap-icon://nav-back",
                press: this.navBack.bind(this)
            }), -1);


        },

        navBack: function () {

            window.history.go(-1);

        },


        fetchWorkFlowGround: function () {

            let WorkFlowName = this._WorkFlowName

            let url = `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}WorkflowTemplete('${WorkFlowName}')?$expand=Nodes,Lines`;
            let that = this
            $.ajax({
                url: url,
                method: "GET",
                success: function (data) {

                    that.getView().getModel().setData(data)



                    that.getView().getModel('createNodeModel').setProperty("/workFlowNameNode", WorkFlowName);

                    that.getView().getModel('createNodeModel').setProperty('/nodeKey', `${that.generateUUID()}`)

                    that.getView().getModel('createLineModel').setProperty("/workFlowNameLine", WorkFlowName);

                },
                error: function (error) {
                    //error message
                    MessageBox.error(error.responseJSON.error.message)
                }
            })
        },




        addNode: function () {

            if (!this.NodeDialog) {
                this.NodeDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.fragments.addnode",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this.NodeDialog.then((oDialog) => {
                oDialog.open()
            });

        },

        onCreateNode: function () {

            let NodeData = this.getView().getModel('createNodeModel').getData()


            if (NodeData.nodeTitle) {
                this.CRUDOfNode('POST', null, NodeData)
            } else {
                MessageBox.warning('Please Provide Node Title')
            }

            this.onCancleNode()
        },

        onCancleNode: function () {
            this.byId('createNode').close()
        },


        onAddNodeBtn: function () {
            this.addNode()
        },


        onEditNodeBtn: function (oEvent) {

            if (!this.editNodeDialog) {
                this.editNodeDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.fragments.editnode",
                    controller: this
                }).then(function (oEditDialog) {
                    this.getView().addDependent(oEditDialog);
                    return oEditDialog;
                }.bind(this));
            }
            this.editNodeDialog.then((oEditDialog) => {
                oEditDialog.open()
                console.log(this.editNodeDialog);
            });
            let NodeKey = oEvent.getSource().getParent().getKey()


            this.CRUDOfNode("GET", NodeKey, null)
            oNodeKey = NodeKey


        },
        onEditNode: function () {


            let EditedData = this.getView().getModel('editNodeModel').getData()

            if (EditedData.nodeTitle) {
                this.CRUDOfNode("PATCH", oNodeKey, EditedData)
            }
            else {
                MessageBox.warning('Please Provide Node Title')
            }
            this.onEditCancleNode()

        },
        onEditCancleNode: function () {
            this.byId('editNode').close()
        },



        onDeleteNodeBtn: function (oEvent) {
            let NodeKey = oEvent.getSource().getParent().getKey()


            let childLines = oEvent.getSource().getParent().getChildLines();
            let parentLines = oEvent.getSource().getParent().getParentLines()


            parentLines.forEach((line) => {

                let lineKey = line.getTitle()
                console.log(lineKey);
                this.crudOfLine('DELETE', null, lineKey)
                console.log('this line deleted' + line.getTitle());
            })

            childLines.forEach((line) => {

                let lineKey = line.getTitle()

                this.crudOfLine('DELETE', null, lineKey)
            })


            if (NodeKey) {
                this.CRUDOfNode('DELETE', NodeKey, null)
            } else {
                MessageBox.warning('Please Provide Node Key')
            }
        },



        onCreateLinefragment: function (oEvent) {

            if (!this.LineDialog) {
                this.LineDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.fragments.addline",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this.LineDialog.then((oDialog) => {
                oDialog.open()
            });

            let NodeKey = oEvent.getSource().getParent().getKey()

            this.getView().getModel('createLineModel').setProperty('/fromNodeKey', NodeKey)

            this.getView().getModel('createLineModel').setProperty('/lineKey', `${this.generateUUID()}`)
        },






        onNodeHelpTo: function () {
            this.onNodeHelp('toNode');
        },

        onNodeHelp: function (sCurrentNOde) {

            this._currentNode = sCurrentNOde;
            if (!this.onNodeHelpDialog) {
                this.onNodeHelpDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.fragments.nodehelpValue",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this.onNodeHelpDialog.then((oDialog) => {
                oDialog.open()
            });
        },

        _onValueHelpConfirmPress: function (oEvent) {
            var SelectedItem = oEvent.getParameter("selectedItem").getTitle();

            let currentNode = this.getView().byId(this._currentNode)
            currentNode.setValue(SelectedItem)
        },



        onCreateLine: function () {
            let oLineData = this.getView().getModel('editLineModel').getData();

            if (oLineData.toNodeKey) {
                this.crudOfLine('POST', oLineData, null)
            } else {
                MessageBox.warning('Please Provide Target Node')
            }

            this.onCancleLine()
        },


        onCancleLine: function () {
            this.byId('createLine').close()
        },



        onDeleteLineBtn: function (oEvent) {
            LineKey = oEvent.getSource().getParent().getTitle();


            if (LineKey) {
                this.crudOfLine('DELETE', null, LineKey)
            } else {
                MessageBox.warning('Please Select Line Key')
            }

        },


        onDecisionNodeBtn: function (oEvent) {
            let NodeKey = oEvent.getSource().getParent().getKey()

            this.getView().getModel('createDecisionModel').setProperty('/from_NodeKey', NodeKey)

            let nodes = this.byId('graph').getNodes()
            let nodesArray = []
            if (nodes.length > 0) {
                nodes.forEach((node) => {
                    nodesArray.push(node.getBindingContext().getObject())
                })
            }

            if (!this.on_DecisionDialog) {
                this.on_DecisionDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.fragments.decision",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this.on_DecisionDialog.then((oDialog) => {


                const oComboBox = this.byId('lineComboBox');
                oComboBox.setModel(new JSONModel(nodesArray));
                oComboBox.bindAggregation("items", {
                    path: "/",
                    template: new sap.ui.core.ListItem({
                        key: "{nodeKey}",
                        text: "{nodeKey}",
                        additionalText: "{nodeTitle}"
                    })
                });


                oDialog.open()
            });
        },

        onCreateDecision: function () {
            let decisionData = this.getView().getModel('createDecisionModel').getData();
            let that = this;

            let decisionNode = {
                "nodeKey": `${that.generateUUID()}`,
                "nodeTitle": decisionData.Decision,
                "workFlowNameNode": that._WorkFlowName
            };

            let decisionConnectorLine = {
                "workFlowNameLine": that._WorkFlowName,
                "fromNodeKey": decisionData.from_NodeKey,
                "toNodeKey": decisionNode.nodeKey,
                "lineKey": `${that.generateUUID()}`
            };

            let nodeConnectorLine = {
                "workFlowNameLine": that._WorkFlowName,
                "fromNodeKey": decisionNode.nodeKey,
                "toNodeKey": decisionData.to_NodeKey,
                "lineKey": `${that.generateUUID()}`
            };


            if (decisionData.from_NodeKey && decisionNode.nodeKey && nodeConnectorLine.toNodeKey && decisionConnectorLine.fromNodeKey && decisionNode.nodeTitle) {
                $.ajax({
                    url: this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'Decision',
                    method: "POST",
                    contentType: 'application/json',
                    data: JSON.stringify(decisionData),
                    success: function () {
                        that.CRUDOfNode('POST', null, decisionNode)
                        that.crudOfLine("POST", decisionConnectorLine, null)
                        that.crudOfLine("POST", nodeConnectorLine, null)
                        MessageToast.show('Decision Created')

                        that.getView().getModel('createDecisionModel').setData({
                            "from_NodeKey": "",
                            "Decision": "",
                            "to_NodeKey": ""
                        })
                    },
                    error: function (Error) {
                        MessageBox.error(Error.responseJSON.error.message)
                    }
                })
            } else {
                MessageBox.warning('please provide Valid Data')
            }



            this.onCancleDecision();
        },
        onCancleDecision: function () {
            this.byId('createDecision').close();
        },


        CRUDOfNode: function (method, NodeKey, data) {
            switch (method) {
                case "GET": {
                    let that = this
                    $.ajax({
                        url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Nodes('${NodeKey}')`,
                        method: "GET",
                        success: function (data) {

                            that.getView().getModel('editNodeModel').setData(data)

                        },
                        error: function (error) {

                            MessageBox.error(error.responseJSON.error.message)

                        }
                    })

                    break;
                }
                case "POST": {
                    let that = this
                    $.ajax({
                        url: this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'Nodes',
                        method: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function () {
                            MessageToast.show('Node Created')


                            that.getView().getModel('createNodeModel').setData({
                                "nodeKey": "",
                                "nodeTitle": "",
                                "nodeDescription": "",
                                "workFlowNameNode": ""
                            })

                            that.fetchWorkFlowGround()

                        },
                        error: function (error) {
                            MessageBox.error(error.responseJSON.error.message)
                        }
                    })
                    break;
                }


                case "PATCH": {
                    console.log('PATCH');
                    let that = this
                    $.ajax({
                        url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Nodes('${NodeKey}')`,
                        method: "PATCH",
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function () {
                            console.log('node Edited in Data Base');

                            MessageToast.show('Node Updated')

                            that.getView().getModel('createNodeModel').setData({
                                "nodeKey": "",
                                "nodeTitle": "",
                                "nodeDescription": "",
                                "workFlowNameNode": ""
                            })

                            that.fetchWorkFlowGround()

                        },
                        error: function (error) {
                            MessageBox.error(error.responseJSON.error.message)

                        }
                    })
                    break;
                }
                case "DELETE": {
                    console.log('Delete');
                    let that = this
                    $.ajax({
                        url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Nodes('${NodeKey}')`,
                        method: "DELETE",
                        success: function () {

                            MessageToast.show('Node deleted From Work Flow')

                            that.fetchWorkFlowGround()

                        },
                        error: function (error) {
                            MessageBox.error(error.responseJSON.error.message)

                        }
                    })
                    break;
                }
                default: {
                    console.log('Default')
                    break;
                }
            }
        },





        crudOfLine: function (method, data, lineKey) {
            switch (method) {
                case "GET": {
                    console.log('GET Method For Lines');
                    break;
                }
                case "POST": {
                    let that = this
                    $.ajax({
                        url: this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'Lines',
                        method: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function () {

                            MessageToast.show('Line Created')

                            that.fetchWorkFlowGround()


                            that.getView().getModel('editLineModel').setData({
                                "workFlowNameLine": "",
                                "fromNodeKey": "",
                                "toNodeKey": ""
                            })

                        },
                        error: function (error) {
                            MessageBox.error(error.responseJSON.error.message)

                        }
                    })
                    break;
                }
                case 'DELETE': {
                    console.log(lineKey);
                    let that = this
                    console.log(`${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Lines('${lineKey}')`);
                    $.ajax({
                        url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Lines('${lineKey}')`,
                        method: "DELETE",
                        success: function () {
                            console.log('Line deleted From Work Flow');
                            MessageToast.show('Line Deleted')

                            that.fetchWorkFlowGround()

                        },
                        error: function (error) {
                            MessageBox.error(error.responseJSON.error.message)

                        }
                    })

                    break;
                }
                default: {
                    MessageToast.show('Please Select Correct Methos')
                }
            }
        },

        generateUUID: function () {
            return Math.floor(1000 + Math.random() * 9000);

        }

    });

});