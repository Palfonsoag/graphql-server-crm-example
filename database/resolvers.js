import mongoose from "mongoose";
import { Clients, Products } from "./db";

class Client {
  constructor(
    id,
    { name, lastName, company, emails, age, clientType, orders }
  ) {
    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.company = company;
    this.email = email;
    this.age = age;
    this.clientType = clientType;
    this.orders = orders;
  }
}

export const resolvers = {
  Query: {
    getClient: (root, { id }) => {
      return new Promise((resolve, reject) => {
        Clients.findById(id, (error, client) => {
          if (error) reject(error);
          else resolve(client);
        });
      });
    },
    getClients: (root, { limit, offset }) => {
      return Clients.find({})
        .limit(limit)
        .skip(offset);
    },
    totalClients: root => {
      return new Promise((resolve, reject) => {
        Clients.countDocuments({}, (error, count) => {
          if (error) reject(error);
          else resolve(count);
        });
      });
    }
  },
  Mutation: {
    //create client mutation
    createClient: (root, { input }) => {
      const newClient = new Clients({
        name: input.name,
        lastName: input.lastName,
        company: input.company,
        emails: input.emails,
        age: input.age,
        clientType: input.clientType,
        orders: input.orders
      });
      newClient.id = newClient._id;
      return new Promise((resolve, reject) => {
        newClient.save(error => {
          if (error) reject(error);
          else resolve(newClient);
        });
      });
    },

    //update client mutation
    updateClient: (root, { input }) => {
      return new Promise((resolve, reject) => {
        Clients.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (error, client) => {
            if (error) reject(error);
            else resolve(client);
          }
        );
      });
    },
    deleteClient: (root, { id }) => {
      return new Promise((resolve, reject) => {
        Clients.findOneAndRemove({ _id: id }, error => {
          if (error) reject(error);
          else resolve("The Client was deleted");
        });
      });
    },
    createProduct: (root, { input }) => {
      const newProduct = new Products({
        name: input.name,
        price: input.price,
        stock: input.stock
      });

      newProduct.id = newProduct._id;

      return new Promise((resolve, reject) => {
        newProduct.save(error => {
          if (error) reject(error);
          else resolve(newProduct);
        });
      });
    }
  }
};
