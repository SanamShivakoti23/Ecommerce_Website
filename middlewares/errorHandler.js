// not found

const notfound = (req,res,next)=>{
    const error = new Error(`Not found : ${req.originalUrl}`);
    res.status(404);
    next(error);
}

// error handler

const errorHandler = (err, req, res, next) => {
    const StatusCode  = res.statusCode == 200 ? 500 : res.statusCode;
    
    res.status(StatusCode);
    res.json({
        message : err?.message,
        stack : err?.stack,
    });
};

module.exports = {errorHandler , notfound};