/**
 * @swagger
 * components:
 *   schemas:
 *     Request:
 *       type: object
 *       required:
 *         - student
 *         - material
 *         - quantity
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 60d0fe4f5311236168a109ca
 *         student:
 *           type: string
 *           description: Student user ID reference
 *           example: 60d0fe4f5311236168a109ca
 *         material:
 *           type: string
 *           description: Material ID reference
 *           example: 60d0fe4f5311236168a109ca
 *         lab:
 *           type: string
 *           description: Lab ID reference
 *           example: 60d0fe4f5311236168a109ca
 *         quantity:
 *           type: integer
 *           description: Requested quantity
 *           example: 5
 *         purpose:
 *           type: string
 *           description: Purpose of request
 *           example: For final year project
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Request status
 *           example: pending
 *         respondedBy:
 *           type: string
 *           description: Lab assistant who responded
 *           example: 60d0fe4f5311236168a109ca
 *         responseNote:
 *           type: string
 *           description: Response note from assistant
 *           example: Approved for project use
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     RequestCreateRequest:
 *       type: object
 *       required:
 *         - materialId
 *         - quantity
 *       properties:
 *         materialId:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 5
 *         purpose:
 *           type: string
 *           example: For robotics project
 *     
 *     AIRequestSuggestionRequest:
 *       type: object
 *       required:
 *         - projectDescription
 *         - labId
 *       properties:
 *         projectDescription:
 *           type: string
 *           example: I need to build a simple LED circuit with Arduino
 *         labId:
 *           type: string
 *           example: electronics-lab
 *     
 *     AIRequestSuggestionResponse:
 *       type: object
 *       properties:
 *         suggestions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Arduino Uno R3
 *               reason:
 *                 type: string
 *                 example: Microcontroller to control the LED
 *               available:
 *                 type: boolean
 *                 example: true
 *               quantity:
 *                 type: integer
 *                 example: 50
 */

module.exports = {};
