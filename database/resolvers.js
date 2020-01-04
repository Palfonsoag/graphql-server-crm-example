import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Clients, Products, Orders, Users } from "./db";

dotenv.config({ path: "variables.env" });

const ObjectId = mongoose.Types.ObjectId;

const createToken = (userLogged, secret, expiration) => {
  const { user } = userLogged;
  return jwt.sign({ user }, secret, { expiresIn: expiration });
};

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
    getClients: (root, { limit, offset, seller }) => {
      let filter = {};
      if (seller) {
        filter = { seller: new ObjectId(seller) };
      }
      return Clients.find(filter)
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

    getProducts: (root, { limit, offset, stock }) => {
      let filter = {};
      if (stock) {
        filter = { stock: { $gt: 0 } };
      }
      return Products.find(filter)
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
    },
    //get orders by client

    getOrdersByClient: (root, { client }) => {
      return new Promise((resolve, reject) => {
        Orders.find({ client }, (error, orders) => {
          if (error) reject(error);
          else resolve(orders);
        });
      });
    },

    //get top 10 buyers

    topClients: root => {
      return new Promise((resolve, reject) => {
        Orders.aggregate(
          [
            { $match: { state: "COMPLETED" } },
            {
              $group: {
                _id: "$client",
                total: { $sum: "$total" }
              }
            },
            {
              $lookup: {
                from: "clients",
                localField: "_id",
                foreignField: "_id",
                as: "client"
              }
            },
            {
              $sort: { total: -1 }
            },
            { $limit: 10 }
          ],
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
    },

    //get top 10 sellers

    topSellers: root => {
      return new Promise((resolve, reject) => {
        Orders.aggregate(
          [
            { $match: { state: "COMPLETED" } },
            {
              $group: {
                _id: "$seller",
                total: { $sum: "$total" }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "seller"
              }
            },
            {
              $sort: { total: -1 }
            },
            { $limit: 10 }
          ],
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
    },

    //get orders by client

    getLoggedUser: (root, args, { currentUser }) => {
      if (!currentUser) {
        return null;
      }

      //console.log(currentUser);

      const user = Users.findOne({ user: currentUser.user });

      return user;
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
        orders: input.orders,
        seller: input.seller
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
        state: "PENDING",
        seller: input.seller
      });

      newOrder.id = newOrder._id;

      return new Promise((resolve, reject) => {
        newOrder.save(error => {
          if (error) reject(error);
          else resolve(newOrder);
        });
      });
    },
    //update Order  state mutation
    updateOrderState: (root, { input }) => {
      return new Promise((resolve, reject) => {
        const { state } = input;
        let instruction;
        if (state === "COMPLETED") {
          instruction = "-";
        } else if (state === "CANCELED") {
          instruction = "+";
        }

        input.order.forEach(order => {
          Products.updateOne(
            { _id: order.id },
            { $inc: { stock: `${instruction}${order.volume}` } },
            error => {
              if (error) return new Error(error);
            }
          );
        });
        Orders.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          error => {
            if (error) reject(error);
            else resolve("The order State was updated successfully");
          }
        );
      });
    },

    //create user mutation

    createUser: async (root, { input }) => {
      const userExist = await Users.findOne({ user: input.user });

      if (userExist) {
        throw new Error("The user already exist");
      }

      const newUser = await new Users({
        user: input.user,
        password: input.password,
        name: input.name,
        rol: input.rol
      }).save();
      // console.log(newUser);
      return "The user was created successfully";
    },

    userAuthentication: async (root, { user, password }) => {
      const userName = await Users.findOne({ user });

      if (!userName) {
        throw new Error("The user is not registered");
      }

      const passwordCheck = await bcrypt.compare(password, userName.password);

      if (!passwordCheck) {
        throw new Error("wrong password");
      }

      return { token: createToken(userName, process.env.SECRET, "1hr") };
    }
  }
};
