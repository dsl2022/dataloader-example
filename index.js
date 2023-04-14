const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const DataLoader = require('dataloader');

// Define a simple user data source
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];

// Define a simple loader function to fetch user data by ID
const batchUsersById = async (ids) => {
  console.log('Fetching users by ID:', ids);
  const result = ids.map(id => users.find(user => user.id === id));
  console.log(result)
  return result;
};

// Create a DataLoader instance for fetching users by ID
const userLoader = new DataLoader(batchUsersById);

// Define a simple GraphQL schema
const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
  }
  type Query {
    user(id: ID!): User
  }
`);

// Define resolvers for the GraphQL schema
const resolvers = {  
    user: async (parent) => {        
        return userLoader.load(parseInt(parent.id))
    }
  
};


// Create an Express app and apply GraphQL middleware
const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolvers,
  graphiql: true
}));

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
