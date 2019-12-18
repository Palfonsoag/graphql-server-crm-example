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

export { Clients };
