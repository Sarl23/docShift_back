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
        return res.status(201).send({
            "success": true,
            "data":shiftData
        });
    } catch (error) {
        console.error('Error getting shift', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_GETTING_SHIFT',
        });
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
            return res.status(404).send({
                success: false,
                errorCode: "INVALID_USER_ID",
            });
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

        return res.status(200).send({
            success: true,
            data: { id: newShiftRef.id, ...newShift }
            
        });
    } catch (error) {
        console.error('Error creating shift', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_CREATING_SHIFT',
        });
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
                success: false,
                errorCode:"INVALID_SHIFT_ID",
            });
        }
        return res.status(201).send({
            success: true,
            data: { id: shiftDoc.id, ...shiftDoc.data() }
            
        });
    } catch (error) {
        console.log('Error fetching shiftTye');
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_GET_SHIFT_BY_ID',
        });
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
        for (const doc of querySnapshot.docs) {
            const user_Id = doc.id?.split('_')[1];
            if (user_Id === userId) {
                const { shift_type_id, ...shiftData } = doc.data();
                let shiftTypeDoc = {};
                if (shift_type_id) {
                    const shiftTypeSnap = await db.collection('companies').doc(companyId).collection('shift_types').doc(shift_type_id).get();
                    shiftTypeDoc = shiftTypeSnap.exists ? shiftTypeSnap.data() : {};
                }
                arrayShiftDataByUser.push({
                    id: doc?.id,
                    descriptionShift: shiftTypeDoc?.description ?? '',
                    nameShift: shiftTypeDoc?.name ?? '',
                    start_timeShift: shiftTypeDoc?.start_time ?? '',
                    end_timeShift: shiftTypeDoc?.end_time ?? '',
                    ...shiftData
                });
            }
        };
        return res.status(201).send({
            success: true,
            data: {
                shiftByUser: arrayShiftDataByUser
            }
        });
    } catch (error) {
        console.error('Error fetching shift by user id', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_GET_SHIFT_BY_USER_ID',
        });
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
        return res.status(201).send({
            success: true,
            response: {
                data: { id: shiftRef.id, ...shiftData }
            }
        });
    } catch (error) {
        console.error('Error updating shift');
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_UPDATING_SHIFT',
        });
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
        return res.status(201).send({
            success: true,
            data : 'Successfully deleted'
        });
    } catch {
        console.error('Error deleting shift');
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_DELETING_SHIFT',
        });
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