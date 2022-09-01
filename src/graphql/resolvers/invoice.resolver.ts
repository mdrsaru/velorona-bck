import round from 'lodash/round';
import { inject, injectable } from 'inversify';
import { Resolver, Query, Ctx, Arg, Mutation, UseMiddleware, FieldResolver, Root } from 'type-graphql';

import { TYPES } from '../../types';
import authenticate from '../middlewares/authenticate';
import authorize from '../middlewares/authorize';
import { checkCompanyAccess } from '../middlewares/company';
import Paging from '../../utils/paging';
import User from '../../entities/user.entity';
import Invoice from '../../entities/invoice.entity';
import { Role as RoleEnum } from '../../config/constants';
import InvoiceValidation from '../../validation/invoice.validation';
import { PagingInput, DeleteInput, MessageResponse } from '../../entities/common.entity';

import {
  InvoicePagingResult,
  InvoiceQueryInput,
  InvoiceCreateInput,
  InvoiceUpdateInput,
  InvoicePDFInput,
} from '../../entities/invoice.entity';
import { IPaginationData } from '../../interfaces/paging.interface';
import { IInvoice, IInvoiceService } from '../../interfaces/invoice.interface';
import { IErrorService, IJoiService } from '../../interfaces/common.interface';
import { IGraphqlContext } from '../../interfaces/graphql.interface';

@injectable()
@Resolver((of) => Invoice)
export class InvoiceResolver {
  private name = 'InvoiceResolver';
  private invoiceService: IInvoiceService;
  private joiService: IJoiService;
  private errorService: IErrorService;

  constructor(
    @inject(TYPES.InvoiceService) invoiceService: IInvoiceService,
    @inject(TYPES.JoiService) joiService: IJoiService,
    @inject(TYPES.ErrorService) errorService: IErrorService
  ) {
    this.invoiceService = invoiceService;
    this.joiService = joiService;
    this.errorService = errorService;
  }

  @Query((returns) => InvoicePagingResult)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.CompanyAdmin, RoleEnum.SuperAdmin, RoleEnum.BookKeeper),
    checkCompanyAccess
  )
  async Invoice(@Arg('input') args: InvoiceQueryInput, @Ctx() ctx: any): Promise<IPaginationData<Invoice>> {
    const operation = 'Invoices';

    try {
      const pagingArgs = Paging.createPagingPayload(args);
      let result: IPaginationData<Invoice> = await this.invoiceService.getAllAndCount(pagingArgs);

      return result;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Query((returns) => String)
  @UseMiddleware(
    authenticate,
    authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin, RoleEnum.BookKeeper),
    checkCompanyAccess
  )
  async InvoicePDF(@Arg('input') args: InvoicePDFInput, @Ctx() ctx: any): Promise<string> {
    const operation = 'InvoicePDF';

    try {
      const pdf = await this.invoiceService.getPDF({
        id: args.id,
      });

      return pdf;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Invoice)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async InvoiceCreate(@Arg('input') args: InvoiceCreateInput, @Ctx() ctx: any): Promise<Invoice> {
    const operation = 'InvoiceCreate';

    try {
      const status = args.status;
      const timesheet_id = args.timesheet_id;
      const issueDate = args.issueDate;
      const dueDate = args.dueDate;
      const poNumber = args.poNumber;
      const totalQuantity = args.totalQuantity;
      const subtotal = args.subtotal;
      const totalAmount = args.totalAmount;
      const taxPercent = args.taxPercent ?? 0;
      const taxAmount = args.taxAmount ?? 0;
      const notes = args.notes;
      const company_id = args.company_id;
      const client_id = args.client_id;
      const discount = args.discount;
      const shipping = args.shipping;
      const needProject = args.needProject;
      const items = args.items;

      const schema = InvoiceValidation.create();
      await this.joiService.validate({
        schema,
        input: {
          status,
          issueDate,
          dueDate,
          poNumber,
          totalQuantity,
          subtotal,
          totalAmount,
          taxPercent,
          notes,
          company_id,
          client_id,
          items,
        },
      });

      const invoice: Invoice = await this.invoiceService.create({
        status,
        timesheet_id,
        issueDate,
        dueDate,
        poNumber,
        totalQuantity,
        subtotal,
        totalAmount,
        taxPercent,
        taxAmount,
        notes,
        company_id,
        client_id,
        discount,
        shipping,
        needProject,
        items,
      });

      return invoice;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: true,
      });
    }
  }

  @Mutation((returns) => Invoice)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin, RoleEnum.CompanyAdmin), checkCompanyAccess)
  async InvoiceUpdate(@Arg('input') args: InvoiceUpdateInput, @Ctx() ctx: any): Promise<Invoice> {
    const operation = 'InvoiceUpdate';

    try {
      const id = args.id;
      const status = args.status;
      const issueDate = args.issueDate;
      const dueDate = args.dueDate;
      const poNumber = args.poNumber;
      const totalQuantity = args.totalQuantity;
      const subtotal = args.subtotal;
      const totalAmount = args.totalAmount;
      const taxPercent = args.taxPercent ?? 0;
      const taxAmount = args.taxAmount ?? 0;
      const notes = args.notes;
      const discount = args.discount;
      const shipping = args.shipping;
      const needProject = args.needProject;
      const items = args.items;

      const schema = InvoiceValidation.update();
      await this.joiService.validate({
        schema,
        input: {
          id,
          status,
          issueDate,
          dueDate,
          poNumber,
          totalQuantity,
          subtotal,
          totalAmount,
          taxPercent,
          notes,
          items,
        },
      });

      let invoice: Invoice = await this.invoiceService.update({
        id,
        status,
        issueDate,
        dueDate,
        poNumber,
        totalQuantity,
        subtotal,
        totalAmount,
        taxPercent,
        taxAmount,
        notes,
        discount,
        shipping,
        needProject,
        items,
      });

      return invoice;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @Mutation((returns) => Invoice)
  @UseMiddleware(authenticate, authorize(RoleEnum.SuperAdmin))
  async InvoiceDelete(@Arg('input') args: DeleteInput, @Ctx() ctx: any): Promise<Invoice> {
    const operation = 'InvoiceDelete';

    try {
      const id = args.id;

      let invoice: Invoice = await this.invoiceService.remove({ id });

      return invoice;
    } catch (err) {
      this.errorService.throwError({
        err,
        name: this.name,
        operation,
        logError: false,
      });
    }
  }

  @FieldResolver()
  client(@Root() root: Invoice, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.clientByIdLoader.load(root.client_id);
  }

  @FieldResolver()
  company(@Root() root: Invoice, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.companyByIdLoader.load(root.company_id);
  }

  @FieldResolver()
  items(@Root() root: Invoice, @Ctx() ctx: IGraphqlContext) {
    return ctx.loaders.itemsByInvoiceIdLoader.load(root.id);
  }

  @FieldResolver()
  discountAmount(@Root() root: Invoice) {
    if (root.discount && root.subtotal) {
      const discountAmount = 0.01 * root.discount * root.subtotal;
      return round(discountAmount, 2);
    }
  }
}
