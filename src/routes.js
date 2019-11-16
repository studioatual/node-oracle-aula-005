import { Router } from 'express';
import HomeController from './app/controllers/HomeController';
import UserController from './app/controllers/UserController';
import UserValidation from './app/validation/UserValidation';

const routes = new Router();

routes.get('/', HomeController.index);

routes.get('/users', UserController.index);
routes.post('/users', UserValidation.all(), UserController.store);
routes.get('/users/:id', UserValidation.isExist, UserController.show);
routes.put('/users/:id', UserValidation.all(), UserController.update);
routes.delete('/users/:id', UserValidation.isExist, UserController.destroy);

export default routes;
