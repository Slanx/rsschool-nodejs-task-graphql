import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import { isUUID } from '../../utils/validators';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      if (!isUUID(request.params.id)) {
        throw fastify.httpErrors.notFound('Sorry, invalid id type');
      }

      const result = await fastify.db.posts.findOne({
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
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      return await fastify.db.posts.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      if (!isUUID(request.params.id)) {
        throw fastify.httpErrors.badRequest('Sorry, invalid id type');
      }

      return await fastify.db.posts.delete(request.params.id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const result = await fastify.db.posts.change(
          request.params.id,
          request.body
        );
        return result;
      } catch (e) {
        throw fastify.httpErrors.badRequest("Sorry, the post doesn't exsict");
      }
    }
  );
};

export default plugin;
