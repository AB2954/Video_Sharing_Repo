class ApiError extends Error{
  constructor(
    statusCode,
    message="Something went wrong",
    errors = [],
    stack,
  ){
    super(message); // Remove the "message" from super to send custom message.
    this.message = message;
    this.errors = errors;
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;

    if(this.stack){
      this.stack = stack
    }else{
      Error.captureStackTrace(this,this.constructor);
    }
  }
};

export { ApiError }