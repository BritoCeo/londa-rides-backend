import { Request, Response, NextFunction } from 'express';

// Pagination interface
export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Extend Request interface to include pagination
declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationOptions;
    }
  }
}

// Pagination middleware
export const paginationMiddleware = (defaultLimit: number = 10, maxLimit: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string) || defaultLimit));
    const offset = (page - 1) * limit;
    
    req.pagination = {
      page,
      limit,
      offset,
      totalPages: 0, // Will be calculated after query
      hasNext: false, // Will be calculated after query
      hasPrev: page > 1
    };
    
    next();
  };
};

// Pagination response helper
export const paginatedResponse = (
  res: Response,
  data: any[],
  total: number,
  pagination: PaginationOptions,
  message: string = 'Data retrieved successfully'
) => {
  const totalPages = Math.ceil(total / pagination.limit);
  const hasNext = pagination.page < totalPages;
  const hasPrev = pagination.page > 1;
  
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? pagination.page + 1 : null,
      prevPage: hasPrev ? pagination.page - 1 : null
    }
  });
};

// Cursor-based pagination for real-time data
export const cursorPagination = (req: Request, res: Response, next: NextFunction) => {
  const cursor = req.query.cursor as string;
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  
  (req as any).cursorPagination = {
    cursor,
    limit
  };
  
  next();
};

// Cursor pagination response helper
export const cursorPaginatedResponse = (
  res: Response,
  data: any[],
  nextCursor: string | null,
  message: string = 'Data retrieved successfully'
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      nextCursor,
      hasMore: nextCursor !== null
    }
  });
};

// Search and filter middleware
export const searchAndFilter = (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search as string;
  const sortBy = req.query.sortBy as string;
  const sortOrder = req.query.sortOrder as string || 'asc';
  const filters: any = {};
  
  // Extract filters from query parameters
  Object.keys(req.query).forEach(key => {
    if (key !== 'page' && key !== 'limit' && key !== 'search' && key !== 'sortBy' && key !== 'sortOrder') {
      filters[key] = req.query[key];
    }
  });
  
  (req as any).searchAndFilter = {
    search,
    sortBy,
    sortOrder: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc',
    filters
  };
  
  next();
};

// Date range filter middleware
export const dateRangeFilter = (req: Request, res: Response, next: NextFunction) => {
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    (req as any).dateRange = { startDate: start, endDate: end };
  }
  
  next();
};

// Field selection middleware
export const fieldSelection = (req: Request, res: Response, next: NextFunction) => {
  const fields = req.query.fields as string;
  
  if (fields) {
    const selectedFields = fields.split(',').map(field => field.trim());
    (req as any).selectedFields = selectedFields;
  }
  
  next();
};

// Response transformation middleware
export const transformResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(body: any) {
    // Apply field selection if specified
    if ((req as any).selectedFields && Array.isArray(body.data)) {
      body.data = body.data.map((item: any) => {
        const transformed: any = {};
        (req as any).selectedFields.forEach((field: string) => {
          if (item[field] !== undefined) {
            transformed[field] = item[field];
          }
        });
        return transformed;
      });
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};
