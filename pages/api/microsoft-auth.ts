import { Request, Response } from 'express';

export default (_req: Request, res: Response) => {
  const json = {
    associatedApplications: [
      {
        applicationId: '64c123a2-2c05-4bc0-8be3-76f29fe93af4',
      },
    ],
  };

  res.json(json);
  res.end();
};
