import { Router } from 'express';
import {
  updateProfile,
  uploadDocument,
  getDocuments
} from '../controllers/profile.controller';

const router = Router();

// Profile Management APIs
router.put('/update-profile', updateProfile);
router.post('/upload-document', uploadDocument);
router.get('/documents', getDocuments);

export default router;
