const allowedCategories = ['Web Development', 'Design', 'Writing', 'Marketing', 'Video & Animation'];

const validateGigInput = (req, res, next) => {
  const { title, category, price, description } = req.body;

  if (!title || !category || price === undefined || price === null || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (
    typeof title !== 'string' ||
    typeof category !== 'string' ||
    typeof description !== 'string'
  ) {
    return res.status(400).json({ error: 'Title, category, and description must be text values' });
  }

  const trimmedTitle = title.trim();
  const trimmedCategory = category.trim();
  const trimmedDescription = description.trim();

  if (trimmedTitle.length < 5 || trimmedTitle.length > 80) {
    return res.status(400).json({ error: 'Title must be between 5 and 80 characters' });
  }

  if (!allowedCategories.includes(trimmedCategory)) {
    return res.status(400).json({ 
      error: `Category must be one of: ${allowedCategories.join(', ')}` 
    });
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ error: 'Price must be a valid number greater than 0' });
  }

  if (trimmedDescription.length < 10 || trimmedDescription.length > 500) {
    return res.status(400).json({ error: 'Description must be between 10 and 500 characters' });
  }

  req.body = {
    title: trimmedTitle,
    category: trimmedCategory,
    price: numericPrice,
    description: trimmedDescription
  };

  next();
};

module.exports = validateGigInput;