import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',

  fields: () => ({
    id: {
      type: GraphQLID,
    },
    avatar: {
      type: new GraphQLNonNull(GraphQLString),
    },
    sex: {
      type: new GraphQLNonNull(GraphQLString),
    },
    birthday: {
      type: new GraphQLNonNull(GraphQLString),
    },
    country: {
      type: new GraphQLNonNull(GraphQLString),
    },
    street: {
      type: new GraphQLNonNull(GraphQLString),
    },
    city: {
      type: new GraphQLNonNull(GraphQLString),
    },
    memberTypeId: {
      type: GraphQLID,
    },
    userId: {
      type: GraphQLID,
    },
  }),
});
