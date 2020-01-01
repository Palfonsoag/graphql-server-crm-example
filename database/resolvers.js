import mongoose from "mongoose";
import { Clients, Products, Orders } from "./db";

export const resolvers = {
  Query: {
    //get single client Query
    getClient: (root, { id }) => {
      return new Promise((resolve, reject) => {
        Clients.findById(id, (error, client) => {
          if (error) reject(error);
          else resolve(client);
        });
      });
    },

    //get Clients Query
    getClients: (root, { limit, offset }) => {
      return Clients.find({})
        .limit(limit)
        .skip(offset);
    },

    //get Clients count Query
    totalClients: root => {
      return new Promise((resolve, reject) => {
        Clients.countDocuments({}, (error, count) => {
          if (error) reject(error);
          else resolve(count);
        });
      });
    },

    //get Products Query

    getProducts: (root, { limit, offset }) => {
      return Products.find({})
        .limit(limit)
        .skip(offset);
    },

    //get single Product Query
    getProduct: (root, { id }) => {
      return new Promise((resolve, reject) => {
        Products.findById(id, (error, product) => {
          if (error) reject(error);
          else resolve(product);
        });
      });
    },

    //get Product count Query
    totalProducts: root => {
      return new Promise((resolve, reject) => {
        Products.countDocuments({}, (error, count) => {
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

    //delete client mutation
    deleteClient: (root, { id }) => {
      return new Promise((resolve, reject) => {
        Clients.findOneAndDelete({ _id: id }, error => {
          if (error) reject(error);
          else resolve("The Client was deleted");
        });
      });
    },

    //create Product mutation
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
    },

    //update Product mutation
    updateProduct: (root, { input }) => {
      return new Promise((resolve, reject) => {
        Products.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (error, product) => {
            if (error) reject(error);
            else resolve(product);
          }
        );
      });
    },

    //delete Product mutation
    deleteProduct: (root, { id }) => {
      return new Promise((resolve, reject) => {
        Products.findOneAndDelete({ _id: id }, error => {
          if (error) reject(error);
          else resolve("The Product was deleted");
        });
      });
    },
    //create Order mutation
    createOrder: (root, { input }) => {
      const newOrder = new Orders({
        order: input.order,
        total: input.total,
        orderDate: new Date(),
        client: input.client,
        state: "PENDING"
      });

      newOrder.id = newOrder._id;

      return new Promise((resolve, reject) => {
        newOrder.save(error => {
          if (error) reject(error);
          else resolve(newOrder);
        });
      });
    }
  }
};
