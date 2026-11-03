import { Router } from 'express';
import { createCrudController } from '../controllers/crudController.js';
import { repositories } from '../models/repositories.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { validateGeneric } from '../validators/resourceValidators.js';
import { ROLES } from '../utils/permissions.js';

const managerRoles = authorizeRoles(ROLES.ADMIN, ROLES.PROJECT_MANAGER);

export function createResourceRouter(resource, entityName) {
  const router = Router();
  const controller = createCrudController(repositories[resource], { entityName, resourceKey: resource });
  router.use(managerRoles);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', validate(validateGeneric(resource)), controller.create);
  router.put('/:id', validate(validateGeneric(resource)), controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
