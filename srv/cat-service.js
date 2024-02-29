const cds = require('@sap/cds')
const {WorkflowTemplete} = cds.entities


module.exports = cds.service.impl( (srv) => {
    srv.before('READ', ['WorkflowTemplete'],async function(req){
        const userName =  req.user.id
        
        console.log(userName);
  
    })
    
})