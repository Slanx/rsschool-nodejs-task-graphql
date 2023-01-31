import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export const PostType = new GraphQLObjectType({
  name: 'Post',

  fields: () => ({
    id: {
      type: GraphQLID,
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    userId: {
      type: GraphQLID,
    },
  }),
});
