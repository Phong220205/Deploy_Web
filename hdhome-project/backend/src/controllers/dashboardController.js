import { pool } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/permissions.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Gom số liệu tổng quan cho dashboard.
 * Tách riêng phần tính toán để có thể cache mà không phụ thuộc response.
 */
export async function buildSummary(user) {
  const technical = user.role_name === ROLES.TECHNICAL_STAFF;
  const scope = technical ? ' WHERE EXISTS (SELECT 1 FROM project_employees pe WHERE pe.project_id = p.project_id AND pe.employee_id = ?)' : '';
  const params = technical ? [user.employee_id || 0] : [];

  const [[projectSummary], [customerSummary], [employeeSummary], [contractSummary], [byStatus], [recentProjects]] = await Promise.all([
    pool.execute(`SELECT COUNT(*) totalProjects,
      SUM(p.status = 'IN_PROGRESS') inProgressProjects,
      SUM(p.status = 'COMPLETED') completedProjects,
      COALESCE(ROUND(AVG(p.progress)), 0) averageProgress FROM projects p${scope}`, params),
    pool.execute('SELECT COUNT(*) totalCustomers FROM customers'),
    pool.execute('SELECT COUNT(*) totalEmployees FROM employees WHERE status = ?', ['ACTIVE']),
    pool.execute('SELECT COUNT(*) totalContracts FROM contracts'),
    pool.execute(`SELECT p.status, COUNT(*) total FROM projects p${scope} GROUP BY p.status ORDER BY total DESC`, params),
    pool.execute(`SELECT p.project_id, p.project_code, p.project_name, p.status, p.progress, p.updated_at
      FROM projects p${scope} ORDER BY p.updated_at DESC LIMIT 5`, params),
  ]);

  return {
    ...projectSummary[0], ...customerSummary[0], ...employeeSummary[0], ...contractSummary[0],
    projectsByStatus: byStatus,
    recentProjects,
  };
}

export const getSummary = asyncHandler(async (req, res) => {
  sendSuccess(res, await buildSummary(req.user));
});
