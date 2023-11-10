const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  res
    .status(res.statusCode === 200 ? 500 : res.statusCode)
    .json({
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
};

export { notFound, errorHandler };