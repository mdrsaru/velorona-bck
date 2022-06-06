import moment from 'moment';
import PDFDocument from 'pdfkit';
import { injectable } from 'inversify';
import fs from 'fs';
import blobStream from 'blob-stream';

import Invoice from '../entities/invoice.entity';
import InvoiceItem from '../entities/invoice-item.entity';

export default class PDFService {
  private name = 'PDFService';

  constructor() {}

  generateInvoicePdf(invoice: Invoice): Promise<any> {
    type TableArgs = {
      doc: any;
      y: number;
      item: string;
      description: string;
      quantity: number | string;
      price: number | string;
      amount: number | string;
    };

    return new Promise((resolve, reject) => {
      try {
        let doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = doc.pipe(blobStream());

        const generateTableRow = (args: TableArgs) => {
          args.doc
            .fontSize(10)
            .text(args.item, 50, args.y)
            .fillColor('#808080')
            .fontSize(9)
            .text(args.description, 50, args.y + 12)
            .fillColor('#444444')
            .fontSize(10)
            .text(args.quantity, 280, args.y, { width: 90, align: 'right' })
            .text(args.price, 370, args.y, { width: 90, align: 'right' })
            .text(args.amount, 0, args.y, { align: 'right' });
        };

        const clientAddress = invoice?.client?.address;
        const address = [];
        if (clientAddress?.streetAddress) {
          address.push(clientAddress.streetAddress);
        }
        if (clientAddress?.city) {
          address.push(clientAddress.city);
        }
        if (clientAddress?.state) {
          address.push(clientAddress.state);
        }

        doc
          //.image('logo.png', 50, 45, { width: 50 })
          .fillColor('#444444')
          .fontSize(20)
          .text(invoice?.client?.name ?? '', 50, 67)
          .fontSize(25)
          .text('Invoice', 200, 60, { align: 'right' })
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(invoice?.client?.name ?? '', 200, 85, { align: 'right' })
          .font('Helvetica')
          .text(address.join(', '), 200, 100, { align: 'right' })
          .moveDown();

        // Invoice information
        this.generateHr(doc, 185);

        const customerInformationTop = 200;

        doc
          .fontSize(10)
          .text('Bill to', 50, customerInformationTop)
          .font('Helvetica-Bold')
          .text(invoice?.client?.name, 50, customerInformationTop + 15)
          .font('Helvetica-Bold')
          .text('Invoice Number: ', 380, customerInformationTop)
          .font('Helvetica')
          .text(invoice.invoiceNumber + '', 480, customerInformationTop)
          .font('Helvetica-Bold')
          .text('Invoice Date: ', 380, customerInformationTop + 15)
          .font('Helvetica')
          .text(moment(invoice.issueDate).format('YYYY-MM-DD'), 480, customerInformationTop + 15)
          .font('Helvetica-Bold')
          .text('Payment Due: ', 380, customerInformationTop + 30)
          .font('Helvetica')
          .text(moment(invoice.dueDate).format('YYYY-MM-DD'), 480, customerInformationTop + 30)
          .font('Helvetica-Bold')
          .text('Amount Due: ', 380, customerInformationTop + 45)
          .text(`$ ${invoice.totalAmount}`, 480, customerInformationTop + 45)
          .moveDown();

        this.generateHr(doc, 270);

        // Generate table
        const invoiceTableTop = 330;

        doc.font('Helvetica-Bold');

        generateTableRow({
          doc,
          y: invoiceTableTop,
          item: 'Item',
          description: '',
          quantity: 'Quantity',
          price: 'Price',
          amount: 'Amount',
        });

        this.generateHr(doc, invoiceTableTop + 20);
        doc.font('Helvetica');

        let i;
        const items = invoice?.items ?? [];
        for (i = 0; i < items.length; i++) {
          const position = invoiceTableTop + (i + 1) * 35;
          generateTableRow({
            doc,
            y: position,
            item: items[i]?.project?.name,
            description: items[i]?.description,
            quantity: items[i]?.quantity,
            price: items[i]?.rate,
            amount: items[i]?.amount,
          });

          this.generateHr(doc, position + 25);
        }

        const subtotalPosition = invoiceTableTop + (i + 1) * 35;

        generateTableRow({
          doc,
          y: subtotalPosition,
          item: '',
          description: '',
          quantity: '',
          price: 'Subtotal',
          amount: invoice.subtotal,
        });

        const taxPosition = subtotalPosition + 20;

        generateTableRow({
          doc,
          y: taxPosition,
          item: '',
          description: '',
          quantity: '',
          price: 'Tax amount',
          amount: invoice?.taxAmount ?? 0,
        });

        const paidToDatePosition = taxPosition + 20;
        generateTableRow({
          doc,
          y: paidToDatePosition,
          item: '',
          description: '',
          quantity: '',
          price: 'Total',
          amount: invoice?.totalAmount ?? 0,
        });

        let buffers: any = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          let pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  generateHr(doc: any, y: number) {
    doc.strokeColor('#aaaaaa').lineWidth(0.7).moveTo(50, y).lineTo(550, y).stroke();
  }
}
