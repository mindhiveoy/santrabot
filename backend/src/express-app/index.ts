import cors from 'cors';
import express from 'express';
import csv from './csv';
import dashboard from './dashboard-app';
import graphqlApi from './graphql';
import theme from './theme-loader';

const app = express();

const router = express.Router();

// TODO allow calls from listed origins
router.use(cors({ origin: true }));
// router.use(express.static('dist'));
router.use('/graphql', graphqlApi);
router.use('/csv/:organizationId/:sessionId', csv);
router.use('/theme/:organizationId/:bot', theme);

router.get('*', dashboard);
app.use(router);

export default app;