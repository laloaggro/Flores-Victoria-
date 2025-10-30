#!/usr/bin/env node

/**
 * MongoDB Performance Indexes
 * Creates performance-optimizing indexes for all collections
 * Run with: node database/mongodb-indexes.js
 */

const { MongoClient } = require('mongodb');

// MongoDB connection URL from environment or default
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/flores-victoria';

// Index definitions for each collection
const INDEXES = {
  // Products Collection
  products: [
    // Category index for filtering
    { key: { category: 1 }, name: 'idx_category' },

    // Price index for sorting and range queries
    { key: { price: 1 }, name: 'idx_price' },

    // Featured products
    { key: { featured: 1 }, name: 'idx_featured' },

    // Stock management
    { key: { stock: 1 }, name: 'idx_stock' },

    // Text search on name and description
    { key: { name: 'text', description: 'text' }, name: 'idx_text_search' },

    // Compound index for common query pattern
    { key: { category: 1, price: 1, stock: 1 }, name: 'idx_category_price_stock' },

    // Occasion filtering
    { key: { occasion: 1 }, name: 'idx_occasion' },

    // Color filtering
    { key: { color: 1 }, name: 'idx_color' },

    // Created date for sorting by newest
    { key: { createdAt: -1 }, name: 'idx_created_desc' },

    // Unique SKU if exists
    { key: { sku: 1 }, name: 'idx_sku', unique: true, sparse: true },
  ],

  // Orders Collection
  orders: [
    // User orders lookup
    { key: { userId: 1, createdAt: -1 }, name: 'idx_user_orders' },

    // Status filtering
    { key: { status: 1 }, name: 'idx_status' },

    // Order tracking
    { key: { orderNumber: 1 }, name: 'idx_order_number', unique: true, sparse: true },

    // Total amount for analytics
    { key: { totalAmount: 1 }, name: 'idx_total_amount' },

    // Date range queries
    { key: { createdAt: -1 }, name: 'idx_created_desc' },

    // Payment status
    { key: { paymentStatus: 1 }, name: 'idx_payment_status' },

    // Compound for common admin queries
    { key: { status: 1, createdAt: -1 }, name: 'idx_status_date' },
  ],

  // Cart Collection
  carts: [
    // User cart lookup (most common query)
    { key: { userId: 1 }, name: 'idx_user_cart', unique: true },

    // Updated date for cleanup
    { key: { updatedAt: 1 }, name: 'idx_updated_asc' },

    // Session carts
    { key: { sessionId: 1 }, name: 'idx_session_cart', sparse: true },
  ],

  // Categories Collection
  categories: [
    // Name lookup
    { key: { name: 1 }, name: 'idx_name', unique: true },

    // Slug for URL routing
    { key: { slug: 1 }, name: 'idx_slug', unique: true },

    // Active categories
    { key: { active: 1 }, name: 'idx_active' },
  ],

  // Occasions Collection
  occasions: [
    // Name lookup
    { key: { name: 1 }, name: 'idx_name', unique: true },

    // Slug for URL routing
    { key: { slug: 1 }, name: 'idx_slug', unique: true },

    // Active occasions
    { key: { active: 1 }, name: 'idx_active' },

    // Date for seasonal occasions
    { key: { date: 1 }, name: 'idx_date', sparse: true },
  ],

  // Reviews Collection (if exists)
  reviews: [
    // Product reviews
    { key: { productId: 1, createdAt: -1 }, name: 'idx_product_reviews' },

    // User reviews
    { key: { userId: 1 }, name: 'idx_user_reviews' },

    // Rating for sorting
    { key: { rating: 1 }, name: 'idx_rating' },

    // Approved reviews
    { key: { approved: 1 }, name: 'idx_approved' },
  ],
};

async function createIndexes() {
  let client;

  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log(`   URL: ${MONGO_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

    client = await MongoClient.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    let totalIndexes = 0;
    let errors = 0;

    // Create indexes for each collection
    for (const [collectionName, indexes] of Object.entries(INDEXES)) {
      console.log(`\n📊 Collection: ${collectionName}`);
      console.log(`   Creating ${indexes.length} indexes...`);

      const collection = db.collection(collectionName);

      for (const indexDef of indexes) {
        try {
          const options = {
            name: indexDef.name,
            background: true, // Don't block other operations
          };

          if (indexDef.unique) options.unique = true;
          if (indexDef.sparse) options.sparse = true;

          await collection.createIndex(indexDef.key, options);
          console.log(`   ✅ Created index: ${indexDef.name}`);
          totalIndexes++;
        } catch (error) {
          if (error.code === 85 || error.code === 86) {
            // Index already exists or index options conflict
            console.log(`   ⏭️  Index exists: ${indexDef.name}`);
          } else {
            console.error(`   ❌ Error creating index ${indexDef.name}:`, error.message);
            errors++;
          }
        }
      }

      // List existing indexes
      const existingIndexes = await collection.indexes();
      console.log(`\n   📋 Total indexes on ${collectionName}: ${existingIndexes.length}`);
      existingIndexes.forEach((idx) => {
        console.log(`      - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Indexes created: ${totalIndexes}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📚 Collections processed: ${Object.keys(INDEXES).length}`);
    console.log(`${'='.repeat(60)}\n`);

    // Performance tips
    console.log('💡 PERFORMANCE TIPS:');
    console.log('   1. Monitor index usage with db.collection.stats()');
    console.log('   2. Use explain() to verify queries use indexes');
    console.log('   3. Remove unused indexes to save space');
    console.log('   4. Rebuild indexes periodically: db.collection.reIndex()');
    console.log('   5. Check index size: db.collection.totalIndexSize()');
    console.log('');
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('👋 Disconnected from MongoDB\n');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  createIndexes()
    .then(() => {
      console.log('✨ Index creation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Index creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createIndexes, INDEXES };
