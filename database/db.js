import mongoose from "mongoose";

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost/clients", { useNewUrlParser: true });

const clientsSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  company: String,
  emails: Array,
  age: Number,
  clientType: String,
  orders: Array
});

const Clients = mongoose.model("clients", clientsSchema);

const productsSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number
});

const Products = mongoose.model("products", productsSchema);

const orderSchema = new mongoose.Schema({
  order: Array,
  total: Number,
  orderDate: Date,
  client: mongoose.Types.ObjectId,
  state: String
});

const Orders = mongoose.model("orders", orderSchema);

export { Clients, Products, Orders };
