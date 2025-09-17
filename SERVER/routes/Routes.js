const {Router} = require("express")
const {registerVoter, loginVoter, getVoter, verifyVoter, getCurrentVoter} = require("../controllers/voterController")


const {addElection, getElections, getElection, updateElection, removeElection, getCandidatesOfElection, getElectionVoters, getElectionsByDistrict} = require("../controllers/electionController")
const {addCandidate, getCandidate, removeCandidate, voteCandidate} = require("../controllers/candidateController")
const {addDistrict, getDistricts, getDistrict, updateDistrict, removeDistrict, getDistrictElections, getDistrictResults} = require("../controllers/districtController")

const authMiddleware = require('../middleware/authMiddleware')

const router = Router()



router.post('/voters/register',registerVoter);
router.post('/voters/login',loginVoter);
router.get('/voters/:id',authMiddleware, getVoter);
router.get('/current', authMiddleware, getCurrentVoter);
router.post('/voters/verify', authMiddleware, verifyVoter);

router.get('/districts/:id/elections', getElectionsByDistrict);
router.post('/elections',authMiddleware, addElection)
router.get('/elections',authMiddleware, getElections)
router.get('/elections/:id',authMiddleware, getElection)
router.delete('/elections/:id',authMiddleware, removeElection)
router.patch('/elections/:id',authMiddleware, updateElection)
router.get('/elections/:id/candidates',authMiddleware, getCandidatesOfElection)
router.get('/elections/:id/voters',authMiddleware, getElectionVoters)

router.post('/candidates',authMiddleware, addCandidate)
router.get('/candidates/:id',authMiddleware,getCandidate)
router.delete('/candidates/:id',authMiddleware,removeCandidate)
router.patch('/candidates/:id',authMiddleware, voteCandidate)

// New district routes
router.post('/districts', authMiddleware, addDistrict)
router.get('/districts', authMiddleware, getDistricts)
router.get('/districts/:id', authMiddleware, getDistrict)
router.patch('/districts/:id', authMiddleware, updateDistrict)
router.delete('/districts/:id', authMiddleware, removeDistrict)
router.get('/districts/:id/elections', authMiddleware, getDistrictElections)
router.get('/districts/:id/results', authMiddleware, getDistrictResults)

module.exports = router