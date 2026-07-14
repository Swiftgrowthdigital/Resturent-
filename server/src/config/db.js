const mongoose = require('mongoose');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { getRestaurantName } = require('./restaurant');
const Seat = require('../models/Seat');
const Counter = require('../models/Counter');

const menuCategories = [
  { name: 'Pizza', sortOrder: 1 },
  { name: 'Burger', sortOrder: 2 },
  { name: 'Pasta', sortOrder: 3 },
  { name: 'French Fries', sortOrder: 4 },
  { name: 'Maggi', sortOrder: 5 },
  { name: 'Softy', sortOrder: 6 }
];

const menuImages = { pizza: '', burger: '', pasta: '', fries: '', maggi: '', softy: '' };

const selectedMenu = [
  {
    name: 'Margherita Pizza',
    categoryName: 'Pizza',
    price: 139,
    description: 'Classic tomato sauce and melted mozzarella on a crisp base.',
    image: menuImages.pizza,
    bestseller: true
  },
  {
    name: 'Sweet Corn Pizza',
    categoryName: 'Pizza',
    price: 149,
    description: 'Cheesy pizza topped with sweet corn and herbs.',
    image: menuImages.pizza
  },
  {
    name: 'Veggie Pizza',
    categoryName: 'Pizza',
    price: 159,
    description: 'Fresh capsicum, onion, tomato, and cheese on a baked crust.',
    image: menuImages.pizza
  },
  {
    name: 'Farm House Pizza',
    categoryName: 'Pizza',
    price: 169,
    description: 'A hearty vegetable-loaded pizza with a generous cheese layer.',
    image: menuImages.pizza
  },
  {
    name: 'Tandoori Paneer Pizza',
    categoryName: 'Pizza',
    price: 249,
    description: 'Smoky tandoori paneer, peppers, and mozzarella with bold spices.',
    image: menuImages.pizza
  },
  {
    name: 'Aloo Burger',
    categoryName: 'Burger',
    price: 59,
    description: 'Crispy potato patty with fresh vegetables and tangy sauce.',
    image: menuImages.burger
  },
  {
    name: 'Cheese Burger',
    categoryName: 'Burger',
    price: 69,
    description: 'A classic vegetable patty burger layered with creamy cheese.',
    image: menuImages.burger,
    bestseller: true
  },
  {
    name: 'Double Cheese Burger',
    categoryName: 'Burger',
    price: 79,
    description: 'Double cheese and a crisp vegetable patty in a soft toasted bun.',
    image: menuImages.burger
  },
  {
    name: 'Paneer Tikka Burger',
    categoryName: 'Burger',
    price: 89,
    description: 'Tandoori paneer tikka with crunchy vegetables and house mayo.',
    image: menuImages.burger
  },
  {
    name: 'Red Sauce Pasta',
    categoryName: 'Pasta',
    price: 99,
    description: 'Pasta tossed in a rich tomato and herb sauce.',
    image: menuImages.pasta
  },
  {
    name: 'White Sauce Pasta',
    categoryName: 'Pasta',
    price: 109,
    description: 'Creamy white sauce pasta with herbs and vegetables.',
    image: menuImages.pasta
  },
  {
    name: 'French Fries',
    categoryName: 'French Fries',
    price: 79,
    description: 'Golden, crispy potato fries lightly seasoned with salt.',
    image: menuImages.fries,
    bestseller: true
  },
  {
    name: 'Peri Peri Fries',
    categoryName: 'French Fries',
    price: 89,
    description: 'Crispy fries dusted with a zesty peri peri spice blend.',
    image: menuImages.fries
  },
  {
    name: 'Plain Maggi',
    categoryName: 'Maggi',
    price: 49,
    description: 'Comforting instant noodles with classic masala seasoning.',
    image: menuImages.maggi
  },
  {
    name: 'Masala Maggi',
    categoryName: 'Maggi',
    price: 59,
    description: 'Hot Maggi noodles with fragrant Indian spices and vegetables.',
    image: menuImages.maggi,
    bestseller: true
  },
  {
    name: 'Cheese Veggie Maggi',
    categoryName: 'Maggi',
    price: 79,
    description: 'Vegetable Maggi finished with a smooth, cheesy topping.',
    image: menuImages.maggi
  },
  {
    name: 'Vanilla Softy',
    categoryName: 'Softy',
    price: 29,
    description: 'A cool, creamy vanilla soft-serve swirl.',
    image: menuImages.softy
  },
  {
    name: 'Vanilla Chocolate Softy',
    categoryName: 'Softy',
    price: 39,
    description: 'A creamy vanilla softy finished with chocolate flavour.',
    image: menuImages.softy
  }
];

const legacyDemoFoodNames = [
  'Farmhouse Pizza',
  'Paneer Tikka Pizza',
  'Chicken Keema Pizza',
  'Spicy Peri Peri Pizza',
  'Chicken Burger',
  'Veg Burger',
  'Paneer Cheese Burger',
  'Chicken Cheeseburger',
  'BBQ Crunch Burger',
  'Hakka Noodles',
  'Chicken Fried Rice',
  'Veg Fried Rice',
  'Chilli Paneer',
  'Chicken Manchurian',
  'Spring Rolls',
  'Masala Dosa',
  'Plain Dosa',
  'Idli Sambar',
  'Medu Vada',
  'Rava Uttapam',
  'Chicken Biryani',
  'Veg Biryani',
  'Paneer Biryani',
  'Mutton Biryani',
  'Egg Biryani',
  'Cold Coffee',
  'Mango Shake',
  'Fresh Lime Soda',
  'Masala Chaas',
  'Chocolate Brownie',
  'Vanilla Ice Cream',
  'Sizzling Brownie',
  'Gulab Jamun',
  'Cheesecake Slice'
];

async function seedDefaults() {
  const legacySettings = await mongoose.connection.collection('restaurantsettings').findOne();
  const initialSeats = Array.isArray(legacySettings?.availableSeats) && legacySettings.availableSeats.length
    ? legacySettings.availableSeats
    : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  await Restaurant.findOneAndUpdate(
    {},
    {
      $setOnInsert: {
        name: getRestaurantName(),
        currency: process.env.RESTAURANT_CURRENCY || 'INR',
        status: 'open'
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if ((await Seat.countDocuments()) === 0) {
    await Seat.bulkWrite(initialSeats.map((seatNumber) => ({
      updateOne: {
        filter: { seatNumber: String(seatNumber).trim().toUpperCase() },
        update: { $setOnInsert: { active: true } },
        upsert: true
      }
    })));
  }
  await Counter.findOneAndUpdate(
    { key: 'orderNumber' },
    { $setOnInsert: { value: 1000 + (await Order.countDocuments()) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Food.deleteMany({ name: { $in: legacyDemoFoodNames } });
  await Order.deleteMany({ clientOrderId: /^demo-order-/ });

  const categoryMap = new Map((await Category.find({})).map((category) => [category.name, category]));
  for (const category of menuCategories) {
    const savedCategory = await Category.findOneAndUpdate(
      { name: category.name },
      category,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryMap.set(category.name, savedCategory);
  }

  await Food.bulkWrite(
    selectedMenu.map((food) => ({
      updateOne: {
        filter: { name: food.name },
        update: {
          $set: {
            description: food.description,
            category: categoryMap.get(food.categoryName)._id,
            price: food.price,
            // Production images are uploaded through the server to Supabase Storage.
            // Do not seed external image hosts into restaurant data.
            image: '',
            veg: true,
            bestseller: Boolean(food.bestseller),
            todaysSpecial: false,
            combo: false,
            outOfStock: false
          },
          $setOnInsert: { name: food.name }
        },
        upsert: true
      }
    }))
  );

  const obsoleteCategories = ['Chinese', 'South Indian', 'Biryani', 'Drinks', 'Desserts', 'Dessert'];
  const unusedCategories = await Category.find({ name: { $in: obsoleteCategories } });
  for (const category of unusedCategories) {
    if ((await Food.countDocuments({ category: category._id })) === 0) {
      await category.deleteOne();
    }
  }
}

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Copy server/.env.example to server/.env and provide a reachable MongoDB URI.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await mongoose.connection.db.admin().ping();
  await seedDefaults();
  console.log('MongoDB Atlas connected and verified');
}

module.exports = { connectDatabase };
