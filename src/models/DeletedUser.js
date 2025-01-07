import mongoose from 'mongoose';

const DeletedUserSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  reasons: {
    type: String,
  },
  requestCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('DeleteUser', DeletedUserSchema);
