const {Router} = require('express');
const {
    getAllGlobalUsers,
    getGlobalUserById,
    postCreateGlobalUser,
    putUpdateGlobalUser,
    deleteGlobalUser,
    createGlobalUserWithValidation
} = require('../controllers/globalUsersController.js');

const router = Router();

router.get('/globalUsers', getAllGlobalUsers);
router.get('/globalUsers/:id', getGlobalUserById);
router.post('/globalUsers', postCreateGlobalUser);
router.post('/globalUsersWithValidation', createGlobalUserWithValidation);
router.put('/globalUsers/:id', putUpdateGlobalUser);
router.delete('/globalUsers/:id', deleteGlobalUser);

module.exports = router;