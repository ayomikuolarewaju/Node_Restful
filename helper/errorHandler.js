function errorHandler(err,req,res,next){
     if(err){
        return res.status(500).json({message:'error from server'})
     }
}




module.exports = errorHandler