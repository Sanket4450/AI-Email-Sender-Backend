import { HttpStatus, Injectable } from '@nestjs/common';
import { EMAIL_SEND_TYPES, ESPS } from 'src/app/utils/constants';
import {
  SendgridEmailProps,
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
  referenceId: number;
}

export interface SendEmailProps {
  emails: EmailProps[];
  sender: Sender;
}

export interface SendFollowUpEmailProps extends SendEmailProps {
  message_id: string;
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

  async sendFollowEmail(props: SendFollowUpEmailProps): Promise<void> {
    const {
      to,
      subject,
      body,
      senderName,
      senderEmail,
      referenceId,
      message_id,
      apiKey,
    } = props;

    sgMail.setApiKey(apiKey);

    const mailOptions: MailDataRequired = {
      from: { email: senderEmail, name: senderName },
      to,
      subject,
      html: body,
      headers: {
        'In-Reply-To': message_id,
        References: message_id,
      },
      customArgs: {
        referenceId,
        type: EMAIL_SEND_TYPES.FOLLOW_UP,
      },
    };

    try {
      await sgMail.send(mailOptions);
    } catch (error) {
      console.error(`Error sending follow-up mail: ${error}`);
    }
  }
}
