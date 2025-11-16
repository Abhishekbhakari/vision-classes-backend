import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { contactService } from './contact.service.js';
import { HttpCode } from '../../constants/httpCode.js';

class ContactController {
  public contactUs = asyncHandler(async (req: Request, res: Response) => {
    await contactService.sendContactEmail(req.body);

    res.status(HttpCode.OK).json({
      success: true,
      message: 'Your message has been sent successfully',
    });
  });
}

export const contactController = new ContactController();