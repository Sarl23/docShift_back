const { Router } = require('express');
const {
    getAllCompanies,
    getCompanyById,
    getCompanyByCode,
    postCreateCompany,
    putCompanyById,
    deleteCompany
} = require('../controllers/companyController.js');

const router = Router();

router.get('/companies', getAllCompanies);
router.get('/company_id/:id', getCompanyById);
router.get('/company_code/:code', getCompanyByCode);
router.delete('/company/:id', deleteCompany); 
router.post('/company', postCreateCompany);
router.put('/company/:id', putCompanyById);

module.exports = router;