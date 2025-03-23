import { HttpStatus, Injectable } from '@nestjs/common';
import { ESPS } from 'src/app/utils/constants';
import {
  SendgridEmailProps,
  SendgridFollowUpEmailProps,
  SendGridService,
} from './sendgrid/sendgrid.service';
import { Contact, Sender } from '@prisma/client';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { ERROR_MSG } from 'src/app/utils/messages';
import { CryptoService } from '../crypto/crypto.service';

export interface EmailProps {
  subject: string;
  body: string;
  contact: Contact;
  referenceId: string;
}

export interface SendEmailProps {
  emails: EmailProps[];
  sender: Sender;
}

export interface SendFollowUpEmailProps extends EmailProps {
  messageId: string;
  sender: Sender;
}

@Injectable()
export class ESPService {
  constructor(
    private readonly sendGridService: SendGridService,
    private readonly cryptoService: CryptoService,
  ) {}

  async sendEmails(payload: SendEmailProps): Promise<void> {
    const { emails, sender } = payload;

    const apiKey = this.cryptoService.decrypt(sender.apiKey);

    switch (sender.esp) {
      case ESPS.SENDGRID:
        const mailOptions: SendgridEmailProps[] = emails.map((e) => ({
          to: e.contact.email,
          subject: e.subject,
          body: e.body,
          senderName: sender.name,
          senderEmail: sender.email,
          referenceId: e.referenceId,
          senderId: sender.id,
        }));

        await this.sendGridService.sendBulkEmails(mailOptions, apiKey);
        break;

      default:
        throw new CustomHttpException(
          HttpStatus.CONFLICT,
          ERROR_MSG.NOT_VALID_ESP,
        );
    }
  }

  async sendFollowUpEmail(payload: SendFollowUpEmailProps): Promise<void> {
    const { messageId, contact, sender } = payload;

    const apiKey = this.cryptoService.decrypt(sender.apiKey);

    switch (sender.esp) {
      case ESPS.SENDGRID:
        const mailOptions: SendgridFollowUpEmailProps = {
          to: contact.email,
          subject: payload.subject,
          body: payload.body,
          senderId: sender.id,
          senderName: sender.name,
          senderEmail: sender.email,
          referenceId: payload.referenceId,
          apiKey,
          messageId,
        };

        await this.sendGridService.sendFollowUpEmail(mailOptions);
        break;

      default:
        throw new CustomHttpException(
          HttpStatus.CONFLICT,
          ERROR_MSG.NOT_VALID_ESP,
        );
    }
  }
}
