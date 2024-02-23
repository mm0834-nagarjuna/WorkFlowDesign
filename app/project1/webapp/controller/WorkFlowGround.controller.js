sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/ui/core/Fragment",
    "sap/m/Label",
], function (Controller, JSONModel, Button, Fragment, Label) {
    let NodeKey, workFlow_Title
    return Controller.extend("project1.controller.WorkFlowGround", {
        _currentNode: '',
        onInit: function () {

            let workflowdesignModel = new JSONModel()
            let NodeModel = new JSONModel({
                "nodeKey": "",
                "nodeTitle": "",
                "nodeDescription": "",
                "nodePositionX": 0,
                "nodePositionY": 0,
                "workFlowNameNode": ""
            })

            let LineModel = new JSONModel({
                "workFlowNameLine": "",
                "fromNodeKey": "",
                "toNodeKey": ""
            })
            this.getView().setModel(workflowdesignModel)
            this.getView().setModel(NodeModel, 'createNodeModel')
            this.getView().setModel(NodeModel, 'editNodeModel')
            this.getView().setModel(LineModel, 'createLineModel')

            this.Fetch_Work_Flow_Ground()
           

            this.createToolbar()

        },
        createToolbar: function () {
            var oGraph = this.byId("graph");
            var oToolbar = oGraph.getToolbar();

            oToolbar.insertContent(new Label("title", {
                text: workFlow_Title ? workFlow_Title : 'Work Flow Title'
            }), 0);

            oToolbar.insertContent(new Button("addButton", {
                icon: "sap-icon://add",
                press: this.addNode.bind(this)
            }), 2);
        },


        Fetch_Work_Flow_Ground: function () {
            let that = this
            $.ajax({
                url: this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'WorkflowTemplete' + '?$expand=Nodes,Lines',
                method: "GET",
                success: function (data) {
                    console.log(data.value);
                    that.getView().getModel().setData(data.value[0])
                    console.log(that.getView().getModel().getProperty('/Nodes'));
                    let workflow_Name = that.getView().getModel().getData().workflowName
                   

                    // need to add the work flow title to the ground

                    // workFlow_Title = workflow_Name
                    // console.log(workFlow_Title);
                    that.getView().getModel('createNodeModel').setProperty("/workFlowNameNode", workflow_Name);
                    that.getView().getModel('createLineModel').setProperty("/workFlowNameLine", workflow_Name);

                },
                error: function (error) {
                    console.log(error) // need to add the Error Message;
                }
            })
        },

   


        addNode: function () {
            console.log('node PopUp');
            // console.log(this.getView());

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
            console.log('node create function');
            let NodeData = this.getView().getModel('createNodeModel').getData()
            console.log(NodeData);

            this.CRUD_Of_Node('POST', null, NodeData)

            

            this.onCancle_Node()
        },
        onCancle_Node: function () {

            this.byId('createNode').close()
        },
        
        
        onAdd_Node_Btn: function () {
            
            this.addNode()
        },




        onEdit_Node_Btn: function (oEvent) {
               console.log('Edit Node Popup');

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
                console.log( this.editNodeDialog);
            });
            let Node_Key = oEvent.getSource().getParent().getKey()
            console.log(Node_Key);

            this.CRUD_Of_Node("GET", Node_Key, null)
            NodeKey = Node_Key


        },
        onEdit_Node: function () {
            console.log('edit Clicked');
            console.log(NodeKey);
            let Edited_Data = this.getView().getModel('editNodeModel').getData()
            console.log(Edited_Data);

            this.CRUD_Of_Node("PUT", NodeKey, Edited_Data)

           
           


            this.onEditCancle_Node()

        },
        onEditCancle_Node: function () {
            this.byId('editNode').close()
        },
       


        onDelete_Node_Btn: function (oEvent) {
            let Node_Key = oEvent.getSource().getParent().getKey()
            console.log(Node_Key);
            this.CRUD_Of_Node('DELETE', Node_Key, null)
         
        },



        onCreate_Line_fragment: function () {
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
        },

        onCreate_Line:function(){
           let Line_Data = this.getView().getModel('createLineModel').getData()
           console.log(Line_Data);
        },

        onCancle_Line:function(){
            this.byId('createLine').close()
        },

        on_NodeHelpFrom: function (){
            this.on_NodeHelp('fromNode');
        },

        on_NodeHelpTo: function (){
            this.on_NodeHelp('toNode');
        },



        on_NodeHelp:function(sCurrentNOde){
            console.log('on_NodeHelp');
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
            console.log(SelectedItem);

            let currentNode = this.getView().byId(this._currentNode)
            // let toNode = this.getView().byId('toNode')



            currentNode.setValue(SelectedItem)
            // toNode.setValue(SelectedItem)

            
        
        },
        onCreate_Line:function(){
            console.log(this.getView().getModel('createLineModel').getData());
        },
        







        CRUD_Of_Node: function (method, Node_Key, data) {
            switch (method) {
                case "GET": {
                    let that = this
                    $.ajax({
                        url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Nodes('${Node_Key}')`,
                        method: "GET",
                        success: function (data) {
                            // console.log(data);
                            that.getView().getModel('editNodeModel').setData(data)
                            // console.log(that.getView().getModel('editNodeModel').getData());
                        },
                        error: function (error) {
                            console.log(error) // need to add the Error Message;
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
                            console.log('node Saved to Data Base');
                            that.Fetch_Work_Flow_Ground()


                            that.getView().getModel('createNodeModel').setData({
                                "nodeKey": "",
                                "nodeTitle": "",
                                "nodeDescription": "",
                                
                                "workFlowNameNode": ""
                            })
                        },
                        error: function (error) {
                            console.log(error) // need to add the Error Message
                        }
                    })
                    break;
                }

                case "PUT": {
                    console.log('PUT');
                    let that = this
                    $.ajax({
                        url: `${this.getOwnerComponent().getModel('workflowdesign').getServiceUrl()}Nodes('${Node_Key}')`,
                        method: "PUT",
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function () {
                            console.log('node Edited in Data Base');
                            this.Fetch_Work_Flow_Ground()

                            that.getView().getModel('createNodeModel').setData({
                                "nodeKey": "",
                                "nodeTitle": "",
                                "nodeDescription": "",
                                
                                "workFlowNameNode": ""
                            })
                        },
                        error: function (error) {
                            console.log(error) // need to add the Error Message
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
                            console.log('Node deleted From Work Flow');
                            this.Fetch_Work_Flow_Ground()
                        },
                        error: function (error) {
                            console.log(error) // need to add the Error Message
                        }
                    })
                    break;
                }
                default: {
                    console.log('Default')
                    break;
                }
            }
        }
    });

});