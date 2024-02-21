using my.workflow as my from '../db/data-model';

service CatalogService {
    entity WorkflowTemplete as projection on my.WorkflowTemplete;
    entity Nodes as projection on my.Nodes;
    entity Lines as projection on my.Lines
}
