import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
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
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const rootUploadsDir = path.resolve(process.cwd(), 'uploads');
if (rootUploadsDir !== uploadsDir) {
  try {
    fs.mkdirSync(rootUploadsDir, { recursive: true });
  } catch {
    // ignore
  }
}

const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const frontendDistDir = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
const rootFrontendDistDir = path.resolve(process.cwd(), 'frontend', 'dist');
const distPath = fs.existsSync(frontendDistDir)
  ? frontendDistDir
  : (fs.existsSync(rootFrontendDistDir) ? rootFrontendDistDir : null);
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsDir),
    filename: (_req, file, callback) => {
      const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
      callback(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`);
    }
  }),
  limits: { files: 12, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      callback(new Error('Only JPG, PNG, GIF, and WEBP images are allowed'));
      return;
    }

    callback(null, true);
  }
});

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const serveUploads = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
};

app.use('/uploads', serveUploads, express.static(uploadsDir));
if (rootUploadsDir !== uploadsDir) {
  app.use('/uploads', serveUploads, express.static(rootUploadsDir));
}
app.use(hpp()); // Prevent HTTP parameter pollution
app.use(cookieParser());

if (distPath) {
  app.use(express.static(distPath));
}

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  if (distPath) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  res.json({
    success: true,
    message: 'Smart Room Finder API is running'
  });
});

app.post('/api/owner/rooms/upload-images', requireAuth, upload.array('images', 12), asyncHandler(async (req: Request, res: Response) => {
  const files = Array.isArray((req as Request & { files?: Express.Multer.File[] }).files)
    ? (req as Request & { files?: Express.Multer.File[] }).files ?? []
    : [];

  const baseUrl = `${req.protocol}://${req.get('host') ?? 'localhost:5000'}`;
  const imageUrls = files.map((file) => `${baseUrl}/uploads/${file.filename}`);

  return ok(res, { images: imageUrls });
}));

// Health check
app.get('/health', asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, { status: 'ok', timestamp: new Date() });
}));

// ============= PUBLIC & AUTH ROUTES =============
const authRouter = express.Router();
authRouter.post('/register', authRateLimit, validate(registerSchema), asyncHandler(authController.register));
authRouter.post('/login', authRateLimit, validate(loginSchema), asyncHandler(authController.login));
authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/send-otp', otpRateLimit, validate(sendOtpSchema), asyncHandler(authController.sendOtp));
authRouter.post('/verify-otp', otpRateLimit, validate(verifyOtpSchema), asyncHandler(authController.verifyOtp));
authRouter.post('/forgot-password', otpRateLimit, validate(verifyOtpSchema), asyncHandler(authController.forgotPassword));
authRouter.post('/reset-password', authRateLimit, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
authRouter.post('/logout', requireAuth, asyncHandler(authController.logout));

// Mount under both /api/auth and /auth
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

// Direct aliases for convenience (/api/login, /login, /api/register, /register)
app.post('/api/register', authRateLimit, validate(registerSchema), asyncHandler(authController.register));
app.post('/api/login', authRateLimit, validate(loginSchema), asyncHandler(authController.login));
app.post('/register', authRateLimit, validate(registerSchema), asyncHandler(authController.register));
app.post('/login', authRateLimit, validate(loginSchema), asyncHandler(authController.login));
app.post('/api/logout', requireAuth, asyncHandler(authController.logout));
app.post('/logout', requireAuth, asyncHandler(authController.logout));

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

// ============= SPA ROUTING & FALLBACK =============
if (distPath) {
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/auth')) {
      return next();
    }
    return res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If frontend is not built, redirect browser navigations for /login and /register to frontend dev server
  app.get(['/login', '/register'], (req: Request, res: Response) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}${req.path}`);
  });
}

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
