const { getDb } = require('../firebase.js');

// Get all de companies
const getAllCompanies = async (req, res) => {
    try {
        const db = await getDb();
        if (!db) {
            throw new Error('Firestore has not been initialized');
        }
        const querySnapshot = await db.collection('companies').get();
        if (querySnapshot.empty) {
            return res.status(404).json({
                success: false,
                errorCode: 'NO_COMPANIES_FOUND',
            });
        }

        const companies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.status(200).json({
            success: true,
            data: companies,
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_COMPANIES',
        });
    }
};

//Get company by id
const getCompanyById = async (req, res) => {
    try {
        const db = await getDb();
        if (!db) {
            throw new error('Firestore has not bee initialized');
        }
        const doc = await db.collection('companies').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).send({
                "success": false,
                "errorCode": "INVALID_COMPANY_ID",
            });
        };
        const company = doc.data();
        res.json({
            "success": true,
            data: {
                id: company.id,
                ...company
            }
        });

    } catch (error) {
        console.error('Error fetching company:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_COMPANY_ID',
        });
    }
};

//Get company by code
const getCompanyByCode = async (req, res) => {

    try {
        const db = await getDb();
        if (!db) {
            throw new error('Firestore has not bee initialized');
        }
        const code = req.params.code;
        const querySnapshot = await db.collection('companies')
            .where('code', '==', code)
            .limit(1)
            .get();
        if (querySnapshot.exists) {
            return res.status(404).send({
                "success": false,
                "errorCode": "INVALID_COMPANY_CODE",
            });
        };
        const doc = querySnapshot.docs[0];
        const company = doc.data();
        return res.status(200).json({
            success: true,
            data: {
                id: doc.id,
                ...company,
            },
        });

    } catch (error) {
        console.error('Error fetching company:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_COMPANY_CODE',
        });
    }
};

//Create company
const postCreateCompany = async (req, res) => {
    try {
        const db = await getDb();
        if (!db) {
            throw new error('Firestore has not bee initialized');
        }
        const newCompany = req.body;
        const docRef = await db.collection('companies').add(newCompany);
        res.status(201).json({
            success: true,
            data: {
                id: docRef.id,
                ...newCompany
            }
        });
    } catch (error) {
        console.error('Error creating company:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_COMPANY_CREATION',
        });
    }
};

//Delete company
const deleteCompany = async (req, res) => {
    try {
        const db = await getDb();
        if (!db) {
            throw new Error('Firestore has not been initialized');
        }
        await db.collection('companies').doc(req.params.id).delete();
        res.status(204).send({
            success: true,
            message: 'Company deleted successfully'
        }
        );
    } catch (error) {
        console.error('Error deleting company:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_DELETED_COMPANY',
        });
    }
};

// Update Company
const putCompanyById = async (req, res) => {
    try {
        const db = await getDb();
        if (!db) {
            throw new Error('Firestore has not bee initialized');
        }
        const updatedCompany = req.body;
        await db.collection('companies').doc(req.params.id).set(updatedCompany, { merge: true });
        res.json({
            success:true,
            data: { 
                id: req.params.id, 
                ...updatedCompany
            },
        });
    } catch (error) {
        console.error('Error updating company:', error);
        return res.status(500).json({
            success: false,
            errorCode: 'INTERNAL_SERVER_ERROR_UPDATING_COMPANY',
        });
    }

};

module.exports = {
    getAllCompanies,
    getCompanyById,
    getCompanyByCode,
    deleteCompany,
    postCreateCompany,
    putCompanyById,
}