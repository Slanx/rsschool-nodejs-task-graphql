import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
  GraphQLInputObjectType,
} from 'graphql';
import { PostType } from './postType';
import { ProfileType } from './profileType';

export const UserType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'User',

  fields: () => ({
    id: {
      type: GraphQLID,
    },
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    subscribedToUserIds: {
      type: new GraphQLList(GraphQLID),
    },
    profile: {
      type: ProfileType,
      resolve(parents, args, context) {
        return context.db.profiles.findOne({
          key: 'userId',
          equals: parents.id,
        });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parents, args, context) {
        return await context.db.posts.findMany({
          key: 'userId',
          equals: parents.id,
        });
      },
    },
    userSubcribedTo: {
      type: new GraphQLList(UserType),
      async resolve(parents, args, context) {
        return await context.db.users.findMany({
          key: 'subscribedToUserIds',
          inArray: parents.id,
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      async resolve(parents, args, context) {
        return await context.db.users.findMany({
          key: 'id',
          equalsAnyOf: parents.subscribedToUserIds,
        });
      },
    },
  }),
});

export const UserCreateInput = new GraphQLInputObjectType({
  name: 'UserCreateInput',
  fields: () => ({
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});
