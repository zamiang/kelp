export type formattedEmail = {
  id: string;
  snippet: string;
  threadId: string;
  date: Date;
  subject: string;
  labelIds: string[];
  isImportant: boolean;
  from: string | null;
  to: (string | null)[];
};

const regex = new RegExp(/<(.*?)>/, 'i');
const formatEmailFromGmail = (email: string) => {
  const formattedValue = regex.exec(email);
  return formattedValue ? formattedValue[1] : null;
};

export const fetchEmails = async (
  emails: gapi.client.gmail.Message[],
): Promise<formattedEmail[]> => {
  if (emails.length < 1) {
    return [];
  }
  const emailPromises = emails.map((email) =>
    gapi.client.gmail.users.messages.get({
      id: email.id!,
      userId: 'me',
      format: 'metadata',
      metadataHeaders: ['Subject', 'From', 'To'] as any, // Google's types are incorrect - needs to be an array of strings
    }),
  );
  const emailResponses = await Promise.all(emailPromises);

  return emailResponses
    .filter((email) => email.result.labelIds && !email.result.labelIds.includes('CATEGORY_UPDATES')) // Filter out google calendar / google doc notification emails
    .map((email) => {
      const formattedEmail: formattedEmail = {
        id: email.result.id!,
        snippet: email.result.snippet!,
        threadId: email.result.threadId!,
        labelIds: email.result.labelIds!,
        date: new Date(Number(email.result.internalDate!)),
        isImportant: email.result.labelIds!.includes('IMPORTANT'),
        subject: '',
        from: null,
        to: [],
      };
      email.result.payload!.headers!.forEach((header) => {
        switch (header.name) {
          case 'Subject':
            formattedEmail.subject = header.value!;
            break;
          case 'From':
            formattedEmail.from = formatEmailFromGmail(header.value!);
            break;
          case 'To':
            formattedEmail.to.push(formatEmailFromGmail(header.value!));
        }
      });
      return formattedEmail;
    });
};

export const fetchCurrentUserEmailsForEmailAddresses = async (
  _abortSignal: any,
  emailAddresses?: string,
) => {
  console.log(emailAddresses, '<<<<<<<<<<<<<<<<<<<<');
  const addresses = emailAddresses?.split('|');
  if (!addresses || addresses.length < 1) {
    return;
  }
  const formattedEmails = addresses.map((email) => `from:${email}`);
  const response = await gapi.client.gmail.users.messages.list({
    userId: 'me',
    q: `newer_than:30d ${formattedEmails.join(' OR ')}`,
  });

  return response.result.messages!;
};
