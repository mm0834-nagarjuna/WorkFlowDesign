sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/ui/core/Fragment",
    "sap/m/Label",
], function (Controller,JSONModel,Button, Fragment, Label) {
    
	return Controller.extend("project1.controller.WorkFlowGround", {
		onInit: function () {
            let workFlow_Title=""
            let workflowdesignModel = new JSONModel()
            let createNodeModel = new JSONModel({
                "nodeKey"         : "",
                "nodeTitle"        : "",
                "nodeDescription"  : "",
                "nodePositionX"   :0,
                "nodePositionY"   :0,
                "workFlowNameNode" : ""
            })
            this.getView().setModel(workflowdesignModel)
            this.getView().setModel(createNodeModel, 'createNodeModel')
            let that = this
            $.ajax({
                url:this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'WorkflowTemplete'+'?$expand=Nodes,Lines',
                method:"GET",
                success:function(data){
                    console.log(data.value);
                    that.getView().getModel().setData(data.value[0])
                    console.log(that.getView().getModel().getData());
                    let workflow_Name = that.getView().getModel().getData().workflowName
                    console.log(workflow_Name);
                    // workFlow_Title = workflow_Name
                    // console.log(workFlow_Title);
                    that.getView().getModel('createNodeModel').setProperty("/workFlowNameNode", workflow_Name);
                    
                },
                error:function(error){
                    console.log(error);
                }
            })


			var oGraph = this.byId("graph");
            console.log(oGraph);
            oToolbar = this.getView().byId("graph").getToolbar();
            console.log(oToolbar);
           
            oToolbar.insertContent(new Label("title", {
				text: 'Work Flow Title'
			}), 0);


            oToolbar.insertContent(new Button("addButton", {
				
				icon: "sap-icon://add",
				// press: this.addNode.bind(oGraph)
                press: ()=> this.addNode()
			}), 1);

           
			
		},
        addNode: function(){
            console.log('node PopUp');
            // console.log(this.getView());

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "project1.fragments.addnode",
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
        onCreate_Node:function(){
            console.log('node create function');
         let NodeData =    this.getView().getModel('createNodeModel').getData()
         console.log(NodeData);
         $.ajax({
            url:this.getOwnerComponent().getModel('workflowdesign').getServiceUrl() + 'Nodes',
            method:"POST",
            contentType:'application/json',
            data:JSON.stringify(NodeData),
            success:function(){
                console.log('node Saved to Data Base');
            },
            error:function(){
                console.log(error)
            }
         })
         this.onCancle_Node()
        },
        onCancle_Node: function(){
            this.byId('createNode').close()
        },
        onAdd_Node_Btn:function(){
            this.addNode()
        }
	});
	
});