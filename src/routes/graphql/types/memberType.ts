import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
} from 'graphql';

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    monthPostsLimit: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    discount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  }),
});
