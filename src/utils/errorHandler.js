// eslint-disable-next-line no-unused-vars
export default (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};
