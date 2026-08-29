import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { generalRateLimit, authRateLimit, otpRateLimit } from './middleware/rateLimits';
import { requireAuth, allowRoles } from './middleware/auth';
import { validate } from './middleware/validate';
import { asyncHandler } from './utils/asyncHandler';
import { ok } from './utils/apiResponse';

// Import controllers
import * as authController from './controllers/authController';
import * as roomController from './controllers/roomController';
import * as ownerController from './controllers/ownerController';
import * as adminController from './controllers/adminController';
import * as interactionController from './controllers/interactionController';

// Import validators
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  createRoomSchema,
  updateRoomSchema,
  enquirySchema,
  ownerProfileSchema,
  reportStatusSchema,
} from './validators/schemas';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(hpp()); // Prevent HTTP parameter pollution
app.use(cookieParser());

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Smart Room Finder API is running'
  });
});

// Health check
app.get('/health', asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, { status: 'ok', timestamp: new Date() });
}));

// ============= PUBLIC ROUTES =============
app.post('/api/auth/register', authRateLimit, validate(registerSchema), asyncHandler(authController.register));
app.post('/api/auth/login', authRateLimit, validate(loginSchema), asyncHandler(authController.login));
app.post('/api/auth/send-otp', otpRateLimit, validate(sendOtpSchema), asyncHandler(authController.sendOtp));
app.post('/api/auth/verify-otp', otpRateLimit, validate(verifyOtpSchema), asyncHandler(authController.verifyOtp));
app.post('/api/auth/reset-password', authRateLimit, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));

// ============= PROTECTED ROUTES (All authenticated users) =============
app.use('/api/auth/logout', requireAuth);
app.post('/api/auth/logout', asyncHandler(authController.logout));

// Room search and discovery (public)
app.get('/api/rooms/search', asyncHandler(roomController.listRooms));
app.get('/api/rooms/:id', asyncHandler(roomController.getRoom));

// User interactions (authenticated)
app.use('/api/favourites', requireAuth);
app.get('/api/favourites', asyncHandler(interactionController.listFavourites));
app.post('/api/favourites/:roomId', asyncHandler(interactionController.addFavourite));
app.delete('/api/favourites/:roomId', asyncHandler(interactionController.removeFavourite));

app.use('/api/enquiries', requireAuth);
app.get('/api/enquiries', asyncHandler(interactionController.listOwnerEnquiries));
app.post('/api/enquiries', validate(enquirySchema), asyncHandler(interactionController.createEnquiry));
app.put('/api/enquiries/:id/status', asyncHandler(interactionController.updateEnquiryStatus));

// ============= OWNER ROUTES (owner role only) =============
app.use('/api/owner', requireAuth, allowRoles('owner'));

app.get('/api/owner/profile', asyncHandler(ownerController.getOwnerProfile));
app.put('/api/owner/profile', validate(ownerProfileSchema), asyncHandler(ownerController.updateOwnerProfile));
app.get('/api/owner/stats', asyncHandler(ownerController.ownerStats));

// Owner room management
app.get('/api/owner/rooms', asyncHandler(roomController.listOwnerRooms));
app.post('/api/owner/rooms', validate(createRoomSchema), asyncHandler(roomController.createRoom));
app.put('/api/owner/rooms/:id', validate(updateRoomSchema), asyncHandler(roomController.updateRoom));
app.post('/api/owner/rooms/:id/deactivate', asyncHandler(roomController.deactivateRoom));
app.get('/api/owner/rooms/:id', asyncHandler(roomController.getRoom));

// ============= ADMIN ROUTES (admin role only) =============
app.use('/api/admin', requireAuth, allowRoles('admin'));

app.get('/api/admin/users', asyncHandler(adminController.listUsers));
app.put('/api/admin/users/:id/suspend', asyncHandler(adminController.suspendUser));

app.get('/api/admin/owners', asyncHandler(adminController.listOwners));
app.put('/api/admin/owners/:id/suspend', asyncHandler(adminController.suspendOwner));

app.get('/api/admin/rooms', asyncHandler(adminController.listAdminRooms));
app.get('/api/admin/rooms/:id', asyncHandler(roomController.getRoom));
app.post('/api/admin/rooms/:id/approve', asyncHandler(adminController.approveRoom));
app.post('/api/admin/rooms/:id/reject', asyncHandler(adminController.rejectRoom));

app.get('/api/admin/reports', asyncHandler(adminController.listReports));
app.put('/api/admin/reports/:id', validate(reportStatusSchema), asyncHandler(adminController.updateReport));

// ============= ERROR HANDLING =============
app.use((req: Request, res: Response) => {
  return res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

app.use(errorHandler);

// ============= SERVER STARTUP =============
async function startServer() {
  try {
    await connectDatabase();
    logger.info('Database connected');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Server startup failed');
    process.exit(1);
  }
}

startServer();

export default app;
