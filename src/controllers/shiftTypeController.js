const { getDb } = require('../firebase');
const { Timestamp } = require('firebase-admin/firestore');

const getAllShiftType = async (req, res) =>{
    try{
        const {companyId} = req.params;
        const db = await getDb();
        if(!db){
            throw new Error('FireStore has not been initialized');
        }
        const querySnapshot = await db.collection('companies').doc(companyId).collection('shift_types').get();
        const shiftTypeData = await Promise.all(querySnapshot.docs.map(async (doc) =>{
            const shift =  doc.data();
            return {
                id: doc.id,
                ...shift
            }
        }));
        return res.status(200).json({ success: true, data: shiftTypeData });
    }catch(error){
        console.error('Error fetching shift type', error);
        res.status(500).send('Internal Server Error');
    }
};

const getShiftTypeById = async (req, res) =>{
    try{
        const {companyId, shiftTypeId} = req.params;
        const db =  await getDb();
        if(!db){
            throw new Error('FireStore has no been initialized');
        }
        const shiftTypeDoc = await db.collection('companies').doc(companyId).collection('shift_types').doc(shiftTypeId).get();
        if(!shiftTypeDoc.exists){
            return res.status(400).send({
                "success": true,
                "error": {
                    "code": 400,
                    "message": "La compañia que buscas no existe en el momento",
                }
            });
        }
        res.json({id: shiftTypeDoc.id, ...shiftTypeDoc.data()});
    }catch(error){
        console.error('Error fetching shiftType', error);
        res.status(500).send('Internal server error');
    }
};

const postCreateShift = async( req, res)=>{
    try{
        const { companyId } = req.params;
        const db = await getDb();
        if(!db){
            throw new Error('FireStore has no been initialized');
        }
        const { start_time, end_time, ...rest } = req.body;
        const newShiftType = {
            ...rest,
            start_time: start_time ? Timestamp.fromDate(new Date(start_time)) : null,
            end_time: end_time ? Timestamp.fromDate(new Date(end_time)) : null,
        };
        const docRef =  await db.collection('companies').doc(companyId).collection('shift_types').add(newShiftType);
        res.status(201).json({id: docRef.id, ...newShiftType});
    }catch(error){
        console.error('Error creating shiftType', error);
        res.status(500).send('Internal server error');
    }
};

const deleteShiftType = async (req, res) =>{
    try{
        const {companyId, shiftTypeId}= req.params;
        const db = await getDb();
        if(!db){
            throw new Error('FireStore has no been initialized');
        }
        await db.collection('companies').doc(companyId).collection('shift_types').doc(shiftTypeId).delete();
        res.status(204).send();
    }catch(error){
        console.error('Error delete shiftType', error);
        res.status(500).send('Internal server error');
    }

};

const updateShiftType = async (req, res) =>{
    try{
        const { companyId } = req.params;
        const db = await getDb();
        if(!db){
            throw new Error('FireStore has no been initialized');
        }
        const { startTime, endTime, ...rest } = req.body;
        const newShiftType = {
            ...rest,
            startTime: startTime ? Timestamp.fromDate(new Date(startTime)) : null,
            endTime: endTime ? Timestamp.fromDate(new Date(endTime)) : null,
        };
        const docRef =  await db.collection('companies').doc(companyId).collection('shift_types').update(newShiftType);
        res.status(201).json({id: docRef.id, ...newShiftType});

    }catch(error){
        console.error('Error update shiftType', error)
        res.status(500).send('Internal server error');
    }
}

module.exports = {
    getAllShiftType,
    getShiftTypeById,
    postCreateShift,
    deleteShiftType,
    updateShiftType
}