import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

const groupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{
    content: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  slug: {
    type: String,
    unique: true
  }
});


groupSchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    let slug = slugify(this.name, { lower: true });
    const groupWithSlug = await this.constructor.findOne({ slug });
    if (groupWithSlug) {
      let count = 1;
      let newSlug = `${slug}-${count}`;
      while (await this.constructor.findOne({ slug: newSlug })) {
        count++;
        newSlug = `${slug}-${count}`;
      }
      slug = newSlug;
    }
    this.slug = slug;
  }
  next();
}); 

const Group = mongoose.model('Group', groupSchema);

export default Group;
