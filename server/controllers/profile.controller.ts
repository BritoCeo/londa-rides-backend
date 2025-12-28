import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';

// Profile Management APIs

// PUT /api/v1/update-profile - Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { user_id, driver_id, profile_data } = req.body;

    if (!profile_data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: profile_data'
      });
    }

    if (!user_id && !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: user_id or driver_id'
      });
    }

    // Add updated timestamp
    const updateData = {
      ...profile_data,
      updated_at: new Date()
    };

    let result;
    if (driver_id) {
      result = await FirestoreService.updateDriver(driver_id, updateData);
    } else if (user_id) {
      result = await FirestoreService.updateUser(user_id, updateData);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// POST /api/v1/upload-document - Upload driver documents
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { driver_id, document_type, document_data, file_url } = req.body;

    if (!driver_id || !document_type || (!document_data && !file_url)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: driver_id, document_type, and either document_data or file_url'
      });
    }

    // Validate document type
    const validDocumentTypes = ['license', 'insurance', 'registration', 'background_check', 'vehicle_inspection'];
    if (!validDocumentTypes.includes(document_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Must be one of: ' + validDocumentTypes.join(', ')
      });
    }

    const documentRecord = {
      driver_id,
      document_type,
      document_data: document_data || null,
      file_url: file_url || null,
      status: 'pending',
      uploaded_at: new Date(),
      created_at: new Date()
    };

    const document = await FirestoreService.createDocument(documentRecord);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error: any) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// GET /api/v1/documents - Get uploaded documents
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { driver_id, document_type, status } = req.query;

    if (!driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: driver_id'
      });
    }

    const documents = await FirestoreService.getDocumentsByDriverId(
      driver_id as string,
      document_type as string,
      status as string
    );

    res.status(200).json({
      success: true,
      message: 'Documents retrieved successfully',
      data: { documents, count: documents.length }
    });
  } catch (error: any) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents',
      error: error.message
    });
  }
};
