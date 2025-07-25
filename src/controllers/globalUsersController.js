const { getDb } = require('../firebase.js');


const createGlobalUserWithValidation = async (req, res) => {
    try {
        const { code, email, newUserId } = req.body;

        if (!code || !email || !newUserId) {
            return res.status(400).json({
                success: false,
                errorCode: 'MISSING_PARAMETERS',
            });
        }

        const db = await getDb();
        if (!db) throw new Error('Firestore has not been initialized');

        const companyQuery = await db.collection('companies')
            .where('code', '==', code)
            .limit(1)
            .get();

        if (companyQuery.empty) {
            return res.status(404).json({
                success: false,
                errorCode: 'COMPANY_NOT_FOUND',
            });
        }

        const companyDoc = companyQuery.docs[0];
        const {address, city, companyCode, name} = companyDoc.data();
        const companyId = companyDoc.id;
        const usersQuery = await db.collection('companies')
            .doc(companyId)
            .collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (usersQuery.empty) {
            return res.status(404).json({
                success: false,
                errorCode: 'USER_NOT_FOUND',
            });
        }

        const userData = usersQuery.docs[0].data();
        const userRef = usersQuery.docs[0].ref;

        await db.collection('users').doc(newUserId).set({
            ...userData,
            createdAt: new Date(),
            linkedCompanies: [
                userRef.parent.parent
                    ? db.doc(`companies/${companyId}/users/${usersQuery.docs[0].id}`)
                    : null,
            ].filter(Boolean),
        });

        return res.status(201).json({
            success: true,
            data: { 
                user: {userId: newUserId, ...userData },
                company :{  
                    companyId: companyDoc.id, 
                    address, 
                    city, 
                    companyCode, 
                    name,
                }
            },
            message: 'Usuario creado en users exitosamente',
        });

    } catch (error) {
        console.error('Error en createUserInUsers:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR',
        });
    }
};

const postCreateGlobalUser = async (req, res) => {
    try {
        const { id, ...userData } = req.body;
        if (!id) {
            return res.status(400).json({
                success: false,
                errorCode: 'NO_USER_ID',
            });
        }

        const db = await getDb();
        await db.collection('users').doc(id).set({
            ...userData,
            createdAt: new Date(),
        });

        return res.status(201).json({ success: true, message: 'Usuario creado correctamente.' });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ success: false, errorCode: 'INTERNAL_SERVER_ERROR' });
    }
};

const getAllGlobalUsers = async (req, res) => {
    try {
        const db = await getDb();
        const snapshot = await db.collection('users').get();

        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return res.status(500).json({ success: false, errorCode: 'INTERNAL_SERVER_ERROR_GET_USERS' });
    }
};

const getGlobalUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDb();
        const doc = await db.collection('users').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, errorCode: 'GLOBAL_USER_NOT_FOUND' });
        }
        
        const userData = doc.data();
        const linkedCompaniesPaths = userData.linkedCompanies || [];

        const companyIds = linkedCompaniesPaths.map(path => {
            const segments = path._path?.segments || [];
            return segments[1];
        });

        const companiesData = await Promise.all(
            companyIds.map(async (companyId) => {
                try {
                    const companyDoc = await db.collection('companies').doc(companyId).get();
                    return companyDoc.exists
                        ? { id: companyDoc.id, ...companyDoc.data() }
                        : null;
                } catch (err) {
                    console.error('Error fetching company:', err);
                    return null;
                }
            })
        );
        return res.status(200).json({ success: true, data: { id: doc.id, ...doc.data(), companiesData } });
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        return res.status(500).json({ success: false, errorCode: 'INTERNAL_SERVER_ERROR_GET_USER_BY_ID' });
    }
};

const putUpdateGlobalUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const db = await getDb();
        const userRef = db.collection('users').doc(id);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, errorCode: 'GLOBAL_USER_NOT_FOUND' });
        }

        await userRef.update(updateData);
        return res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).json({ success: false, errorCode: 'INTERNAL_SERVER_ERROR_UPDATE_USER' });
    }
};

const deleteGlobalUser = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDb();
        const userRef = db.collection('users2').doc(id);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, errorCode: 'GLOBAL_USER_NOT_FOUND' });
        }

        await userRef.delete();
        return res.status(200).json({ success: true, message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).json({ success: false, errorCode: 'INTERNAL_SERVER_ERROR_DELETE_USER' });
    }
};


module.exports = {
    createGlobalUserWithValidation,
    postCreateGlobalUser,
    getAllGlobalUsers,
    getGlobalUserById,
    putUpdateGlobalUser,
    deleteGlobalUser

}