import mongoose from "mongoose";
import { Clients } from "./db";

class Client {
  constructor(
    id,
    { name, lastName, company, emails, age, clientType, orders }
  ) {
    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.company = company;
    this.emails = emails;
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
    getClients: (root, { limit }) => {
      return Clients.find({}).limit(limit);
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
    }
  }
};
