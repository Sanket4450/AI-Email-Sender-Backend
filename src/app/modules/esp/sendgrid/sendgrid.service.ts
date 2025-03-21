import { Injectable } from '@nestjs/common';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { EMAIL_SEND_TYPES } from 'src/app/utils/constants';

export interface SendEmailProps {
  to: string | string[];
  subject: string;
  body: string;
  sender_name: string;
  sender_email: string;
  reference_id: number;
}

export interface SendEmailFullProps extends SendEmailProps {
  api_key: string;
}

export interface SendFollowUpEmailProps extends SendEmailProps {
  message_id: string;
  api_key: string;
}

@Injectable()
export class SendGridService {
  constructor() {}

  async sendEmail(props: SendEmailFullProps): Promise<void> {
    const {
      to,
      subject,
      body,
      sender_name,
      sender_email,
      reference_id,
      api_key,
    } = props;
    sgMail.setApiKey(api_key);

    const mailOptions: MailDataRequired = {
      from: { email: sender_email, name: sender_name },
      to,
      subject,
      html: body,
      customArgs: { reference_id, type: EMAIL_SEND_TYPES.EMAIL },
    };

    try {
      await sgMail.send(mailOptions);
    } catch (error) {
      console.error(`Error sending mail: ${error}`);
    }
  }

  async sendBulkEmails(
    payload: SendEmailProps[],
    api_key: string,
  ): Promise<void> {
    sgMail.setApiKey(api_key);

    const mailOptions: MailDataRequired[] = payload.map((p) => ({
      from: { email: p.sender_email, name: p.sender_name },
      to: p.to,
      subject: p.subject,
      html: p.body,
      customArgs: {
        reference_id: p.reference_id,
        type: EMAIL_SEND_TYPES.EMAIL,
      },
    }));

    try {
      await sgMail.send(mailOptions);
    } catch (error) {
      console.error(`Error sending mail: ${error}`);
    }
  }

  async sendFollowEmail(props: SendFollowUpEmailProps): Promise<void> {
    const {
      to,
      subject,
      body,
      sender_name,
      sender_email,
      reference_id,
      message_id,
      api_key,
    } = props;

    sgMail.setApiKey(api_key);

    const mailOptions: MailDataRequired = {
      from: { email: sender_email, name: sender_name },
      to,
      subject,
      html: body,
      headers: {
        'In-Reply-To': message_id,
        References: message_id,
      },
      customArgs: {
        reference_id,
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
