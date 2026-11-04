import { Router } from 'express';
import { projectController, toggleProjectFeatured } from '../controllers/projectController.js';
import {
  addProgress, addProjectMaterial, assignEmployee, deleteProjectMaterial, listFiles, listImages,
  listProgress, listProjectEmployees, listProjectMaterials, unassignEmployee, updateProjectMaterial,
  uploadFile, uploadImages,
} from '../controllers/projectRelationController.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { validateProgress, validateProject } from '../validators/resourceValidators.js';
import { ROLES } from '../utils/permissions.js';

const router = Router();
const managers = authorizeRoles(ROLES.ADMIN, ROLES.PROJECT_MANAGER);
const allStaff = authorizeRoles(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TECHNICAL_STAFF);

router.get('/', allStaff, projectController.list);
router.post('/', managers, validate(validateProject), projectController.create);

router.get('/:id/employees', allStaff, listProjectEmployees);
router.post('/:id/employees', managers, assignEmployee);
router.delete('/:projectId/employees/:employeeId', managers, unassignEmployee);

router.get('/:id/materials', allStaff, listProjectMaterials);
router.post('/:id/materials', managers, addProjectMaterial);
router.put('/:projectId/materials/:id', managers, updateProjectMaterial);
router.delete('/:projectId/materials/:id', managers, deleteProjectMaterial);

router.get('/:id/progress', allStaff, listProgress);
router.post('/:id/progress', allStaff, validate(validateProgress), addProgress);

router.get('/:id/files', allStaff, listFiles);
router.post('/:id/files', allStaff, upload.single('file'), uploadFile);
router.get('/:id/images', allStaff, listImages);
router.post('/:id/images', allStaff, upload.array('images', 10), uploadImages);

router.get('/:id', allStaff, projectController.get);
router.put('/:id', managers, validate(validateProject), projectController.update);
router.patch('/:id/featured', managers, toggleProjectFeatured);
router.delete('/:id', managers, projectController.remove);

export default router;
