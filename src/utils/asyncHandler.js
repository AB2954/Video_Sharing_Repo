const asyncHandler = (requestHandler) => {
  Promise.resolve(requestHandler)
  .catch(error=>{
    next(error);
  });
}

export { asyncHandler };


/*

// const asynchandler = () => {}
// const asynchandler = () => { ()=>{} } // Higher Order Function to handle a request asynchronously.
// const asyncHandler = () => () => {} // Same Function but removed the curly braces.

const asyncHandler = (fn) => async (req,res,next) => {
  try{
    await fn(req,res,next);
  }catch(error){
    res.status(error.code || 500).json({
      success:false,
      message: `Error executing the request. ${error.message}`
    })
  }
  }
*/ 