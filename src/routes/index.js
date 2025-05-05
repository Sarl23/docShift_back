const express = require('express');
const userRoutes = require('./usersCompanyRoutes');
const companyRoutes = require('./companyRoutes');
const shiftTypeRoutes = require('./shiftTypeRoutes');
const shiftRoutes =  require('./shiftRoutes');
const globalUsersRoutes = require('./globalUsersRoutes');

const router = express.Router();

router.use(companyRoutes);
router.use(userRoutes);
router.use(shiftTypeRoutes);
router.use(shiftRoutes);
router.use(globalUsersRoutes);


module.exports = router;