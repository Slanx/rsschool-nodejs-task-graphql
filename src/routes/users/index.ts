import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { isUUID } from '../../utils/validators';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return await fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const result = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!result)
        throw fastify.httpErrors.notFound("Sorry, the post doesn't exsict");

      return result;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return fastify.db.users.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      if (!isUUID(request.params.id)) {
        throw fastify.httpErrors.badRequest('Sorry, invalid id type');
      }

      const result = await fastify.db.users.delete(request.params.id);

      const profile = await fastify.db.profiles.findOne({
        key: 'userId',
        equals: request.params.id,
      });

      if (profile) await fastify.db.profiles.delete(profile.id);

      const posts = await fastify.db.posts.findMany({
        key: 'userId',
        equals: request.params.id,
      });

      for await (const post of posts) {
        fastify.db.posts.delete(post.id);
      }

      const subcribedUsers = await fastify.db.users.findMany({
        key: 'subscribedToUserIds',
        inArray: request.params.id,
      });

      for await (const user of subcribedUsers) {
        fastify.db.users.change(user.id, {
          subscribedToUserIds: user.subscribedToUserIds.filter(
            (user) => user !== request.params.id
          ),
        });
      }

      return result;
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const subcribedUser = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!subcribedUser) {
        throw fastify.httpErrors.badRequest("Sorry, the user doesn't exsict");
      }

      const subcribedToUser = await fastify.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });

      if (!subcribedToUser) {
        throw fastify.httpErrors.badRequest(
          "Sorry, you're following a non-existent user"
        );
      }

      const result = await fastify.db.users.change(request.body.userId, {
        subscribedToUserIds: [
          ...subcribedToUser.subscribedToUserIds,
          request.params.id,
        ],
      });

      return result;
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!user)
        throw fastify.httpErrors.notFound("Sorry, the user doesn't exsict");

      const subcribedToUser = await fastify.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });

      if (!subcribedToUser) {
        throw fastify.httpErrors.badRequest(
          "Sorry, you're following a non-existent user"
        );
      }

      const isFollow = subcribedToUser.subscribedToUserIds.includes(
        request.params.id
      );

      if (!isFollow) {
        throw fastify.httpErrors.badRequest(
          "Sorry, you're not following this user"
        );
      }

      const result = await fastify.db.users.change(request.body.userId, {
        subscribedToUserIds: subcribedToUser.subscribedToUserIds.filter(
          (user) => user !== request.params.id
        ),
      });

      return result;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      if (!isUUID(request.params.id)) {
        throw fastify.httpErrors.badRequest('Sorry, invalid id type');
      }

      return fastify.db.users.change(request.params.id, request.body);
    }
  );
};

export default plugin;
