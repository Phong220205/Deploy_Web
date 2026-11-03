import multer from 'multer';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Không tìm thấy ${req.method} ${req.originalUrl}.` });
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Có lỗi xảy ra trên máy chủ.';

  if (error instanceof multer.MulterError) {
    statusCode = 422;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Tệp vượt quá dung lượng cho phép.' : error.message;
  }
  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Dữ liệu đã tồn tại, vui lòng kiểm tra trường không được trùng.';
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 409;
    message = 'Không thể xóa vì dữ liệu đang được sử dụng.';
  }
  // Giá trị ENUM không hợp lệ -> lỗi dữ liệu người dùng, không phải lỗi server.
  if (error.code === 'ER_DATA_TOO_LONG' || error.code === 'WARN_DATA_TRUNCATED' || error.code === 'ER_TRUNCATED_WRONG_VALUE') {
    statusCode = 422;
    message = 'Giá trị không hợp lệ. Vui lòng kiểm tra lại các trường trạng thái được chọn.';
  }

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) console.error(error);
  res.status(statusCode).json({ success: false, message, ...(error.details ? { errors: error.details } : {}) });
}
