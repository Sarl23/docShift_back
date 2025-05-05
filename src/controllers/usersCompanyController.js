const { getDb } = require('../firebase.js');

const getAllUsers = async (req, res) => {
    try {
        const { companyId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('Firestore has not been initialized');
        }
        const querySnapshot = await db.collection('companies').doc(companyId).collection('users').get();
        if (querySnapshot.empty) {
            return res.status(404).json({
                success: false,
                errorCode: 'NO_USERS_FOUND',
            });
        }
        const users = await Promise.all(querySnapshot.docs.map(async doc => {
            const userData = doc.data();
            return {
                userId: doc.id,
                ...userData,
            }
        }));
        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_USERS',
        });
    }
};



// Get user by Id
const getUserById = async (req, res) => {
    try {
        const { companyId, userId } = req.params;
        const db = await getDb();
        if (!db) throw new Error('Firestore has not been initialized');

        const companyDoc = await db.collection('companies').doc(companyId).get();
        if (!companyDoc.exists) {
            return res.status(404).send({
                success: false,
                errorCode: 'INVALID_COMPANY_ID',
            });
        }

        const userDocRef = await db.collection('companies').doc(companyId).collection('users').doc(userId).get();
        if (!userDocRef.exists) {
            return res.status(404).send({
                success: false,
                errorCode: 'INVALID_USER_ID',
            });
        }

        const userData = userDocRef.data();
        res.json({
            success: true,
            data: {
                id: userDocRef.id,
                ...userData,
            },
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_FOUND_USER',
        });
    }
};

// Create a new user
const postCreateUser = async (req, res) => {
    try {
        const { companyId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('Firestore has not been initialized');
        }
        const {userId, ...userData} = req.body;
        if(!userId){
            res.status(400).json({
                success: false,
                errorCode: 'INVALID_USER_ID'
            });
        }
        const userRef = await db.collection('companies').doc(companyId).collection('users').doc(userId);
        const docSnapshot = await userRef.get();
        if (docSnapshot.exists) {
            return res.status(409).json({
                success: false,
                errorCode: 'INVALID_USER_ALREADY_EXISTS',
            });
        }
        await userRef.set({ id: userId, ...userData });
        res.status(201).json({
            success: true,
            data:{ id: userId, ...userData }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_USER_CREATION_IN_COMPANY',
        });
    }
};

//Create a new user with random id automatically
const postCreateUserWithRandomId = async (req, res) => {
    try {
        const { companyId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('Firestore has not been initialized');
        }
        const newUser = req.body;
        const docRef = await db.collection('companies').doc(companyId).collection('users').add(newUser);
        res.status(201).json({
            success: true,
            data: { id: docRef.id, ...newUser }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_ERROR_USER_CREATION_IN_COMPANY',
        });
    }
};


// Update a user for id
const putUpdateUser = async (req, res) => {
    try {
        const { companyId, userId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('Firestore has not been initialized');
        }
        const updatedUser = req.body;
        await db.collection('companies').doc(companyId).collection('users').doc(userId).set(updatedUser, { merge: true });
        res.status(200).json({
            success: true,
            data:{ id: req.params.id, ...updatedUser }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_ERROR_USER_UPDATE',
        });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const { companyId, userId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('Firestore has not been initialized');
        }
        await db.collection('companies').doc(companyId).collection('users').doc(userId).delete();
        res.status(204).send({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_ERROR_USER_DELETED',
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    postCreateUser,
    putUpdateUser,
    deleteUser,
    postCreateUserWithRandomId,
};