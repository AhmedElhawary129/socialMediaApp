import { AppError, asyncHandler } from "../utils/error/index.js";

export const validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    let validationResult = [];
    for (const key of Object.keys(schema)) {
      const validationError = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationError.error) {
        validationResult.push(validationError.error.details);
      }
    }
    if (validationResult.length > 0) {
      return next(new AppError(validationResult, 400))
    }
    next();
  });
};