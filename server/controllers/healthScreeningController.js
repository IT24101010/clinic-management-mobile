const HealthScreening = require('../models/HealthScreening');
const User = require('../models/User');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Screen patient health risk
// @route   POST /api/health-screening
// @access  Private
const screenPatient = async (req, res) => {
    try {
        const { age, gender, bmi, bpSystolic, bpDiastolic, glucose, cholesterol, exerciseChestPain } = req.body;

        // 1. Call FastAPI
        let aiResponse;
        try {
            aiResponse = await axios.post(`${AI_SERVICE_URL}/predict-risk`, {
                age,
                gender,
                bmi,
                bp_systolic: bpSystolic,
                bp_diastolic: bpDiastolic,
                glucose,
                cholesterol,
                exercise_chest_pain: exerciseChestPain !== undefined ? exerciseChestPain : -1,
            });
        } catch (error) {
            console.error('AI Service Error:', error.message);
            return res.status(503).json({
                success: false,
                message: 'AI service is currently unavailable. Please try again later.'
            });
        }

        const prediction = aiResponse.data;

        // 2. Save HealthScreening document
        const screening = await HealthScreening.create({
            patient: req.user._id,
            age,
            gender,
            bmi,
            bpSystolic,
            bpDiastolic,
            glucose,
            cholesterol,
            exerciseChestPain: exerciseChestPain !== undefined ? exerciseChestPain : -1,
            riskLevel: prediction.risk_level,
            confidence: prediction.confidence,
            reasons: prediction.reasons,
            diabetesProbability: prediction.diabetes.probability,
            heartDiseaseProbability: prediction.heart_disease.probability,
            disclaimer: prediction.disclaimer
        });

        // 3. Update User if risk is High
        if (prediction.risk_level === 'High') {
            await User.findByIdAndUpdate(req.user._id, { riskLevel: 'High' });
        }

        res.status(201).json({
            success: true,
            data: screening
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get logged in user's screenings
// @route   GET /api/health-screening/my
// @access  Private
const getMyScreenings = async (req, res) => {
    try {
        const screenings = await HealthScreening.find({ patient: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: screenings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get screening by ID
// @route   GET /api/health-screening/:id
// @access  Private
const getScreeningById = async (req, res) => {
    try {
        const screening = await HealthScreening.findById(req.params.id).populate('patient', 'name email');

        if (!screening) {
            return res.status(404).json({
                success: false,
                message: 'Screening not found'
            });
        }

        res.status(200).json({
            success: true,
            data: screening
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get AI model info
// @route   GET /api/health-screening/model-info
// @access  Private/Admin
const getAIModelInfo = async (req, res) => {
    try {
        const aiResponse = await axios.get(`${AI_SERVICE_URL}/model-info`);

        res.status(200).json({
            success: true,
            data: aiResponse.data
        });
    } catch (error) {
        console.error('AI Service Error:', error.message);
        res.status(503).json({
            success: false,
            message: 'AI service is currently unavailable. Please try again later.'
        });
    }
};

module.exports = {
    screenPatient,
    getMyScreenings,
    getScreeningById,
    getAIModelInfo
};
