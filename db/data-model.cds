namespace my.workflow;

entity WorkflowTemplete {
  key workflowName        : String(15);
      workflowDescription : String(30);
      Nodes               : Composition of  many Nodes
                              on Nodes.workFlowNameNode = $self.workflowName;
      Lines               : Composition of   many Lines
                              on Lines.workFlowNameLine = $self.workflowName
}

entity Nodes {
  key nodeKey          : String(10);
      nodeTitle        : String(10);
      nodeDescription  : String(20);
      nodePositionX    : Integer;
      nodePositionY    : Integer;
      workFlowNameNode : String(15) ;
      workflowName     : Association to  WorkflowTemplete
                           on workflowName.workflowName = $self.workFlowNameNode;
}

entity Lines {
  key lineKey          : UUID;
      fromNodeKey      : String(10);
      toNodeKey        : String(10);
      workFlowNameLine : String(15) ;
      workflowName     : Association to  WorkflowTemplete
                           on workflowName.workflowName = $self.workFlowNameLine;
}

entity Decision {
  key nodeKey  : String(10);
  key Decision : String enum {
        Accept;
        Reject;
        Revert
      };
      lineKey  : UUID;
}
