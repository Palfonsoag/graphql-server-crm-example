import express from "express";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { typeDefs } from "./database/schema";
import { resolvers } from "./database/resolvers";

dotenv.config({ path: "variables.env" });

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers["authorization"];
    // console.log(token);
    if (token !== "null") {
      try {
        const currentUser = await jwt.verify(token, process.env.SECRET);
        //console.log(currentUser);
        req.currentUser = currentUser;
        return { currentUser };
      } catch (error) {
        console.log(error);
      }
    }
  }
});

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(
    `The server is running on http://localhost:4000${server.graphqlPath}`
  )
);
