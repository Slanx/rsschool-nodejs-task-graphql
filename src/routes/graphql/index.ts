import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
} from 'graphql';
import { validate } from 'graphql/validation';
import { parse, Source } from 'graphql/language';
import depthLimit = require('graphql-depth-limit');
import { graphqlBodySchema } from './schema';
import { MemberType } from './types/memberType';
import { PostType } from './types/postType';
import { ProfileType } from './types/profileType';
import { UserCreateInput, UserType } from './types/userType';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const RootQuery = new GraphQLObjectType({
        name: 'query',
        fields: {
          users: {
            type: new GraphQLList(UserType),
            resolve: () => {
              return fastify.db.users.findMany();
            },
          },
          profiles: {
            type: new GraphQLList(ProfileType),
            resolve: () => {
              return fastify.db.profiles.findMany();
            },
          },
          posts: {
            type: new GraphQLList(PostType),
            resolve: () => {
              return fastify.db.posts.findMany();
            },
          },
          memberTypes: {
            type: new GraphQLList(MemberType),
            resolve: () => {
              return fastify.db.memberTypes.findMany();
            },
          },
          user: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parents, args) {
              return fastify.db.users.findOne({ key: 'id', equals: args.id });
            },
          },
          profile: {
            type: ProfileType,
            args: { id: { type: GraphQLID } },
            resolve(parents, args) {
              return fastify.db.profiles.findOne({
                key: 'id',
                equals: args.id,
              });
            },
          },
          post: {
            type: PostType,
            args: { id: { type: GraphQLID } },
            resolve(parents, args) {
              return fastify.db.posts.findOne({ key: 'id', equals: args.id });
            },
          },
          memberType: {
            type: MemberType,
            args: { id: { type: GraphQLID } },
            resolve(parents, args) {
              return fastify.db.memberTypes.findOne({
                key: 'id',
                equals: args.id,
              });
            },
          },
        },
      });

      const RootMutation = new GraphQLObjectType({
        name: 'mutation',
        fields: () => ({
          createUser: {
            type: UserType,
            args: { user: { type: UserCreateInput } },
            resolve: async (_, args) => {
              return await fastify.db.users.create(args.user);
            },
          },
        }),
      });

      const schema = new GraphQLSchema({
        query: RootQuery,
        mutation: RootMutation,
      });

      const source = new Source(String(request.body.query));
      const ast = parse(source);
      validate(schema, ast, [depthLimit(6)]).forEach((error) => {
        throw error;
      });

      return graphql({
        schema,
        variableValues: request.body.variables,
        source: String(request.body.query),
        contextValue: fastify,
      });
    }
  );
};

export default plugin;
