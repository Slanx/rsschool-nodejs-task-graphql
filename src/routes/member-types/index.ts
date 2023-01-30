import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return fastify.db.memberTypes.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const result = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!result)
        throw fastify.httpErrors.notFound(
          "Sorry, the member type doesn't exsict"
        );

      return result;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const memberTypeId = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!memberTypeId) {
        throw fastify.httpErrors.badRequest(
          "Sorry, the member type doesn't exsict"
        );
      }

      return fastify.db.memberTypes.change(request.params.id, request.body);
    }
  );
};

export default plugin;
