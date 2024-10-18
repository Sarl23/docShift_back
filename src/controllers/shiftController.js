const { getDb } = require('../firebase.js');
const { v4: uuidv4 } = require('uuid');

const getAllShift = async (req, res) => {
    try {
        const { companyId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('FireStore has no been initialized');
        }
        const querySnapshot = await db.collection('companies').doc(companyId).collection('shift').get();
        const shiftData = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const shift = doc.data();
            return {
                id: doc.id,
                ...shift
            }
        }));
        res.status(201).json(shiftData);
    } catch (error) {
        console.error('Error getting shift', error);
        res.status(500).send('Internal Server Error getting shift');
    }
};

const postCreateShift = async (req, res) => {
    try {
        const { companyId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new error('FireStore has no been initialized initialized');
        }
        const { user_id, ...newShift } = req.body;
        if (!user_id) {
            res.status(400).json({ error: 'El id del usuario es requerido' });
        }
        const autoGenerateId = uuidv4();
        const formattedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).replace(/\//g, '_');

        const newFormatReference = `${autoGenerateId}_${user_id}_D${formattedDate}`;
        const newShiftRef = await db.collection('companies').doc(companyId).collection('shift').doc(newFormatReference);
        await newShiftRef.set({ id: newShiftRef.id, ...newShift });

        res.status(201).json({ id: newShiftRef.id, ...newShift })
    } catch (error) {
        console.error('Error creating shift', error);
        res.status(500).send('Internal server error creating shift')
    }
};

const getShiftById = async (req, res) => {
    try {
        const { companyId, shiftId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('FireStore has no been initialized');
        }
        const shiftDoc = await db.collection('companies').doc(companyId).collection('shift').doc(shiftId).get();
        if (!shiftDoc.exists) {
            return res.status(400).send({
                "success": true,
                "error": {
                    "code": 400,
                    "message": "Por el momento el turno que buscas no se encuentra",
                }
            });
        }
        res.status(201).json({ id: shiftDoc.id, ...shiftDoc.data() })
    } catch (error) {
        console.log('Error fetching shiftTye');
        res.status(500).send('Internal server error');
    }
};


const getShiftByUserId = async (req, res) => {
    try {
        const { companyId, userId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('FireStore has no been initialized');
        }
        const querySnapshot = await db.collection('companies').doc(companyId).collection('shift').get();
        let arrayShiftDataByUser = []
        querySnapshot.docs.map(doc => {
            const  user_Id = doc.id?.split('_')[1];
            if (user_Id === userId) {
                arrayShiftDataByUser.push({ id: doc?.id, ...doc.data() });
            }
        });
        return res.status(201).send({
            "success": true,
            "data": {
                "code": 201,
                shiftByUser: arrayShiftDataByUser
            }
        });
    } catch (error) {
        console.error('Error fetching shift by user id', error);
        res.status(500).send('Internal server error');
    }

}

const updateShiftById = async (req, res) => {
    try {
        const { companyId, shiftId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('FireStore has no been initialized');
        }
        const shiftData = req.body;
        const shiftRef = await db.collection('companies').doc(companyId).collection('shift').doc(shiftId).update(shiftData);
        res.status(201).json({ id: shiftRef.id, ...shiftData });
    } catch (error) {
        console.error('Error updating shift');
        res.status(500).send('Internal server error');
    }
};

const deleteShift = async (req, res) => {
    try {
        const { companyId, shiftId } = req.params;
        const db = await getDb();
        if (!db) {
            throw new Error('FireStore has no been initialized');
        }
        await db.collection('companies').doc(companyId).collection('shift').doc(shiftId).delete();
        res.status(204).send('Successfully deleted');
    } catch {
        console.error('Error deleting shift');
        res.status(500).send('Internal server error deleting shift');
    }
}

module.exports = {
    getAllShift,
    postCreateShift,
    getShiftById,
    updateShiftById,
    deleteShift,
    getShiftByUserId,
}