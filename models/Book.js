import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

const bookSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  image: {
    type: String,
    required: true // Mark the image field as required
  },
  genres: [{
    type: String,
    required: true
  }],
  ratings: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookSchema.pre('save', async function(next) {
  const slug = slugify(this.title, { lower: true });
  try {
    const existingBook = await this.constructor.findOne({ slug });
    if (existingBook && !existingBook._id.equals(this._id)) {
      let count = 1;
      let newSlug = `${slug}-${count}`;
      while (await this.constructor.findOne({ slug: newSlug })) {
        count++;
        newSlug = `${slug}-${count}`;
      }
      this.slug = newSlug;
    } else {
      this.slug = slug;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
