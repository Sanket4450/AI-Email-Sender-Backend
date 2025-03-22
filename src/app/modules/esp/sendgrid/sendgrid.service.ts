import { Injectable } from '@nestjs/common';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { EMAIL_SEND_TYPES } from 'src/app/utils/constants';

export interface SendgridEmailProps {
  to: string | string[];
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
  referenceId: number;
}

export interface SendEmailFullProps extends SendgridEmailProps {
  apiKey: string;
}

export interface SendgridFollowUpEmailProps extends SendgridEmailProps {
  message_id: string;
  apiKey: string;
}

@Injectable()
export class SendGridService {
  constructor() {}

  async sendEmail(props: SendEmailFullProps): Promise<void> {
    const { to, subject, body, senderName, senderEmail, referenceId, apiKey } =
      props;
    sgMail.setApiKey(apiKey);

    const mailOptions: MailDataRequired = {
      from: { email: senderEmail, name: senderName },
      to,
      subject,
      html: body,
      customArgs: { referenceId, type: EMAIL_SEND_TYPES.EMAIL },
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
        referenceId: p.referenceId,
        type: EMAIL_SEND_TYPES.EMAIL,
      },
    }));

    try {
      await sgMail.send(mailOptions);
    } catch (error) {
      console.error(`Error sending mail: ${error}`);
    }
  }

  async sendFollowEmail(props: SendgridFollowUpEmailProps): Promise<void> {
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
