import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import { isUUID } from '../../utils/validators';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    return await fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      if (!isUUID(request.params.id)) {
        throw fastify.httpErrors.notFound('Sorry, invalid id type');
      }

      const result = await fastify.db.profiles.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!result)
        throw fastify.httpErrors.notFound(
          "Sorry, the profile type doesn't exsict"
        );

      return result;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const userId = await fastify.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });

      if (!userId) {
        throw fastify.httpErrors.badRequest("Sorry, this user doesn't exsist");
      }

      const profile = await fastify.db.profiles.findOne({
        key: 'userId',
        equals: request.body.userId,
      });

      if (profile) {
        throw fastify.httpErrors.badRequest(
          'Sorry, this user already has a profile'
        );
      }

      const memberTypeId = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: request.body.memberTypeId,
      });

      if (!memberTypeId) {
        throw fastify.httpErrors.badRequest("Sorry, this type doesn't exsist ");
      }

      return fastify.db.profiles.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      if (!isUUID(request.params.id)) {
        throw fastify.httpErrors.badRequest('Sorry, invalid id type');
      }

      return fastify.db.profiles.delete(request.params.id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      if (!isUUID(request.params.id)) {
        throw fastify.httpErrors.badRequest('Sorry, invalid id type');
      }

      return fastify.db.profiles.change(request.params.id, request.body);
    }
  );
};

export default plugin;
