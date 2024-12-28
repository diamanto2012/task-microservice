import Joi from 'joi';

export const userValidation = {
    createUser: {
        body: Joi.object({
            username: Joi.string()
                .required()
                .min(3)
                .max(30)
                .trim(),
            email: Joi.string()
                .required()
                .email()
                .trim()
                .lowercase()
        })
    },

    updateUser: {
        params: Joi.object({
            id: Joi.number()
                .required()
                .integer()
                .positive()
        }),
        body: Joi.object({
            username: Joi.string()
                .min(3)
                .max(30)
                .trim(),
            email: Joi.string()
                .email()
                .trim()
                .lowercase()
        }).min(1)
    },

    getUserById: {
        params: Joi.object({
            id: Joi.number()
                .required()
                .integer()
                .positive()
        })
    }
};
