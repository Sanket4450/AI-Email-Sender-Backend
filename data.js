const headers = {
  host: '9645-42-108-197-3.ngrok-free.app',
  'user-agent': 'SendGrid Event API',
  'content-length': '838',
  'accept-encoding': 'gzip',
  'content-type': 'application/json;charset=utf-8',
  'x-forwarded-for': '167.89.117.78',
  'x-forwarded-host': '9645-42-108-197-3.ngrok-free.app',
  'x-forwarded-proto': 'https',
};

const body = [
  {
    email: 'www.talaviyasanket50@gmail.com',
    event: 'delivered',
    ip: '149.72.123.24',
    referenceId: 'cm8l3vy6f0000up8clzxmms1q',
    response:
      '250 2.0.0 OK  1742702190 6a1803df08f44-6eb3f05d04csi50799666d6.500 - gsmtp',
    sg_event_id: 'ZGVsaXZlcmVkLTAtNTEzMzU1MjAtZFN0c3hDeUxSTEt6S1NIMHpvOWV4US0w',
    sg_message_id:
      'dStsxCyLRLKzKSH0zo9exQ.recvd-786d47b7ff-42mlq-1-67DF866E-B.0',
    'smtp-id': '<dStsxCyLRLKzKSH0zo9exQ@geopod-ismtpd-16>',
    timestamp: 1742702190,
    tls: 1,
    type: 'email',
  },
  {
    email: 'www.talaviyasanket50@gmail.com',
    event: 'processed',
    referenceId: 'cm8l3vy6f0000up8clzxmms1q',
    send_at: 0,
    sg_event_id: 'cHJvY2Vzc2VkLTUxMzM1NTIwLWRTdHN4Q3lMUkxLektTSDB6bzlleFEtMA',
    sg_message_id:
      'dStsxCyLRLKzKSH0zo9exQ.recvd-786d47b7ff-42mlq-1-67DF866E-B.0',
    'smtp-id': '<dStsxCyLRLKzKSH0zo9exQ@geopod-ismtpd-16>',
    timestamp: 1742702190,
    type: 'email',
  },
];
