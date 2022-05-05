import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import Invoice from '../../entities/invoice.entity';
import InvoiceItem from '../../entities/invoice-item.entity';

import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => InvoiceItem)
export class InvoiceItemResolver {
  @FieldResolver()
  project(@Root() root: InvoiceItem, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.projectByIdLoader.load(root.project_id);
  }

  @FieldResolver()
  invoice(@Root() root: InvoiceItem, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.invoicesByIdLoader.load(root.invoice_id);
  }
}
