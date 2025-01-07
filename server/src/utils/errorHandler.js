module.exports = (res, error, message = 'An error occurred', statusCode = 500) => {
    console.error(error);
    res.status(statusCode).json({
      status: 'error',
      message,
      details: error.message || '',
    });
  }