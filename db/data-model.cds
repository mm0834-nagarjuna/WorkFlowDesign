namespace my.workflow;

entity WorkflowTemplete {
  key workflowName        : String(20);
      workflowDescription : String(30);
      Nodes               : Composition of many Nodes
                              on Nodes.workFlowNameNode = $self.workflowName;
      Lines               : Composition of many Lines
                              on Lines.workFlowNameLine = $self.workflowName
}

entity Nodes {
  key nodeKey          : String(10);
      workFlowNameNode : String(15);
      nodeTitle        : String(10);
      nodeDescription  : String(20);
 

      workflowName     : Association to WorkflowTemplete
                           on workflowName.workflowName = $self.workFlowNameNode;
      lines            : Composition of many Lines;
}

entity Lines {
  key lineKey          : String(5);
      workFlowNameLine : String(15);
      fromNodeKey      : String(10);
      toNodeKey        : String(10);

      workflowName     : Association to WorkflowTemplete
                           on workflowName.workflowName = $self.workFlowNameLine;
}

entity Decision {
  key nodeKey  : String(10);
  key Decision : String enum {
        Accept;
        Reject;
        Revert
      };
      lineKey  : String(5);
}
