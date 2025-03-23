import { Injectable } from '@nestjs/common';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { EMAIL_TYPES } from 'src/app/utils/constants';

export interface SendgridEmailProps {
  to: string | string[];
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
  referenceId: string;
  senderId: string;
}

export interface SendEmailFullProps extends SendgridEmailProps {
  apiKey: string;
}

export interface SendgridFollowUpEmailProps extends SendgridEmailProps {
  messageId: string;
  apiKey: string;
}

@Injectable()
export class SendGridService {
  constructor() {}

  async sendEmail(props: SendEmailFullProps): Promise<void> {
    const {
      to,
      subject,
      body,
      senderName,
      senderEmail,
      senderId,
      referenceId,
      apiKey,
    } = props;
    sgMail.setApiKey(apiKey);

    const mailOptions: MailDataRequired = {
      from: { email: senderEmail, name: senderName },
      to,
      subject,
      html: body,
      customArgs: {
        type: EMAIL_TYPES.EMAIL,
        senderId,
        referenceId,
      },
    };

    try {
      await sgMail.send(mailOptions);
    } catch (error) {
      console.error(`Error sending mail: ${error}`);
    }
  }

  async sendBulkEmails(
    payload: SendgridEmailProps[],
    apiKey: string,
  ): Promise<void> {
    sgMail.setApiKey(apiKey);

    const mailOptions: MailDataRequired[] = payload.map((p) => ({
      from: { email: p.senderEmail, name: p.senderName },
      to: p.to,
      subject: p.subject,
      html: p.body,
      customArgs: {
        type: EMAIL_TYPES.EMAIL,
        senderId: p.senderId,
        referenceId: p.referenceId,
      },
    }));

    try {
      await sgMail.send(mailOptions);
    } catch (error) {
      console.error(`Error sending mail: ${error}`);
    }
  }

  async sendFollowUpEmail(props: SendgridFollowUpEmailProps): Promise<void> {
    const {
      to,
      subject,
      body,
      senderName,
      senderEmail,
      senderId,
      referenceId,
      messageId,
      apiKey,
    } = props;

    sgMail.setApiKey(apiKey);

    const mailOptions: MailDataRequired = {
      from: { email: senderEmail, name: senderName },
      to,
      subject,
      html: body,
      headers: {
        'In-Reply-To': messageId,
        References: messageId,
      },
      customArgs: {
        type: EMAIL_TYPES.FOLLOW_UP,
        senderId,
        referenceId,
      },
    };

    try {
      await sgMail.send(mailOptions);
    } catch (error) {
      console.error(`Error sending follow-up mail: ${error}`);
    }
  }
}
