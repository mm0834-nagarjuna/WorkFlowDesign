namespace my.workflow;

entity WorkflowTemplete {
  key workflowName        : String(15);
      workflowDescription : String(30);
      Nodes               : Association to many Nodes
                              on Nodes.workFlowNameNode = $self.workflowName;
      Lines               : Association to many Lines
                              on Lines.workFlowNameLine = $self.workflowName
}

entity Nodes {
  key nodeKey          : String(10);
      nodeTitle        : String(10);
      nodeDescription  : String(20);
      nodePositionX    : Integer;
      nodePositionY    : Integer;
      workFlowNameNode : String(15) not null;
      workflowName     : Composition of WorkflowTemplete
                           on workflowName.workflowName = $self.workFlowNameNode;
}

entity Lines {
  key lineKey          : UUID;
      fromNodeKey      : String(10);
      toNodeKey        : String(10);
      workFlowNameLine : String(15) not null;
      workflowName     : Composition of WorkflowTemplete
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
