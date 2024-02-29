using my.workflow as my from '../db/data-model';

service CatalogService @(requires: 'authenticated-user') {
    entity WorkflowTemplete @(restrict:[{
      where: 'author = $user.id'
    }]) as projection on my.WorkflowTemplete;
    entity Nodes as projection on my.Nodes;
    entity Lines as projection on my.Lines;
    entity Decision as projection on my.Decision;
}


