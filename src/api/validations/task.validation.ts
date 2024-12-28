import Joi from 'joi';

export const taskValidation = {
    createTask: {
        body: Joi.object({
            title: Joi.string()
                .required()
                .min(1)
                .max(100)
                .trim(),
            description: Joi.string()
                .required()
                .min(1)
                .max(500)
                .trim(),
            status: Joi.string()
                .valid('pending', 'in-progress', 'done')
                .default('pending'),
            userId: Joi.number()
                .integer()
                .positive()
        })
    },

    updateTask: {
        params: Joi.object({
            id: Joi.number()
                .required()
                .integer()
                .positive()
        }),
        body: Joi.object({
            title: Joi.string()
                .min(1)
                .max(100)
                .trim(),
            description: Joi.string()
                .min(1)
                .max(500)
                .trim(),
            status: Joi.string()
                .valid('pending', 'in-progress', 'done'),
            userId: Joi.number()
                .integer()
                .positive()
        }).min(1)
    },

    getTaskById: {
        params: Joi.object({
            id: Joi.number()
                .required()
                .integer()
                .positive()
        })
    },

    deleteTask: {
        params: Joi.object({
            id: Joi.number()
                .required()
                .integer()
                .positive()
        })
    },

    deleteTasks: {
        body: Joi.object({
            ids: Joi.array()
                .items(
                    Joi.number()
                        .integer()
                        .positive()
                        .required()
                )
                .min(1)
                .required()
        })
    }
};
