const fs=require('fs')

const DeleteFile=(filePath)=>{
    fs.unlink(filePath,(err)=>{
        if(err){
            throw(err);
        }
    })
}

module.exports=DeleteFile