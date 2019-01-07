const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uploadSchema = new Schema(
  {
    privacy: {
      type: Boolean,
      required: true
    },
    uploadName: {
      type: String,
      required: true
    },
    uploadUrl: {
      type: String,
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Upload', uploadSchema);
