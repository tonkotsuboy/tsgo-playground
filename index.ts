// filename: e_commerce_backend_simulation_no_decorators.ts

// --- Constants and Enums ---

/**
 * 商品のカテゴリを定義する列挙型。
 */
enum ProductCategory {
  Electronics = "Electronics",
  Books = "Books",
  HomeAppliances = "Home Appliances",
  Clothing = "Clothing",
  Food = "Food",
  Sports = "Sports"
}

/**
* 注文のステータスを定義する列挙型。
*/
enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled"
}

/**
* ユーザーの役割を定義する列挙型。
*/
enum UserRole {
  Customer = "Customer",
  Admin = "Admin",
  Seller = "Seller"
}

/**
* 支払い方法を定義する列挙型。
*/
enum PaymentMethod {
  CreditCard = "Credit Card",
  PayPal = "PayPal",
  BankTransfer = "Bank Transfer",
  CashOnDelivery = "Cash on Delivery"
}

// --- Interfaces ---

/**
* 基本的なエンティティのインターフェース（IDと作成/更新日時を持つ）。
*/
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
* 商品の属性を定義するインターフェース。
*/
interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  imageUrl: string;
  sellerId: string;
  rating?: number; // オプション
  reviewsCount?: number; // オプション
}

/**
* ユーザーの情報を定義するインターフェース。
*/
interface User extends BaseEntity {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  address?: Address; // オプション
  phone?: string; // オプション
}

/**
* 住所を定義するインターフェース。
*/
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
* 注文アイテムを定義するインターフェース。
*/
interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: number;
}

/**
* 注文を定義するインターフェース。
*/
interface Order extends BaseEntity {
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Unpaid';
  shippedDate?: Date;
  deliveredDate?: Date;
}

/**
* レビューを定義するインターフェース。
*/
interface Review extends BaseEntity {
  productId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
}

/**
* 支払いトランザクションを定義するインターフェース。
*/
interface PaymentTransaction extends BaseEntity {
  orderId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  status: 'Success' | 'Failed' | 'Refunded';
}

// --- Type Aliases and Utility Types ---

/**
* ユーザーの認証情報のための型エイリアス。
*/
type UserCredentials = Pick<User, 'username' | 'passwordHash'>;

/**
* 新規作成時のエンティティ（IDや日時がない）。
*/
type New<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
* APIレスポンスの共通構造。
*/
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// --- Classes (Data Models and Services) ---

/**
* シンプルなデータストアのモック。
*/
class InMemoryDatabase<T extends BaseEntity> {
  private collection: Map<string, T>;

  constructor() {
      this.collection = new Map<string, T>();
  }

  add(item: New<T>): T {
      const id = `entity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date();
      const newItem: T = { ...item, id, createdAt: now, updatedAt: now } as T;
      this.collection.set(id, newItem);
      console.log(`[LOG] Added item to collection: ${id}`); // デコレーターの代わりにログを追加
      return newItem;
  }

  get(id: string): T | undefined {
      const result = this.collection.get(id);
      console.log(`[LOG] Get item by ID '${id}': ${result ? 'found' : 'not found'}`); // デコレーターの代わりにログを追加
      return result;
  }

  getAll(): T[] {
      const result = Array.from(this.collection.values());
      console.log(`[LOG] Get all items. Count: ${result.length}`); // デコレーターの代わりにログを追加
      return result;
  }

  update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): T | undefined {
      const existing = this.collection.get(id);
      if (!existing) {
          console.log(`[LOG] Update item ID '${id}': not found`); // デコレーターの代わりにログを追加
          return undefined;
      }
      const updatedItem = { ...existing, ...updates, updatedAt: new Date() };
      this.collection.set(id, updatedItem);
      console.log(`[LOG] Update item ID '${id}': success`); // デコレーターの代わりにログを追加
      return updatedItem;
  }

  delete(id: string): boolean {
      const result = this.collection.delete(id);
      console.log(`[LOG] Delete item ID '${id}': ${result ? 'success' : 'failed'}`); // デコレーターの代わりにログを追加
      return result;
  }

  findBy<K extends keyof T>(key: K, value: T[K]): T[] {
      const result = Array.from(this.collection.values()).filter(item => item[key] === value);
      console.log(`[LOG] Find items by key '${String(key)}' with value '${value}'. Found: ${result.length}`); // デコレーターの代わりにログを追加
      return result;
  }
}

// 各エンティティ用のデータストアインスタンス
const usersDb = new InMemoryDatabase<User>();
const productsDb = new InMemoryDatabase<Product>();
const ordersDb = new InMemoryDatabase<Order>();
const reviewsDb = new InMemoryDatabase<Review>();
const paymentsDb = new InMemoryDatabase<PaymentTransaction>();

/**
* ユーザー関連のロジックを処理するサービス。
*/
class UserService {
  private db: InMemoryDatabase<User>;

  constructor(db: InMemoryDatabase<User>) {
      this.db = db;
  }

  async registerUser(userData: New<User>): Promise<ApiResponse<User>> {
      console.log(`[LOG] Method 'registerUser' called.`); // デコレーターの代わりにログを追加
      const existingUser = this.db.findBy('username', userData.username);
      if (existingUser.length > 0) {
          return { success: false, error: 'Username already exists.' };
      }
      // パスワードのハッシュ化（実際にはもっと複雑な処理が必要）
      userData.passwordHash = `hashed_${userData.passwordHash}_${Date.now()}`;
      const newUser = this.db.add(userData);
      return { success: true, data: newUser };
  }

  async authenticateUser(credentials: UserCredentials): Promise<ApiResponse<User>> {
      console.log(`[LOG] Method 'authenticateUser' called.`); // デコレーターの代わりにログを追加
      const users = this.db.findBy('username', credentials.username);
      const user = users[0];
      if (!user) {
          return { success: false, error: 'User not found.' };
      }
      // パスワードの比較（実際にはハッシュの比較）
      if (user.passwordHash === `hashed_${credentials.passwordHash}_${user.createdAt.getTime()}`) { // 簡易比較
          return { success: true, data: user };
      }
      return { success: false, error: 'Invalid credentials.' };
  }

  getUserProfile(userId: string): ApiResponse<User> {
      console.log(`[LOG] Method 'getUserProfile' called.`); // デコレーターの代わりにログを追加
      const user = this.db.get(userId);
      if (!user) {
          return { success: false, error: 'User not found.' };
      }
      // パスワードハッシュを含まない形で返す
      const { passwordHash, ...safeUser } = user;
      return { success: true, data: safeUser as User };
  }

  updateUserProfile(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>>): ApiResponse<User> {
      console.log(`[LOG] Method 'updateUserProfile' called.`); // デコレーターの代わりにログを追加
      const updatedUser = this.db.update(userId, updates);
      if (!updatedUser) {
          return { success: false, error: 'User not found.' };
      }
      const { passwordHash, ...safeUser } = updatedUser;
      return { success: true, data: safeUser as User };
  }
}

/**
* 商品関連のロジックを処理するサービス。
*/
class ProductService {
  private db: InMemoryDatabase<Product>;

  constructor(db: InMemoryDatabase<Product>) {
      this.db = db;
  }

  async addProduct(productData: New<Product>): Promise<ApiResponse<Product>> {
      console.log(`[LOG] Method 'addProduct' called.`); // デコレーターの代わりにログを追加
      if (productData.price <= 0 || productData.stock < 0) {
          return { success: false, error: 'Price and stock must be positive.' };
      }
      const newProduct = this.db.add(productData);
      return { success: true, data: newProduct };
  }

  getProduct(productId: string): ApiResponse<Product> {
      console.log(`[LOG] Method 'getProduct' called.`); // デコレーターの代わりにログを追加
      const product = this.db.get(productId);
      if (!product) {
          return { success: false, error: 'Product not found.' };
      }
      return { success: true, data: product };
  }

  getAllProducts(category?: ProductCategory): ApiResponse<Product[]> {
      console.log(`[LOG] Method 'getAllProducts' called.`); // デコレーターの代わりにログを追加
      let products = this.db.getAll();
      if (category) {
          products = products.filter(p => p.category === category);
      }
      return { success: true, data: products };
  }

  updateProduct(productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): ApiResponse<Product> {
      console.log(`[LOG] Method 'updateProduct' called.`); // デコレーターの代わりにログを追加
      const updatedProduct = this.db.update(productId, updates);
      if (!updatedProduct) {
          return { success: false, error: 'Product not found.' };
      }
      return { success: true, data: updatedProduct };
  }

  deleteProduct(productId: string, adminId: string): ApiResponse<boolean> { // Admin only
      console.log(`[LOG] Method 'deleteProduct' called.`); // デコレーターの代わりにログを追加
      const product = this.db.get(productId);
      if (!product) {
          return { success: false, error: 'Product not found.' };
      }
      // 通常はadminIdのロールチェックが必要
      if (this.db.delete(productId)) {
          return { success: true, data: true, message: 'Product deleted successfully.' };
      }
      return { success: false, error: 'Failed to delete product.' };
  }
}

/**
* 注文関連のロジックを処理するサービス。
*/
class OrderService {
  private ordersDb: InMemoryDatabase<Order>;
  private productsDb: InMemoryDatabase<Product>;
  private usersDb: InMemoryDatabase<User>;

  constructor(ordersDb: InMemoryDatabase<Order>, productsDb: InMemoryDatabase<Product>, usersDb: InMemoryDatabase<User>) {
      this.ordersDb = ordersDb;
      this.productsDb = productsDb;
      this.usersDb = usersDb;
  }

  async createOrder(userId: string, items: Array<{ productId: string; quantity: number }>, shippingAddress: Address, paymentMethod: PaymentMethod): Promise<ApiResponse<Order>> {
      console.log(`[LOG] Method 'createOrder' called.`); // デコレーターの代わりにログを追加
      const user = this.usersDb.get(userId);
      if (!user) {
          return { success: false, error: 'User not found.' };
      }

      const orderItems: OrderItem[] = [];
      let totalAmount = 0;

      for (const item of items) {
          const product = this.productsDb.get(item.productId);
          if (!product) {
              return { success: false, error: `Product with ID ${item.productId} not found.` };
          }
          if (product.stock < item.quantity) {
              return { success: false, error: `Not enough stock for product '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}.` };
          }

          orderItems.push({
              productId: product.id,
              productName: product.name,
              quantity: item.quantity,
              priceAtOrder: product.price
          });
          totalAmount += product.price * item.quantity;

          // 在庫を減らす
          this.productsDb.update(product.id, { stock: product.stock - item.quantity });
      }

      const newOrder: New<Order> = {
          userId,
          items: orderItems,
          totalAmount,
          status: OrderStatus.Pending,
          shippingAddress,
          paymentMethod,
          paymentStatus: 'Unpaid'
      };

      const createdOrder = this.ordersDb.add(newOrder);
      return { success: true, data: createdOrder };
  }

  getOrder(orderId: string): ApiResponse<Order> {
      console.log(`[LOG] Method 'getOrder' called.`); // デコレーターの代わりにログを追加
      const order = this.ordersDb.get(orderId);
      if (!order) {
          return { success: false, error: 'Order not found.' };
      }
      return { success: true, data: order };
  }

  getUserOrders(userId: string): ApiResponse<Order[]> {
      console.log(`[LOG] Method 'getUserOrders' called.`); // デコレーターの代わりにログを追加
      const orders = this.ordersDb.findBy('userId', userId);
      return { success: true, data: orders };
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus): ApiResponse<Order> {
      console.log(`[LOG] Method 'updateOrderStatus' called.`); // デコレーターの代わりにログを追加
      const updatedOrder = this.ordersDb.update(orderId, { status: newStatus });
      if (!updatedOrder) {
          return { success: false, error: 'Order not found.' };
      }
      // ステータスに応じた追加処理（例：発送日設定など）
      if (newStatus === OrderStatus.Shipped && !updatedOrder.shippedDate) {
          this.ordersDb.update(orderId, { shippedDate: new Date() });
      } else if (newStatus === OrderStatus.Delivered && !updatedOrder.deliveredDate) {
          this.ordersDb.update(orderId, { deliveredDate: new Date() });
      } else if (newStatus === OrderStatus.Cancelled) {
          // キャンセル時の在庫戻し処理など
          for (const item of updatedOrder.items) {
              const product = this.productsDb.get(item.productId);
              if (product) {
                  this.productsDb.update(product.id, { stock: product.stock + item.quantity });
              }
          }
      }
      return { success: true, data: this.ordersDb.get(orderId)! }; // 更新された最新のものを返す
  }
}

/**
* 支払い関連のロジックを処理するサービス。
*/
class PaymentService {
  private paymentsDb: InMemoryDatabase<PaymentTransaction>;
  private ordersDb: InMemoryDatabase<Order>;

  constructor(paymentsDb: InMemoryDatabase<PaymentTransaction>, ordersDb: InMemoryDatabase<Order>) {
      this.paymentsDb = paymentsDb;
      this.ordersDb = ordersDb;
  }

  async processPayment(orderId: string, userId: string, amount: number, method: PaymentMethod): Promise<ApiResponse<PaymentTransaction>> {
      console.log(`[LOG] Method 'processPayment' called.`); // デコレーターの代わりにログを追加
      const order = this.ordersDb.get(orderId);
      if (!order || order.userId !== userId || order.totalAmount !== amount || order.paymentStatus === 'Paid') {
          return { success: false, error: 'Invalid order or order already paid.' };
      }

      // ここで実際の支払いゲートウェイとの連携をシミュレート
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const status = Math.random() > 0.1 ? 'Success' : 'Failed'; // 90%の確率で成功

      const newPayment: New<PaymentTransaction> = {
          orderId,
          userId,
          amount,
          method,
          transactionId,
          status
      };

      const createdPayment = this.paymentsDb.add(newPayment);

      if (status === 'Success') {
          // 注文の支払いステータスを更新
          this.ordersDb.update(orderId, { paymentStatus: 'Paid', status: OrderStatus.Processing });
          return { success: true, data: createdPayment, message: 'Payment successful!' };
      } else {
          return { success: false, error: 'Payment failed.', data: createdPayment };
      }
  }

  getPaymentHistory(userId: string): ApiResponse<PaymentTransaction[]> {
      console.log(`[LOG] Method 'getPaymentHistory' called.`); // デコレーターの代わりにログを追加
      const payments = this.paymentsDb.findBy('userId', userId);
      return { success: true, data: payments };
  }
}

/**
* レビュー関連のロジックを処理するサービス。
*/
class ReviewService {
  private reviewsDb: InMemoryDatabase<Review>;
  private productsDb: InMemoryDatabase<Product>;

  constructor(reviewsDb: InMemoryDatabase<Review>, productsDb: InMemoryDatabase<Product>) {
      this.reviewsDb = reviewsDb;
      this.productsDb = productsDb;
  }

  async submitReview(reviewData: New<Review>): Promise<ApiResponse<Review>> {
      console.log(`[LOG] Method 'submitReview' called.`); // デコレーターの代わりにログを追加
      if (reviewData.rating < 1 || reviewData.rating > 5) {
          return { success: false, error: 'Rating must be between 1 and 5.' };
      }
      const product = this.productsDb.get(reviewData.productId);
      if (!product) {
          return { success: false, error: 'Product not found for review.' };
      }

      const newReview = this.reviewsDb.add(reviewData);

      // 商品の平均評価とレビュー数を更新する（簡易的な計算）
      const productReviews = this.reviewsDb.findBy('productId', product.id);
      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const newAverageRating = totalRating / productReviews.length;

      this.productsDb.update(product.id, {
          rating: parseFloat(newAverageRating.toFixed(1)),
          reviewsCount: productReviews.length
      });

      return { success: true, data: newReview };
  }

  getProductReviews(productId: string): ApiResponse<Review[]> {
      console.log(`[LOG] Method 'getProductReviews' called.`); // デコレーターの代わりにログを追加
      const reviews = this.reviewsDb.findBy('productId', productId);
      return { success: true, data: reviews };
  }

  getUserReviews(userId: string): ApiResponse<Review[]> {
      console.log(`[LOG] Method 'getUserReviews' called.`); // デコレーターの代わりにログを追加
      const reviews = this.reviewsDb.findBy('userId', userId);
      return { success: true, data: reviews };
  }
}


// --- Main Application / Simulation ---

// サービスインスタンスの作成
const userService = new UserService(usersDb);
const productService = new ProductService(productsDb);
const orderService = new OrderService(ordersDb, productsDb, usersDb);
const paymentService = new PaymentService(paymentsDb, ordersDb);
const reviewService = new ReviewService(reviewsDb, productsDb);

async function simulateECWorkflow() {
  console.log("--- ECサイトのバックエンド処理シミュレーション開始 ---");

  // 1. ユーザー登録とログイン
  console.log("\n--- ユーザー登録とログイン ---");
  const userResult = await userService.registerUser({
      username: "testuser",
      email: "test@example.com",
      passwordHash: "password123",
      role: UserRole.Customer,
      address: { street: "123 Main St", city: "Anytown", state: "CA", zipCode: "90210", country: "USA" }
  });
  let currentUser: User | undefined;
  if (userResult.success && userResult.data) {
      console.log("ユーザー登録成功:", userResult.data.username);
      currentUser = userResult.data;
      const loginResult = await userService.authenticateUser({ username: "testuser", passwordHash: "password123" });
      if (loginResult.success && loginResult.data) {
          console.log("ログイン成功:", loginResult.data.username);
      } else {
          console.error("ログイン失敗:", loginResult.error);
      }
  } else {
      console.error("ユーザー登録失敗:", userResult.error);
      return;
  }

  // 2. 商品の追加 (SellerやAdminの役割を想定)
  console.log("\n--- 商品の追加 ---");
  const product1Result = await productService.addProduct({
      name: "Wireless Headphones",
      description: "High-quality noise-cancelling headphones.",
      price: 199.99,
      category: ProductCategory.Electronics,
      stock: 50,
      imageUrl: "http://example.com/hp.jpg",
      sellerId: "seller_admin_1" // 仮のID
  });
  let headphoneProduct: Product | undefined;
  if (product1Result.success && product1Result.data) {
      console.log("商品追加成功:", product1Result.data.name);
      headphoneProduct = product1Result.data;
  } else {
      console.error("商品追加失敗:", product1Result.error);
      return;
  }

  const product2Result = await productService.addProduct({
      name: "TypeScript Deep Dive",
      description: "Comprehensive guide to TypeScript.",
      price: 39.99,
      category: ProductCategory.Books,
      stock: 100,
      imageUrl: "http://example.com/ts_book.jpg",
      sellerId: "seller_admin_1"
  });
  let bookProduct: Product | undefined;
  if (product2Result.success && product2Result.data) {
      console.log("商品追加成功:", product2Result.data.name);
      bookProduct = product2Result.data;
  } else {
      console.error("商品追加失敗:", product2Result.error);
      return;
  }

  // 3. 全商品とカテゴリ別商品の取得
  console.log("\n--- 商品リストの取得 ---");
  const allProductsResult = productService.getAllProducts();
  if (allProductsResult.success && allProductsResult.data) {
      console.log("全商品数:", allProductsResult.data.length);
  }

  const electronicsProductsResult = productService.getAllProducts(ProductCategory.Electronics);
  if (electronicsProductsResult.success && electronicsProductsResult.data) {
      console.log("家電製品数:", electronicsProductsResult.data.length);
  }

  // 4. 注文の作成
  console.log("\n--- 注文の作成 ---");
  if (currentUser && headphoneProduct && bookProduct) {
      const orderResult = await orderService.createOrder(
          currentUser.id,
          [
              { productId: headphoneProduct.id, quantity: 1 },
              { productId: bookProduct.id, quantity: 2 }
          ],
          currentUser.address!, // 登録時に住所があるので必ず存在する
          PaymentMethod.CreditCard
      );
      let currentOrder: Order | undefined;
      if (orderResult.success && orderResult.data) {
          console.log("注文作成成功。合計金額:", orderResult.data.totalAmount, "ステータス:", orderResult.data.status);
          currentOrder = orderResult.data;
          const updatedHeadphoneStock = productService.getProduct(headphoneProduct.id);
          console.log("ヘッドホンの新しい在庫:", updatedHeadphoneStock.success ? updatedHeadphoneStock.data?.stock : '取得失敗');
      } else {
          console.error("注文作成失敗:", orderResult.error);
          return;
      }

      // 5. 支払い処理
      console.log("\n--- 支払い処理 ---");
      if (currentOrder) {
          const paymentResult = await paymentService.processPayment(
              currentOrder.id,
              currentOrder.userId,
              currentOrder.totalAmount,
              currentOrder.paymentMethod
          );
          if (paymentResult.success && paymentResult.data) {
              console.log("支払い成功！トランザクションID:", paymentResult.data.transactionId);
              const updatedOrder = orderService.getOrder(currentOrder.id);
              console.log("支払後の注文ステータス:", updatedOrder.success ? updatedOrder.data?.status : '取得失敗');
          } else {
              console.error("支払い失敗:", paymentResult.error);
          }
      }

      // 6. 注文ステータスの更新（出荷、配達）
      console.log("\n--- 注文ステータスの更新 ---");
      if (currentOrder) {
          const shippedResult = await orderService.updateOrderStatus(currentOrder.id, OrderStatus.Shipped);
          if (shippedResult.success) {
              console.log("注文を出荷済みに更新:", shippedResult.data?.status);
          }
          const deliveredResult = await orderService.updateOrderStatus(currentOrder.id, OrderStatus.Delivered);
          if (deliveredResult.success) {
              console.log("注文を配達済みに更新:", deliveredResult.data?.status);
          }
      }

      // 7. 商品レビューの投稿
      console.log("\n--- 商品レビューの投稿 ---");
      if (currentUser && headphoneProduct) {
          const reviewResult = await reviewService.submitReview({
              productId: headphoneProduct.id,
              userId: currentUser.id,
              rating: 5,
              comment: "素晴らしい音質！デザインも気に入りました。"
          });
          if (reviewResult.success) {
              console.log("レビュー投稿成功。商品ID:", reviewResult.data?.productId);
              const updatedProduct = productService.getProduct(headphoneProduct.id);
              console.log("ヘッドホン商品の新しい評価:", updatedProduct.success ? updatedProduct.data?.rating : '取得失敗');
              console.log("ヘッドホン商品のレビュー数:", updatedProduct.success ? updatedProduct.data?.reviewsCount : '取得失敗');
          } else {
              console.error("レビュー投稿失敗:", reviewResult.error);
          }
      }
  } else {
      console.error("必要な情報が不足しているため、注文処理をスキップしました。");
  }


  console.log("\n--- ECサイトのバックエンド処理シミュレーション終了 ---");
}

// シミュレーション実行
simulateECWorkflow();

// 型ガードの例
function isProduct(obj: any): obj is Product {
  return (obj as Product).category !== undefined;
}

const unknownItem: any = { name: "テスト", price: 100, category: ProductCategory.Books };
if (isProduct(unknownItem)) {
  console.log(`\n型ガード：これは商品です。カテゴリ: ${unknownItem.category}`);
}

// Generic Utility Functionの例
function safeParseJSON<T>(jsonString: string): T | null {
  try {
      return JSON.parse(jsonString) as T;
  } catch (e) {
      console.error("JSONパースエラー:", e);
      return null;
  }
}

const jsonProduct = '{"id": "prod_1", "name": "Generic Item", "description": "...", "price": 10.0, "category": "Electronics", "stock": 5, "imageUrl": "url", "sellerId": "seller1", "createdAt": "2023-01-01T00:00:00Z", "updatedAt": "2023-01-01T00:00:00Z"}';
const parsedProduct = safeParseJSON<Product>(jsonProduct);
if (parsedProduct) {
  console.log("Generic Utility Function: パースされた商品名:", parsedProduct.name);
}
