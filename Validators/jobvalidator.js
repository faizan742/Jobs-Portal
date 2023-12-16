
const Joi = require('joi');

const jobSchema = Joi.object({
    applicantId: Joi.number().integer().positive(),
    userName: Joi.string().required(),
    qualification: Joi.string().required(),
    email: Joi.string().email().required(),
    cnic: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    status: Joi.string().valid('accepted', 'rejected', 'pending').required(),
    cv: Joi.string().required(),
    age: Joi.number().integer().positive().required(),
    isDelete: Joi.boolean().required(),
  });
  
  function validation(userObject){
    return jobSchema.validate(userObject)
  }
  module.exports={validation};  