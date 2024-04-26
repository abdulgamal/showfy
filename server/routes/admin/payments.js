const express = require('express')
const router = express.Router()
const controller = require("../../controllers/admin/payments")
const is_admin = require("../../middleware/admin/is-admin")

router.get('/payments',is_admin, controller.payments);
router.post('/payments',is_admin, controller.payments);

router.get('/payments/transactions/:page?',is_admin, controller.transactions);
router.get('/payments/subscriptions/:page?',is_admin, controller.subscriptions);
router.get('/payments/currencies/update-values',is_admin, controller.updateValues);

router.post("/payments/currencies/save-api",is_admin,controller.saveAPI);
router.get("/payments/currencies/delete/:id",is_admin,controller.deleteCurrency);
router.post('/payments/currencies/default/:id',is_admin, controller.defaultCurrency);
router.get("/payments/approve/:id",is_admin,controller.approveCurrency);
router.use("/payments/currencies/create/:id?",is_admin,controller.createEditCurrency);
router.use('/payments/currencies/:page?',is_admin, controller.currencies);

router.get("/payments/packages/delete/:id",is_admin,controller.delete);
router.get("/payments/delete-bank/:id",is_admin,controller.deleteBank);
router.get("/payments/approve-bank/:id",is_admin,controller.approveBank);
router.get("/payments/packages/create/:id?",is_admin,controller.createEdit);
router.post("/payments/packages/create/:id?",is_admin,controller.createEdit);

router.get("/payments/bank-transfer/:page?",is_admin,controller.bankTransfers);
router.get('/payments/packages/:page?',is_admin, controller.packages);
router.post('/payments/packages',is_admin, controller.packages);

module.exports = router;