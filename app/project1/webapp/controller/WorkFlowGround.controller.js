sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/ui/core/Fragment",
    "sap/m/Label",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Button, Fragment, Label, MessageBox, MessageToast) {
    let NodeKey, LineKey
    return Controller.extend("project1.controller.WorkFlowGround", {
        _currentNode: '', workFlow_Title: '', WorkFlowName: '',
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
                 "nodeKey": "",
                 "Decision": "",
                "lineKey": ""
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
            this.WorkFlowName = oEvent.getParameter('arguments').workflowName;


            this.Fetch_Work_Flow_Ground()



            this.createToolbar()


            MessageToast.show(`${this.WorkFlowName} is opened`)

        },


        createToolbar: function () {
            let WorkFlowName = this.WorkFlowName
            console.log(WorkFlowName);
            var oGraph = this.byId("graph");
            var oToolbar = oGraph.getToolbar();

            oToolbar.insertContent(new Label("title", {
                text: WorkFlowName,
            }), 0);

            oToolbar.insertContent(new Button("addButton", {
                icon: "sap-icon://add",
                press: this.addNode.bind(this)
            }), 2);


        },


        Fetch_Work_Flow_Ground: function () {

            let WorkFlowName = this.WorkFlowName


            let url = `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}WorkflowTemplete('${WorkFlowName}')?$expand=Nodes,Lines`;
            console.log(url);
            let that = this
            $.ajax({
                url: url,
                method: "GET",
                success: function (data) {

                    that.getView().getModel().setData(data)


                    let workflow_Name = that.getView().getModel().getData().workflowName
                    this.WorkFlowName = workflow_Name

                    that.getView().getModel('createNodeModel').setProperty("/workFlowNameNode", workflow_Name);

                    that.getView().getModel('createNodeModel').setProperty('/nodeKey', `${that.generateUUID()}`)

                    that.getView().getModel('createLineModel').setProperty("/workFlowNameLine", workflow_Name);

                },
                error: function (error) {
                    console.log(error);
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

        onCreate_Node: function () {

            let NodeData = this.getView().getModel('createNodeModel').getData()


            if (NodeData.nodeTitle) {
                this.CRUD_Of_Node('POST', null, NodeData)
            } else {
                MessageBox.warning('Please Provide Node Title')
            }

            this.onCancle_Node()
        },

        onCancle_Node: function () {
            this.byId('createNode').close()
        },


        onAdd_Node_Btn: function () {
            this.addNode()
        },




        onEdit_Node_Btn: function (oEvent) {

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
            let Node_Key = oEvent.getSource().getParent().getKey()


            this.CRUD_Of_Node("GET", Node_Key, null)
            NodeKey = Node_Key


        },
        onEdit_Node: function () {


            let Edited_Data = this.getView().getModel('editNodeModel').getData()

            if (Edited_Data.nodeTitle) {
                this.CRUD_Of_Node("PATCH", NodeKey, Edited_Data)
            }
            else {
                MessageBox.warning('Please Provide Node Title')
            }
            this.onEditCancle_Node()

        },
        onEditCancle_Node: function () {
            this.byId('editNode').close()
        },



        onDelete_Node_Btn: function (oEvent) {
            let Node_Key = oEvent.getSource().getParent().getKey()
            console.log(Node_Key);

            let childLines = oEvent.getSource().getParent().getChildLines();

            childLines.forEach((line) => {

                let lineKey = line.getTitle()
                console.log(lineKey);
                this.CRUD_OF_LINE('DELETE', null, lineKey)
                console.log('this line deleted' + line.getTitle());
            })


            if (Node_Key) {
                this.CRUD_Of_Node('DELETE', Node_Key, null)
            } else {
                MessageBox.warning('Please Provide Node Key')
            }


        },



        onCreate_Line_fragment: function (oEvent) {

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

            let Node_Key = oEvent.getSource().getParent().getKey()

            this.getView().getModel('createLineModel').setProperty('/fromNodeKey', Node_Key)
            

            this.getView().getModel('createLineModel').setProperty('/lineKey', `${this.generateUUID()}`)
        },






        on_NodeHelpTo: function () {
            this.on_NodeHelp('toNode');
        },



        on_NodeHelp: function (sCurrentNOde) {

            this._currentNode = sCurrentNOde;
            if (!this.on_NodeHelpDialog) {
                this.on_NodeHelpDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.fragments.nodehelpValue",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this.on_NodeHelpDialog.then((oDialog) => {
                oDialog.open()
            });
        },

        _onValueHelpConfirmPress: function (oEvent) {
            var SelectedItem = oEvent.getParameter("selectedItem").getTitle();

            let currentNode = this.getView().byId(this._currentNode)
            currentNode.setValue(SelectedItem)
        },



        onCreate_Line: function () {
            let Line_Data = this.getView().getModel('editLineModel').getData();

            if (Line_Data.toNodeKey) {
                this.CRUD_OF_LINE('POST', Line_Data, null)
            } else {
                MessageBox.warning('Please Provide Target Node')
            }

            this.onCancle_Line()
        },


        onCancle_Line: function () {
            this.byId('createLine').close()
        },

        linePress: function (oEvent) {
            console.log(oEvent);
            let nodes = oEvent.getSource().getParent().getNodes()
            console.log(nodes);
        },

        nodePress: function (oEvent) {
            let childLines = oEvent.getSource().getChildLines();
            childLines.forEach((line) => {
                console.log(line.getTitle());
            })

        },

        onDelete_Line_Btn: function (oEvent) {
            LineKey = oEvent.getSource().getParent().getTitle();
            console.log(LineKey);


            if (LineKey) {
                this.CRUD_OF_LINE('DELETE', null, LineKey)
            } else {
                MessageBox.warning('Please Select Line Key')
            }

        },



        onDecision_Node_Btn:function(oEvent){
            let Node_Key = oEvent.getSource().getParent().getKey()

            this.getView().getModel('createDecisionModel').setProperty('/nodeKey', Node_Key)

            let childLines = oEvent.getSource().getParent().getChildLines();

            if(childLines.length > 0){
              childLines.forEach((line) => {
                  let lineKey = line.getTitle()
                  console.log('this line  ' + line.getTitle());
              })
            } else {
              console.log('please create a line')
              return;
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
                oDialog.open()
            });
        },
        
        onCreate_Decision:function(){
            console.log( this.getView().getModel('createDecisionModel').getData());
        },

      




        CRUD_Of_Node: function (method, Node_Key, data) {
            switch (method) {
                case "GET": {
                    let that = this
                    $.ajax({
                        url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Nodes('${Node_Key}')`,
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

                            that.Fetch_Work_Flow_Ground()

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
                        url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Nodes('${Node_Key}')`,
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

                            that.Fetch_Work_Flow_Ground()

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
                        url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Nodes('${Node_Key}')`,
                        method: "DELETE",
                        success: function () {

                            MessageToast.show('Node deleted From Work Flow')

                            that.Fetch_Work_Flow_Ground()

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





        CRUD_OF_LINE: function (method, data, lineKey) {
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

                            that.Fetch_Work_Flow_Ground()


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

                            that.Fetch_Work_Flow_Ground()

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