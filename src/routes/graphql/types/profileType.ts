import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
} from 'graphql';
import { MemberType } from './memberType';

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
      type: new GraphQLNonNull(GraphQLInt),
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
    memberTypes: {
      type: MemberType,
      resolve(parents, args, context) {
        return context.db.memberTypes.findOne({
          key: 'id',
          equals: parents.memberTypeId,
        });
      },
    },
  }),
});
