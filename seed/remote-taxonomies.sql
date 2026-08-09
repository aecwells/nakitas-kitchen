-- Update taxonomy definitions collections
UPDATE _emdash_taxonomy_defs 
SET collections = '["posts","recipes","products"]' 
WHERE name IN ('category', 'tag');

-- Insert new taxonomy definitions for difficulty, dietary, and ingredient
INSERT OR IGNORE INTO _emdash_taxonomy_defs (id, name, label, label_singular, hierarchical, collections, locale, translation_group) VALUES
('taxdef_difficulty', 'difficulty', 'Baking Difficulty', 'Difficulty', 0, '["recipes"]', 'en', 'taxdef_difficulty'),
('taxdef_dietary', 'dietary', 'Dietary & Lifestyle', 'Dietary', 0, '["recipes","products"]', 'en', 'taxdef_dietary'),
('taxdef_ingredient', 'ingredient', 'Ingredients Taxonomy', 'Ingredient', 0, '["recipes","products"]', 'en', 'taxdef_ingredient');

-- Insert food & baking categories into taxonomies table
INSERT OR REPLACE INTO taxonomies (id, name, slug, label, locale, translation_group) VALUES
('cat_breads', 'category', 'breads', 'Breads & Sourdough', 'en', 'cat_breads'),
('cat_pastries', 'category', 'pastries', 'Pastries & Sweets', 'en', 'cat_pastries'),
('cat_cookies', 'category', 'cookies', 'Cookies & Biscuits', 'en', 'cat_cookies'),
('cat_pantry', 'category', 'pantry', 'Pantry & Spreads', 'en', 'cat_pantry');

-- Insert ingredient taxonomy terms into taxonomies table
INSERT OR REPLACE INTO taxonomies (id, name, slug, label, locale, translation_group) VALUES
('ing_breadflour', 'ingredient', 'bread-flour', 'Organic Bread Flour', 'en', 'ing_breadflour'),
('ing_wholerye', 'ingredient', 'whole-rye', 'Whole Grain Rye Flour', 'en', 'ing_wholerye'),
('ing_starter', 'ingredient', 'sourdough-starter', 'Active Sourdough Starter', 'en', 'ing_starter'),
('ing_cardamom', 'ingredient', 'cardamom', 'Green Cardamom Seeds', 'en', 'ing_cardamom'),
('ing_cinnamon', 'ingredient', 'cinnamon', 'Ceylon Cinnamon', 'en', 'ing_cinnamon'),
('ing_lemon', 'ingredient', 'meyer-lemon', 'Meyer Lemon Zest', 'en', 'ing_lemon'),
('ing_butter', 'ingredient', 'irish-butter', 'Cultured Irish Butter', 'en', 'ing_butter'),
('ing_chicken', 'ingredient', 'whole-chicken', 'Whole Free-Range Chicken', 'en', 'ing_chicken'),
('ing_tomatoes', 'ingredient', 'san-marzano', 'San Marzano Tomatoes', 'en', 'ing_tomatoes'),
('ing_mozzarella', 'ingredient', 'mozzarella', 'Fresh Buffalo Mozzarella', 'en', 'ing_mozzarella');

-- Insert difficulty terms into taxonomies table
INSERT OR REPLACE INTO taxonomies (id, name, slug, label, locale, translation_group) VALUES
('diff_easy', 'difficulty', 'easy', 'Beginner Friendly', 'en', 'diff_easy'),
('diff_medium', 'difficulty', 'medium', 'Intermediate', 'en', 'diff_medium'),
('diff_advanced', 'difficulty', 'advanced', 'Advanced / Artisanal', 'en', 'diff_advanced');

-- Insert dietary terms into taxonomies table
INSERT OR REPLACE INTO taxonomies (id, name, slug, label, locale, translation_group) VALUES
('diet_organic', 'dietary', 'organic', '100% Organic Flours', 'en', 'diet_organic'),
('diet_dairyfree', 'dietary', 'dairy-free', 'Dairy-Free', 'en', 'diet_dairyfree'),
('diet_vegan', 'dietary', 'vegan', 'Vegan / Plant-Based', 'en', 'diet_vegan'),
('diet_nutfree', 'dietary', 'nut-free', 'Nut-Free', 'en', 'diet_nutfree');

-- Insert tag terms into taxonomies table
INSERT OR REPLACE INTO taxonomies (id, name, slug, label, locale, translation_group) VALUES
('tag_sourdough', 'tag', 'sourdough', 'Wild Yeast Sourdough', 'en', 'tag_sourdough'),
('tag_coldferment', 'tag', 'cold-ferment', 'Cold Fermented (24h+)', 'en', 'tag_coldferment'),
('tag_cottage', 'tag', 'cottage-bakery', 'Cottage Bakery Feature', 'en', 'tag_cottage'),
('tag_preorder', 'tag', 'preorder', 'Weekly Pre-Order', 'en', 'tag_preorder');

-- Link sample recipes to ingredients in content_taxonomies
INSERT OR REPLACE INTO content_taxonomies (collection, entry_id, taxonomy_id, status) VALUES
('recipes', 'rec-1', 'ing_breadflour', 'published'),
('recipes', 'rec-1', 'ing_wholerye', 'published'),
('recipes', 'rec-1', 'ing_starter', 'published'),

('recipes', 'rec-2', 'ing_breadflour', 'published'),
('recipes', 'rec-2', 'ing_cardamom', 'published'),
('recipes', 'rec-2', 'ing_cinnamon', 'published'),
('recipes', 'rec-2', 'ing_butter', 'published'),

('recipes', 'rec-3', 'ing_breadflour', 'published'),
('recipes', 'rec-3', 'ing_lemon', 'published'),
('recipes', 'rec-3', 'ing_butter', 'published'),

('recipes', 'rec-4', 'ing_chicken', 'published'),
('recipes', 'rec-4', 'ing_butter', 'published'),

('recipes', 'rec-5', 'ing_starter', 'published'),
('recipes', 'rec-5', 'ing_tomatoes', 'published'),
('recipes', 'rec-5', 'ing_mozzarella', 'published'),

('products', 'prod-1', 'ing_breadflour', 'published'),
('products', 'prod-1', 'ing_wholerye', 'published'),
('products', 'prod-1', 'ing_starter', 'published'),

('products', 'prod-2', 'ing_breadflour', 'published'),
('products', 'prod-2', 'ing_cardamom', 'published'),
('products', 'prod-2', 'ing_butter', 'published'),

('products', 'prod-3', 'ing_breadflour', 'published'),
('products', 'prod-3', 'ing_lemon', 'published'),
('products', 'prod-3', 'ing_butter', 'published');
