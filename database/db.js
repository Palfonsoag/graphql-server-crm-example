import mongoose from "mongoose";
import bcrypt from "bcrypt";

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost/clients", { useNewUrlParser: true });

const clientSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  company: String,
  emails: Array,
  age: Number,
  clientType: String,
  orders: Array
});

const Clients = mongoose.model("clients", clientSchema);

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number
});

const Products = mongoose.model("products", productSchema);

const orderSchema = new mongoose.Schema({
  order: Array,
  total: Number,
  orderDate: Date,
  client: mongoose.Types.ObjectId,
  state: String
});

const Orders = mongoose.model("orders", orderSchema);

const userSchema = new mongoose.Schema({
  user: String,
  name: String,
  password: String,
  rol: String
});

userSchema.pre("save", function(next) {
  if (!this.isModified("password")) {
    return next;
  }

  bcrypt.genSalt(10, (error, salt) => {
    if (error) return next(error);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

const Users = mongoose.model("users", userSchema);

export { Clients, Products, Orders, Users };
