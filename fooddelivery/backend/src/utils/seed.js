/**
 * Seeds demo data so the app looks populated on first run.
 * Safe to re-run: it checks for existing seeded emails before inserting.
 *
 * Usage: npm run seed
 *
 * Demo accounts (password for all: Password123):
 *   owner1@zaiqa.demo   - restaurant owner (Karahi Corner, Slice House)
 *   owner2@zaiqa.demo   - restaurant owner (Wok This Way)
 *   customer1@zaiqa.demo - regular user
 *   customer2@zaiqa.demo - regular user
 */
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const PASSWORD = 'Password123';

async function upsertUser(fullName, email, role) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const hash = await bcrypt.hash(PASSWORD, 12);
  const { rows } = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id',
    [fullName, email, hash, role]
  );
  return rows[0].id;
}

async function upsertRestaurant(ownerId, name, description, foodType, image) {
  const existing = await pool.query('SELECT id FROM restaurants WHERE owner_id = $1 AND name = $2', [ownerId, name]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const { rows } = await pool.query(
    `INSERT INTO restaurants (owner_id, name, description, food_type, image)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [ownerId, name, description, foodType, image]
  );
  return rows[0].id;
}

async function upsertMeal(restaurantId, name, description, price, image) {
  const existing = await pool.query('SELECT id FROM meals WHERE restaurant_id = $1 AND name = $2', [restaurantId, name]);
  if (existing.rows.length > 0) return;
  await pool.query(
    `INSERT INTO meals (restaurant_id, name, description, price, image) VALUES ($1,$2,$3,$4,$5)`,
    [restaurantId, name, description, price, image]
  );
}

async function run() {
  console.log('Seeding demo data...');

  const owner1 = await upsertUser('Ahmed Raza', 'owner1@zaiqa.demo', 'restaurant_owner');
  const owner2 = await upsertUser('Sana Malik', 'owner2@zaiqa.demo', 'restaurant_owner');
  await upsertUser('Bilal Hussain', 'customer1@zaiqa.demo', 'regular_user');
  await upsertUser('Ayesha Khan', 'customer2@zaiqa.demo', 'regular_user');

  const karahiCorner = await upsertRestaurant(
    owner1, 'Karahi Corner',
    'Authentic Pakistani karahi and BBQ, made fresh on charcoal grills.',
    'Pakistani',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=70'
  );
  await upsertMeal(karahiCorner, 'Chicken Karahi (Full)', 'Classic tomato-based chicken karahi with ginger and green chili.', 1450, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=60');
  await upsertMeal(karahiCorner, 'Seekh Kebab (6 pcs)', 'Charcoal-grilled beef seekh kebabs, served with mint chutney.', 650, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=60');
  await upsertMeal(karahiCorner, 'Chicken Biryani', 'Fragrant basmati rice layered with spiced chicken.', 380, 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=500&q=60');
  await upsertMeal(karahiCorner, 'Naan (Plain)', 'Fresh tandoor-baked naan.', 40, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=500&q=60');

  const sliceHouse = await upsertRestaurant(
    owner1, 'Slice House',
    'Wood-fired pizzas with a crispy thin crust and generous toppings.',
    'Pizza',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=70'
  );
  await upsertMeal(sliceHouse, 'Margherita Pizza (Large)', 'San Marzano tomato, fresh mozzarella, basil.', 1200, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60');
  await upsertMeal(sliceHouse, 'Chicken Tikka Pizza (Large)', 'Spiced chicken tikka, onions, bell peppers, mozzarella.', 1450, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60');
  await upsertMeal(sliceHouse, 'Garlic Breadsticks', 'Baked fresh with garlic butter and parmesan.', 350, 'https://images.unsplash.com/photo-1619531038896-89d9b06e8073?auto=format&fit=crop&w=500&q=60');

  const wokThisWay = await upsertRestaurant(
    owner2, 'Wok This Way',
    'Fast, flavorful Chinese and Thai-inspired stir-fry favorites.',
    'Chinese',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=70'
  );
  await upsertMeal(wokThisWay, 'Chicken Manchurian', 'Crispy chicken tossed in a tangy soy-garlic sauce.', 550, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=60');
  await upsertMeal(wokThisWay, 'Vegetable Fried Rice', 'Wok-tossed rice with fresh seasonal vegetables.', 380, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=60');
  await upsertMeal(wokThisWay, 'Chicken Chowmein', 'Stir-fried noodles with chicken and crunchy vegetables.', 420, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=60');

  console.log('Seed complete.');
  console.log('Demo login — any account below, password: Password123');
  console.log('  owner1@zaiqa.demo (owns Karahi Corner, Slice House)');
  console.log('  owner2@zaiqa.demo (owns Wok This Way)');
  console.log('  customer1@zaiqa.demo / customer2@zaiqa.demo');

  await pool.end();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
