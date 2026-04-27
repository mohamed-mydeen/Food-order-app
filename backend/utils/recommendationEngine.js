/**
 * Feast At Night — AI Recommendation Engine
 * Pure Node.js: Cosine Similarity + K-Means Clustering + Hybrid Scoring
 */

const { Op, fn, col, literal } = require("sequelize");

const SIGNAL_WEIGHTS = {
  order:    5.0,
  review:   0.8,
  wishlist: 2.0,
  cart_add: 1.5,
  click:    0.3,
  view:     0.1,
};

const K_CLUSTERS = 4;
const CLUSTER_LABELS = [
  "Night Feast Explorer 🌙",
  "Comfort Food Lover 🍲",
  "Spice & Flavour Seeker 🌶️",
  "Snack & Variety Fan 🍿",
];

// ─── Math helpers ─────────────────────────────────────────────────────────────

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (const k of Object.keys(a)) {
    magA += a[k] * a[k];
    if (b[k]) dot += a[k] * b[k];
  }
  for (const k of Object.keys(b)) magB += b[k] * b[k];
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function euclideanDistance(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let sum = 0;
  for (const k of keys) { const d = (a[k] || 0) - (b[k] || 0); sum += d * d; }
  return Math.sqrt(sum);
}

// ─── K-Means ──────────────────────────────────────────────────────────────────

function kMeans(vectors, k = K_CLUSTERS, maxIter = 20) {
  const userIds = Object.keys(vectors);
  if (userIds.length <= k) {
    const assignments = {};
    userIds.forEach((id, i) => { assignments[id] = i % k; });
    return { assignments, centroids: [] };
  }

  const shuffled = [...userIds].sort(() => Math.random() - 0.5);
  let centroids = shuffled.slice(0, k).map(id => ({ ...vectors[id] }));
  let assignments = {};

  for (let iter = 0; iter < maxIter; iter++) {
    const newAssign = {};
    for (const uid of userIds) {
      let best = 0, bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = euclideanDistance(vectors[uid], centroids[c]);
        if (d < bestDist) { bestDist = d; best = c; }
      }
      newAssign[uid] = best;
    }
    const changed = userIds.some(id => newAssign[id] !== assignments[id]);
    assignments = newAssign;
    if (!changed) break;

    centroids = Array.from({ length: k }, () => ({}));
    const counts = Array(k).fill(0);
    for (const uid of userIds) {
      const c = assignments[uid]; counts[c]++;
      for (const [pid, score] of Object.entries(vectors[uid])) {
        centroids[c][pid] = (centroids[c][pid] || 0) + score;
      }
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) for (const pid of Object.keys(centroids[c])) centroids[c][pid] /= counts[c];
    }
  }
  return { assignments, centroids };
}

// ─── Build interaction matrix ─────────────────────────────────────────────────

async function buildInteractionMatrix() {
  const { UserEvent, OrderItem, Order, Review, Wishlist } = require("../models");
  const vectors = {};

  function addScore(userId, productId, score) {
    if (!userId || !productId) return;
    const uid = String(userId), pid = String(productId);
    if (!vectors[uid]) vectors[uid] = {};
    vectors[uid][pid] = (vectors[uid][pid] || 0) + score;
  }

  const [events, orderItems, reviews, wishlists] = await Promise.all([
    UserEvent.findAll({ attributes: ["user_id", "product_id", "event_type", "value"], raw: true }),
    OrderItem.findAll({
      include: [{ model: Order, as: "order", attributes: ["user_id"] }],
      attributes: ["product_id", "quantity"], raw: true,
    }),
    Review.findAll({ attributes: ["user_id", "product_id", "rating"], raw: true }),
    Wishlist.findAll({ attributes: ["user_id", "product_id"], raw: true }),
  ]);

  for (const e of events) {
    const w = SIGNAL_WEIGHTS[e.event_type] || 0;
    addScore(e.user_id, e.product_id, e.event_type === "review" ? (e.value || 1) * w : w * (e.value || 1));
  }
  for (const item of orderItems) {
    addScore(item["order.user_id"], item.product_id, SIGNAL_WEIGHTS.order * (item.quantity || 1));
  }
  for (const r of reviews) {
    addScore(r.user_id, r.product_id, r.rating * SIGNAL_WEIGHTS.review);
  }
  for (const w of wishlists) {
    addScore(w.user_id, w.product_id, SIGNAL_WEIGHTS.wishlist);
  }

  return { vectors, clusterResult: kMeans(vectors, K_CLUSTERS) };
}

// ─── Collaborative Filtering ──────────────────────────────────────────────────

function findSimilarUsers(targetUserId, vectors, n = 15) {
  const targetVec = vectors[String(targetUserId)];
  if (!targetVec) return [];
  return Object.entries(vectors)
    .filter(([uid]) => uid !== String(targetUserId))
    .map(([uid, vec]) => ({ uid, similarity: cosineSimilarity(targetVec, vec) }))
    .filter(s => s.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, n)
    .map(s => s.uid);
}

function collaborativeRecs(vectors, similarUsers, alreadyTried) {
  const tried = new Set(alreadyTried.map(String));
  const scores = {};
  for (const uid of similarUsers) {
    for (const [pid, score] of Object.entries(vectors[uid] || {})) {
      if (!tried.has(pid)) scores[pid] = (scores[pid] || 0) + score;
    }
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([pid]) => parseInt(pid));
}

// ─── Content-Based Filtering ──────────────────────────────────────────────────

async function contentBasedRecs(userVec, alreadyTried) {
  const { Product } = require("../models");
  if (!userVec || !Object.keys(userVec).length) return [];

  const topPids = Object.entries(userVec).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([pid]) => parseInt(pid));
  if (!topPids.length) return [];

  const topProducts = await Product.findAll({
    where: { id: { [Op.in]: topPids } },
    attributes: ["id", "category", "price"], raw: true,
  });

  const catScores = {};
  for (const p of topProducts) {
    catScores[p.category] = (catScores[p.category] || 0) + (userVec[String(p.id)] || 0);
  }
  const topCats = Object.entries(catScores).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c);
  if (!topCats.length) return [];

  const tried = alreadyTried.map(Number);
  const recs = await Product.findAll({
    where: {
      category: { [Op.in]: topCats },
      id: { [Op.notIn]: tried.length > 0 ? tried : [0] },
      in_stock: true,
    },
    attributes: ["id", "name", "price", "image", "category", "description", "in_stock"],
    limit: 5, order: [["id", "DESC"]],
  });

  return recs.map(p => p.toJSON());
}

// ─── Trending ─────────────────────────────────────────────────────────────────

async function getTrending(excludeIds = [], limit = 8) {
  const { OrderItem, Order, Product } = require("../models");
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const rows = await OrderItem.findAll({
    include: [
      { model: Order, as: "order", attributes: [], where: { created_at: { [Op.gte]: thirtyDaysAgo } } },
      { model: Product, as: "product", attributes: ["id", "name", "price", "image", "category", "description", "in_stock"], where: { in_stock: true } },
    ],
    attributes: ["product_id", [fn("SUM", col("OrderItem.quantity")), "total_qty"]],
    where: excludeIds.length > 0 ? { product_id: { [Op.notIn]: excludeIds } } : {},
    group: ["product_id", "product.id"],
    order: [[literal("total_qty"), "DESC"]],
    limit, raw: false,
  });

  return rows.map(r => r.product ? { ...r.product.toJSON(), tag: "🔥 Trending" } : null).filter(Boolean);
}

// ─── Main Hybrid Engine ───────────────────────────────────────────────────────

async function getHybridRecommendations(userId) {
  const { Product } = require("../models");

  try {
    const { vectors, clusterResult } = await buildInteractionMatrix();
    const userVec = vectors[String(userId)] || {};
    const hasHistory = Object.keys(userVec).length > 0;

    // Cold start
    if (!hasHistory) {
      const trending = await getTrending([], 8);
      return { success: true, type: "trending", cluster_label: null, message: "🔥 Trending at Feast At Night right now", data: trending };
    }

    const alreadyInteracted = Object.entries(userVec)
      .filter(([, s]) => s >= SIGNAL_WEIGHTS.order)
      .map(([pid]) => parseInt(pid));

    const resultMap = new Map();

    function addResult(product, tag, priority) {
      if (!product?.id || resultMap.has(product.id)) return;
      resultMap.set(product.id, { ...product, tag, _priority: priority });
    }

    // 1. Personal favourites
    const topPids = Object.entries(userVec).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([pid]) => parseInt(pid));
    if (topPids.length) {
      const favs = await Product.findAll({ where: { id: { [Op.in]: topPids }, in_stock: true }, attributes: ["id", "name", "price", "image", "category", "description", "in_stock"] });
      favs.forEach((p, i) => addResult(p.toJSON(), i === 0 ? "⭐ Your Favourite" : "⭐ You Love This", 1));
    }

    // 2. Collaborative filtering
    const similarUsers = findSimilarUsers(userId, vectors, 15);
    if (similarUsers.length) {
      const collabIds = collaborativeRecs(vectors, similarUsers, alreadyInteracted);
      if (collabIds.length) {
        const collabProds = await Product.findAll({ where: { id: { [Op.in]: collabIds.slice(0, 5) }, in_stock: true }, attributes: ["id", "name", "price", "image", "category", "description", "in_stock"] });
        collabProds.forEach(p => addResult(p.toJSON(), "🧠 AI Pick", 2));
      }
    }

    // 3. Content-based
    const contentRecs = await contentBasedRecs(userVec, alreadyInteracted);
    contentRecs.forEach(p => addResult(p, "📦 Try Something New", 3));

    // 4. Cluster neighbours
    const userCluster = clusterResult.assignments[String(userId)];
    if (userCluster !== undefined) {
      const clusterMates = Object.entries(clusterResult.assignments)
        .filter(([uid, c]) => c === userCluster && uid !== String(userId))
        .map(([uid]) => uid).slice(0, 10);
      if (clusterMates.length) {
        const clusterIds = collaborativeRecs(vectors, clusterMates, alreadyInteracted);
        if (clusterIds.length) {
          const clusterProds = await Product.findAll({ where: { id: { [Op.in]: clusterIds.slice(0, 3) }, in_stock: true }, attributes: ["id", "name", "price", "image", "category", "description", "in_stock"] });
          clusterProds.forEach(p => addResult(p.toJSON(), "👥 Neighbours Like", 4));
        }
      }
    }

    // 5. Fill with trending
    if (resultMap.size < 8) {
      const trending = await getTrending([...alreadyInteracted, ...resultMap.keys()], 8 - resultMap.size);
      trending.forEach(p => addResult(p, "🔥 Trending", 5));
    }

    const clusterLabel = userCluster !== undefined ? CLUSTER_LABELS[userCluster % CLUSTER_LABELS.length] : null;
    const finalResults = Array.from(resultMap.values()).sort((a, b) => a._priority - b._priority).slice(0, 8).map(({ _priority, ...p }) => p);

    return {
      success: true, type: "ai",
      cluster_label: clusterLabel,
      message: clusterLabel ? `Curated for a ${clusterLabel} like you ✨` : "Personalised just for your taste ✨",
      data: finalResults,
    };
  } catch (err) {
    console.error("recommendationEngine:", err);
    try {
      const trending = await getTrending([], 6);
      return { success: true, type: "trending", cluster_label: null, message: "🔥 Trending at Feast At Night", data: trending };
    } catch {
      return { success: false, type: "error", data: [], message: "Recommendations unavailable." };
    }
  }
}

// ─── Admin Insights ───────────────────────────────────────────────────────────

async function getClusterInsights() {
  try {
    const { vectors, clusterResult } = await buildInteractionMatrix();
    const { assignments } = clusterResult;

    const stats = Array.from({ length: K_CLUSTERS }, (_, i) => ({
      cluster: i, label: CLUSTER_LABELS[i], user_count: 0, top_product_ids: [],
    }));

    for (const [, c] of Object.entries(assignments)) stats[c].user_count++;

    for (let c = 0; c < K_CLUSTERS; c++) {
      const clusterUsers = Object.entries(assignments).filter(([, ci]) => ci === c).map(([uid]) => uid);
      const prodTotals = {};
      for (const uid of clusterUsers) {
        for (const [pid, score] of Object.entries(vectors[uid] || {})) {
          prodTotals[pid] = (prodTotals[pid] || 0) + score;
        }
      }
      stats[c].top_product_ids = Object.entries(prodTotals).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([pid]) => parseInt(pid));
    }

    return { total_users_with_data: Object.keys(vectors).length, clusters: stats, k: K_CLUSTERS };
  } catch (err) {
    console.error("getClusterInsights:", err);
    return null;
  }
}

module.exports = { getHybridRecommendations, getClusterInsights, CLUSTER_LABELS, K_CLUSTERS };
