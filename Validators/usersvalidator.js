const Joi = require('joi');

const userSchema = Joi.object( {
    userId: Joi.number().integer().positive(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email({minDomainSegments: 2,tlds: { allow: true },}).required(),
    password: Joi.string().pattern(new RegExp('^(?=.*?[a-z]).{8,}$')),
    rememberToken: Joi.string(),
    isAdmin: Joi.boolean().default(false),
    isVerified: Joi.boolean().default(false),
  });
  
function validation(userObject){
  return userSchema.validate(userObject)
}
module.exports={validation};